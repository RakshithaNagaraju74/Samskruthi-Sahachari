// context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

interface UserProfile {
  id?: number;
  user_id: number;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  profile_image?: string;
  preferred_language?: string;
  interests?: string[];
  created_at?: string;
  updated_at?: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, clearing user data');
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log('Fetching user data with token...');
      
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 401) {
        console.log('Token expired or invalid');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setProfile(null);
        router.push('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Raw API response:', responseData);
      
      // Check if the response has the expected structure
      if (responseData.success && responseData.data) {
        const userData = responseData.data.user;
        const profileData = responseData.data.profile;
        
        if (userData) {
          const formattedUser: User = {
            id: userData.id,
            email: userData.email,
            role: userData.role || 'user',
            is_active: userData.is_active !== false,
            is_verified: userData.is_verified || false,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: userData.updated_at || new Date().toISOString(),
            last_login: userData.last_login || null
          };
          
          console.log('Setting user:', formattedUser);
          setUser(formattedUser);
          localStorage.setItem('user', JSON.stringify(formattedUser));
        }
        
        if (profileData) {
          const formattedProfile: UserProfile = {
            id: profileData.id,
            user_id: profileData.user_id || userData?.id,
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            date_of_birth: profileData.date_of_birth || '',
            gender: profileData.gender || '',
            city: profileData.city || '',
            state: profileData.state || '',
            country: profileData.country || 'India',
            profile_image: profileData.profile_image || '',
            preferred_language: profileData.preferred_language || 'English',
            interests: profileData.interests || [],
            created_at: profileData.created_at,
            updated_at: profileData.updated_at
          };
          
          console.log('Setting profile:', formattedProfile);
          setProfile(formattedProfile);
        }
      } else {
        console.warn('API returned unexpected structure:', responseData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('UserProvider init - Token exists:', !!token);
    
    if (token) {
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Restored user from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      // Always fetch fresh data
      fetchUserData();
    } else {
      console.log('No token found, setting loading to false');
      setIsLoading(false);
    }
  }, [fetchUserData]);

  const refreshUserData = async () => {
    console.log('Refreshing user data...');
    setIsLoading(true);
    await fetchUserData();
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      console.log('Updating profile with data:', data);

      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Profile update response:', result);
      
      if (result.success) {
        // Refresh user data to get updated profile
        await refreshUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    router.push('/auth');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      updateProfile, 
      logout,
      refreshUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};