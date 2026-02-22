// services/heritageService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface HeritageSite {
  id: number;
  name: string;
  description: string;
  short_description: string;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  era: string;
  built_in: string;
  built_by: string;
  architectural_style: string;
  significance: string;
  category: string;
  subcategory: string;
  type: string;
  main_image: string;
  gallery_images: string[];
  entry_fee_indian: number;
  entry_fee_foreigner: number;
  camera_fee: number;
  opening_time: string;
  closing_time: string;
  closed_on: string;
  best_time_to_visit: string;
  duration_required: string;
  parking_available: boolean;
  guide_available: boolean;
  wheelchair_accessible: boolean;
  museum_available: boolean;
  cafeteria_available: boolean;
  restroom_available: boolean;
  contact_phone: string;
  contact_email: string;
  website: string;
  tags: string[];
  highlights: string[];
  enterprise_id: number;
  enterprise: {
    id: number;
    company_name: string;
    verified: boolean;
  };
  is_featured: boolean;
  visited?: boolean;
  booked?: boolean;
}

class HeritageService {
  private sitesCache: HeritageSite[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async getAllSites(forceRefresh = false): Promise<HeritageSite[]> {
    const now = Date.now();
    if (!forceRefresh && this.sitesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Returning cached heritage sites');
      return this.sitesCache;
    }

    try {
      const url = `${API_URL}/heritage/sites`;
      console.log('Fetching heritage sites from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Loaded ${data.data.length} heritage sites from API`);
      
      this.sitesCache = data.data;
      this.cacheTimestamp = now;
      
      return data.data;
    } catch (error) {
      console.error('Error fetching heritage sites:', error);
      return [];
    }
  }

  async getSiteById(id: number): Promise<HeritageSite | null> {
    try {
      const response = await fetch(`${API_URL}/heritage/sites/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching heritage site:', error);
      return null;
    }
  }

  async getUNESCOSites(): Promise<HeritageSite[]> {
    try {
      const response = await fetch(`${API_URL}/heritage/unesco`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching UNESCO sites:', error);
      return [];
    }
  }

  async getSitesByCategory(category: string): Promise<HeritageSite[]> {
    try {
      const response = await fetch(`${API_URL}/heritage/sites/category/${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching sites by category:', error);
      return [];
    }
  }

  getSitesWithCoordinates(sites: HeritageSite[]): HeritageSite[] {
    return sites.filter(site => 
      site.latitude && 
      site.longitude && 
      !isNaN(site.latitude) && 
      !isNaN(site.longitude)
    );
  }
}

export const heritageService = new HeritageService();