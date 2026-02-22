// types/index.ts
export interface User {
  id: number;
  email: string;
  user_type: 'user' | 'enterprise' | 'seller';
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture?: string;
  preferences?: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  favorite_categories?: string[];
  preferred_season?: string[];
  budget_range?: string;
  travel_style?: string[];
}

export interface Enterprise {
  id: number;
  company_name: string;
  business_type: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface Destination {
  id: number;
  name: string;
  location: string;
  state: string;
  image: string;
  images?: string[];
  price: string;
  numeric_price?: number;
  rating: number;
  review_count?: number;
  category: 'heritage' | 'nature' | 'beach' | 'wildlife' | 'culture' | 'food' | 'shopping' | 'adventure' | 'wellness';
  subcategory: string;
  duration: string;
  bestTime: string;
  description: string;
  longDescription?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags: string[];
  highlights?: string[];
  nearbyAttractions?: number[];
  eateries?: Eatery[];
  crafting?: CraftingPlace[];
  
  // Enterprise specific fields
  enterprise_id?: number;
  enterprise?: Enterprise;
  isEnterpriseAdded?: boolean;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  entry_fee?: string;
  open_timing?: string;
  closed_on?: string;
  min_duration?: string;
  max_guests?: number;
  includes?: string[];
  excludes?: string[];
}

export interface EnterpriseDestination {
  id: number;
  enterprise_id: number;
  name: string;
  location: string;
  state: string;
  description: string;
  long_description: string;
  image: string;
  images: string[];
  price: string;
  numeric_price: number;
  category: string;
  subcategory: string;
  duration: string;
  best_time: string;
  tags: string[];
  highlights: string[];
  entry_fee: string;
  open_timing: string;
  closed_on: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  min_duration?: string;
  max_guests?: number;
  includes?: string[];
  excludes?: string[];
  is_approved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  enterprise: Enterprise;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_id: string;
  destination_id: number;
  destination?: Destination;
  user_id: number;
  enterprise_id?: number;
  booking_date: string;
  travel_date: string;
  travelers: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  special_requests?: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  user?: UserProfile;
  destination_id: number;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  visit_date?: string;
  images?: string[];
  helpful_count: number;
  created_at: string;
}

export interface Eatery {
  id: number;
  name: string;
  destinationId: number;
  type: 'restaurant' | 'cafe' | 'street food';
  cuisine: string[];
  price_range: string;
  rating: number;
  image: string;
  description?: string;
  location?: string;
  contact?: string;
  timing?: string;
  mustTry?: string[];
  delivery_available?: boolean;
  outdoor_seating?: boolean;
  vegetarian_only?: boolean;
}

export interface CraftingPlace {
  id: number;
  name: string;
  destinationId: number;
  type: 'workshop' | 'store' | 'gallery' | 'factory';
  craft: string;
  price_range: string;
  rating: number;
  image: string;
  description?: string;
  location?: string;
  contact?: string;
  timing?: string;
  website?: string;
  workshop_available?: boolean;
  workshop_price?: string;
}