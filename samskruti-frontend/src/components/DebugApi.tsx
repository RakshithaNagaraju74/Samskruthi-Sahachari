// components/DebugApi.tsx
"use client";

import { useEffect, useState } from 'react';
import { heritageService } from '@/services/heritageService';

export default function DebugApi() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAPI = async () => {
      try {
        console.log('🔍 Checking API connection...');
        
        // Test 1: Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? '✅ Present' : '❌ Missing');
        
        if (token) {
          console.log('Token preview:', token.substring(0, 20) + '...');
        }

        // Test 2: Try to fetch heritage sites
        console.log('Attempting to fetch heritage sites...');
        const sites = await heritageService.getAllSites();
        
        console.log('Heritage sites response:', sites);
        
        setApiStatus({
          token: !!token,
          sitesCount: sites.length,
          firstSite: sites[0] || null,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('API Debug Error:', error);
        setApiStatus({ error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    checkAPI();
  }, []);

  if (loading) return <div className="p-4 bg-yellow-100">Checking API...</div>;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md bg-white rounded-lg shadow-xl p-4 border-2 border-blue-500 text-sm">
      <h3 className="font-bold text-lg mb-2">🔧 API Debug Info</h3>
      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">
        {JSON.stringify(apiStatus, null, 2)}
      </pre>
    </div>
  );
}