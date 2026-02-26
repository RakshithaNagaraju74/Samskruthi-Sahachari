"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { userService, WishlistItem } from "@/services/userService";

// Icons
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  HeartFilled: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>,
  Location: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Error: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
};

export default function FavouritesPage() {
  const { isDarkMode } = useTheme();
  const { user, isLoading } = useUser();
  const router = useRouter();
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [filteredWishlist, setFilteredWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Handle authentication
  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      console.log('No user found, redirecting to auth');
      router.replace('/auth');
      return;
    }
    
    console.log('User authenticated, fetching wishlist');
    fetchWishlist();
  }, [user, isLoading, router]);

  // Filter wishlist based on search and category
  // Update the filtering useEffect
useEffect(() => {
  // Ensure wishlist is an array before spreading
  const wishlistArray = Array.isArray(wishlist) ? wishlist : [];
  let filtered = [...wishlistArray];
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.site_name?.toLowerCase().includes(query) ||
      item.site_location?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }
  
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(item => 
      item.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }
  
  setFilteredWishlist(filtered);
}, [wishlist, searchQuery, selectedCategory]);

  // app/dashboard/favourites/page.tsx - Updated fetchWishlist function

const fetchWishlist = async () => {
  setLoading(true);
  setFetchError(null);
  try {
    console.log('Calling userService.getWishlist()...');
    const data = await userService.getWishlist();
    console.log('Wishlist data received:', data);
    
    // Ensure data is an array
    const wishlistArray = Array.isArray(data) ? data : [];
    console.log('Processed wishlist array:', wishlistArray);
    
    setWishlist(wishlistArray);
    setFilteredWishlist(wishlistArray);
    
    // Extract unique categories - safely
    if (wishlistArray.length > 0) {
      const categoriesSet = new Set<string>();
      wishlistArray.forEach(item => {
        if (item.category) {
          categoriesSet.add(item.category);
        }
      });
      const uniqueCategories = Array.from(categoriesSet);
      console.log('Unique categories:', uniqueCategories);
      setCategories(uniqueCategories);
    } else {
      setCategories([]);
    }
    
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    setFetchError(error.message || 'Failed to load favourites');
    // Reset to empty arrays on error
    setWishlist([]);
    setFilteredWishlist([]);
    setCategories([]);
  } finally {
    setLoading(false);
  }
};

  const handleRemoveFromWishlist = async (siteId: number | undefined) => {
    if (!siteId) {
      console.error('Cannot remove: siteId is undefined');
      return;
    }
    
    setRemovingId(siteId);
    try {
      const removed = await userService.removeFromWishlist(siteId);
      if (removed) {
        setWishlist(prev => prev.filter(item => item.site_id !== siteId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewSite = (siteId: number | undefined) => {
    if (!siteId) {
      console.error('Cannot view: siteId is undefined');
      return;
    }
    router.push(`/dashboard/heritage/${siteId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatRating = (rating: any): string => {
    if (!rating && rating !== 0) return '';
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    return !isNaN(numRating) && numRating > 0 ? numRating.toFixed(1) : '';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen font-sans ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    }`}>
      
      <header className={`fixed top-0 right-0 left-0 z-40 h-16 border-b backdrop-blur-md ${
        isDarkMode ? "border-gray-800/50 bg-gray-900/50" : "border-gray-200/50 bg-white/50"
      }`}>
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <Icons.Back />
            </button>
            <h1 className="text-xl font-light">My Favourites</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </span>
            <button
              onClick={fetchWishlist}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              title="Refresh"
            >
              <Icons.Refresh />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search favourites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 pl-11 rounded-xl text-sm border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.Search />
              </span>
            </div>

            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-3 rounded-xl text-sm border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : fetchError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-20 rounded-2xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-xl`}
            >
              <div className="text-8xl mb-6 text-red-500">!</div>
              <h3 className="text-2xl font-light mb-3">Error Loading Favourites</h3>
              <p className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {fetchError}
              </p>
              <button
                onClick={fetchWishlist}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredWishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-20 rounded-2xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-xl`}
            >
              <div className="text-8xl mb-6">❤️</div>
              <h3 className="text-2xl font-light mb-3">No favourites yet</h3>
              <p className={`text-sm mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "Start adding heritage sites to your favourites"}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Explore Heritage Sites
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWishlist.map((item, index) => {
                const formattedRating = formatRating(item.rating);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => handleViewSite(item.site_id)}
                  >
                    <div className={`relative rounded-xl overflow-hidden ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } shadow-lg hover:shadow-xl transition-all`}>
                      
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.site_image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800'}
                          alt={item.site_name || 'Heritage site'}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="eager"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800';
                          }}
                        />
                        
                        {item.category && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                              {item.category}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWishlist(item.site_id);
                          }}
                          disabled={removingId === item.site_id}
                          className="absolute top-3 right-3 p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {removingId === item.site_id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Icons.Trash />
                          )}
                        </button>

                        {formattedRating && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                            <Icons.Star />
                            <span className="text-white text-xs">{formattedRating}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold mb-1 truncate">{item.site_name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                          <Icons.Location />
                          <span className="truncate">{item.site_location}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                            Added {formatDate(item.created_at)}
                          </span>
                          <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}