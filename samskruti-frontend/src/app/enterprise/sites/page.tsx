"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface Site {
  id: string;
  name: string;
  location: string;
  district?: string;
  state: string;
  description: string;
  short_description: string;
  image: string;
  gallery_images?: string[];
  category: string;
  subcategory?: string;
  site_type?: string;
  built_in?: string;
  built_by?: string;
  architectural_style?: string;
  significance?: string;
  entry_fee_indian?: number;
  entry_fee_foreigner?: number;
  opening_time?: string;
  closing_time?: string;
  best_time_to_visit?: string;
  duration_required?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  is_active: boolean;
  is_featured: boolean;
  is_unesco: boolean;
  rating: number | string | null;
  total_reviews: number;
  views: number;
  tags?: string[];
  highlights?: string[];
  created_at: string;
}

export default function EnterpriseSitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  
  // Add enterprise status state
  const [enterpriseStatus, setEnterpriseStatus] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    fetchSites();
  }, [router]);

  useEffect(() => {
    // Apply filters
    let filtered = [...sites];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(site => 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(site => 
        statusFilter === "active" ? site.is_active : !site.is_active
      );
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(site => site.category === categoryFilter);
    }
    
    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter, categoryFilter]);

  // Updated fetchSites function with enterprise status
  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/enterprise/sites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSites(data.data);
        setFilteredSites(data.data);
        setEnterpriseStatus(data.enterprise_status);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.data.map((site: Site) => site.category).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (siteId: string, imagePath: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/enterprise/sites/${siteId}/images`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imagePath })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh sites list
        fetchSites();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Updated getStatusBadge function with enterprise verification
  const getStatusBadge = (isActive: boolean) => {
    // If enterprise is verified, all sites are active
    if (enterpriseStatus === 'approved') {
      return (
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium">
          Active
        </span>
      );
    } else {
      // For unverified enterprises, show based on is_active
      return isActive ? (
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium">
          Active
        </span>
      ) : (
        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
          Pending Approval
        </span>
      );
    }
  };

  // Helper function to format rating safely
  const formatRating = (rating: number | string | null | undefined): string => {
    if (rating === null || rating === undefined) return '0.0';
    
    // If it's a number, format with 1 decimal
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }
    
    // If it's a string, try to parse it
    if (typeof rating === 'string') {
      const parsed = parseFloat(rating);
      if (!isNaN(parsed)) {
        return parsed.toFixed(1);
      }
    }
    
    return '0.0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/enterprise/dashboard" className="text-gray-400 hover:text-white">
                ← Dashboard
              </Link>
              <h1 className="text-xl text-white">Manage Heritage Sites</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/enterprise/sites/new"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <span>+</span> Add New Site
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enterprise Status Banner */}
        {enterpriseStatus === 'approved' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6">
            <p className="text-emerald-400 text-sm">
              ✅ Your enterprise is verified! New sites you add will be automatically approved and go live immediately.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              ⏳ Your enterprise is pending verification. Sites you add will need admin approval before going live.
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Sites</p>
            <p className="text-2xl text-white font-light">{sites.length}</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Active Sites</p>
            <p className="text-2xl text-emerald-400 font-light">
              {sites.filter(s => s.is_active).length}
            </p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Pending Approval</p>
            <p className="text-2xl text-yellow-400 font-light">
              {sites.filter(s => !s.is_active).length}
            </p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Views</p>
            <p className="text-2xl text-blue-400 font-light">
              {sites.reduce((sum, site) => sum + (site.views || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, location..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Sites</option>
                <option value="active">Active Only</option>
                <option value="inactive">Pending Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
            <span className="text-6xl mb-4 block">🏛️</span>
            <h3 className="text-xl text-white mb-2">No Sites Found</h3>
            <p className="text-gray-400 mb-6">
              {sites.length === 0 
                ? "You haven't added any heritage sites yet." 
                : "No sites match your filters."}
            </p>
            {sites.length === 0 && (
              <Link
                href="/enterprise/sites/new"
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg inline-block hover:bg-emerald-600"
              >
                Add Your First Site
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all group"
              >
                <div className="relative h-48">
                  {site.image ? (
                    <Image
                      src={`http://localhost:5000/${site.image}`}
                      alt={site.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-4xl">🏛️</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {getStatusBadge(site.is_active)}
                    {site.is_featured && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    )}
                    {site.is_unesco && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-medium">
                        UNESCO
                      </span>
                    )}
                  </div>
                  {/* Only show pending overlay for unverified enterprises with inactive sites */}
                  {!site.is_active && enterpriseStatus !== 'approved' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-3 py-1 bg-yellow-500/20 rounded-full">
                        Pending Approval
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">{site.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span>★</span>
                      <span className="text-sm">{formatRating(site.rating)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
                    <span>📍</span> {site.location}, {site.state}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {site.category && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                        {site.category}
                      </span>
                    )}
                    {site.duration_required && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">
                        ⏱️ {site.duration_required}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                        👁️ {site.views || 0} views
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                    {site.short_description || site.description?.substring(0, 100) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div>
                      <span className="text-emerald-400 font-medium">
                        {site.entry_fee_indian ? `₹${site.entry_fee_indian}` : 'Price on request'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/enterprise/sites/${site.id}`}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/enterprise/sites/${site.id}/edit`}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}