"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { heritageService, HeritageSite } from "@/services/heritageService";
import { bookingService } from "@/services/bookingService";
import { userService } from "@/services/userService";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Icons
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Location: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Phone: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Star: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  HeartFilled: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
};

export default function HeritageDetailPage({ params }: PageProps) {
  const { isDarkMode } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [site, setSite] = useState<HeritageSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    travelDate: '',
    travelers: 1,
    specialRequests: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'reviews'>('overview');
  const [siteId, setSiteId] = useState<number | null>(null);

  // Unwrap params promise
  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        setSiteId(parseInt(resolvedParams.id));
      } catch (error) {
        console.error('Error unwrapping params:', error);
        router.push('/dashboard');
      }
    };
    
    unwrapParams();
  }, [params, router]);

  // Fetch site data when siteId is available
  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return;
      
      try {
        setLoading(true);
        const data = await heritageService.getSiteById(siteId);
        
        if (data) {
          setSite(data);
          
          // Check if site is in wishlist
          if (user) {
            // You can implement wishlist check here
          }
        } else {
          console.error('Site not found');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching site:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [siteId, router, user]);

  const handleBookNow = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!bookingData.travelDate) {
      setBookingError('Please select a travel date');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const result = await bookingService.createBooking({
        user_id: user.id,
        site_id: site!.id,
        travel_date: bookingData.travelDate,
        travelers: bookingData.travelers,
        total_amount: (site!.entry_fee_indian || 0) * bookingData.travelers,
        special_requests: bookingData.specialRequests
      });

      if (result.success && result.booking) {
        setBookingSuccess(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setBookingData({ travelDate: '', travelers: 1, specialRequests: '' });
          router.push('/dashboard/tickets');
        }, 3000);
      } else {
        setBookingError(result.error || 'Booking failed');
      }
    } catch (error) {
      setBookingError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (isWishlisted) {
      const removed = await userService.removeFromWishlist(site!.id);
      if (removed) setIsWishlisted(false);
    } else {
      const added = await userService.addToWishlist(site!.id);
      if (added) setIsWishlisted(true);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Site Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = site.gallery_images?.length ? site.gallery_images : [site.main_image];
  const defaultImage = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800';

  return (
    <div className={`min-h-screen font-sans ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    }`}>
      
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Back Button and Actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
              }`}
            >
              <Icons.Back />
              <span>Back</span>
            </button>
            
            {user && (
              <button
                onClick={handleToggleWishlist}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
                }`}
              >
                {isWishlisted ? <Icons.HeartFilled /> : <Icons.Heart />}
              </button>
            )}
          </div>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Image Gallery */}
            <div>
              <div className="relative h-96 rounded-xl overflow-hidden mb-4">
                <Image
                  src={images[selectedImage] || defaultImage}
                  alt={site.name}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {site.is_unesco && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    UNESCO World Heritage
                  </div>
                )}
                {site.rating && site.rating > 0 && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <span>⭐</span>
                    <span>{site.rating.toFixed(1)}</span>
                    {site.total_reviews && <span>({site.total_reviews})</span>}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 rounded-lg overflow-hidden ${
                        selectedImage === idx ? 'ring-2 ring-emerald-500' : ''
                      }`}
                    >
                      <Image
                        src={img || defaultImage}
                        alt={`${site.name} - ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 768px) 25vw, 10vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Site Info */}
            <div>
              <h1 className="text-4xl font-light mb-2">{site.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Icons.Location />
                <span>{site.location}{site.district ? `, ${site.district} District` : ''}</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-emerald-500 font-bold text-2xl">
                  {site.display_price || `₹${site.entry_fee_indian || 0}`}
                </span>
                {site.duration_required && (
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    • {site.duration_required}
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                {(['overview', 'highlights', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-1 capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-emerald-500 border-b-2 border-emerald-500'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {tab} {tab === 'reviews' && site.total_reviews ? `(${site.total_reviews})` : ''}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  {activeTab === 'overview' && (
                    <>
                      <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {site.description}
                      </p>
                      
                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {site.built_in && (
                          <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                            <p className="text-xs opacity-70">Built</p>
                            <p className="text-sm font-medium">{site.built_in}</p>
                          </div>
                        )}
                        {site.built_by && (
                          <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                            <p className="text-xs opacity-70">By</p>
                            <p className="text-sm font-medium">{site.built_by}</p>
                          </div>
                        )}
                        {site.architectural_style && (
                          <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                            <p className="text-xs opacity-70">Style</p>
                            <p className="text-sm font-medium">{site.architectural_style}</p>
                          </div>
                        )}
                        {site.best_time_to_visit && (
                          <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                            <p className="text-xs opacity-70">Best Time</p>
                            <p className="text-sm font-medium">{site.best_time_to_visit}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {activeTab === 'highlights' && site.highlights && site.highlights.length > 0 && (
                    <ul className="space-y-2">
                      {site.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Reviews coming soon...
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Book Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Enterprise Info */}
          {site.enterprise && (
            <div className={`mb-8 p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
            }`}>
              <h2 className="text-xl font-medium mb-4">Organized by</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                  {site.enterprise.company_name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h3 className="font-bold">{site.enterprise.company_name}</h3>
                  {site.enterprise.verified && (
                    <p className="text-sm text-emerald-500 flex items-center gap-1 mt-1">
                      <span>✓</span> Verified Partner
                    </p>
                  )}
                  {(site.enterprise.contact_phone || site.enterprise.contact_email) && (
                    <div className="mt-2 space-y-1">
                      {site.enterprise.contact_phone && (
                        <p className="text-sm flex items-center gap-2">
                          <Icons.Phone /> {site.enterprise.contact_phone}
                        </p>
                      )}
                      {site.enterprise.contact_email && (
                        <p className="text-sm flex items-center gap-2">
                          <Icons.Mail /> {site.enterprise.contact_email}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(site.contact_phone || site.contact_email || site.website) && (
            <div className={`mb-8 p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
            }`}>
              <h2 className="text-xl font-medium mb-4">Contact Information</h2>
              <div className="space-y-3">
                {site.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Icons.Phone />
                    <span>{site.contact_phone}</span>
                  </div>
                )}
                {site.contact_email && (
                  <div className="flex items-center gap-3">
                    <Icons.Mail />
                    <span>{site.contact_email}</span>
                  </div>
                )}
                {site.website && (
                  <div className="flex items-center gap-3">
                    <Icons.Book />
                    <a href={site.website} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {site.tags && site.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {site.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-200"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-md w-full rounded-xl ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } p-6 shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Check />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Booking Successful!</h3>
                  <p className="mb-4">Your booking has been confirmed. Check your tickets page for details.</p>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      router.push('/dashboard/tickets');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    View Tickets
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Book Your Visit</h2>
                  <p className="mb-2">{site.name}</p>
                  <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {site.location}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Travel Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData.travelDate}
                        onChange={(e) => setBookingData({...bookingData, travelDate: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700" 
                            : "bg-white border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                      <select
                        value={bookingData.travelers}
                        onChange={(e) => setBookingData({...bookingData, travelers: parseInt(e.target.value)})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700" 
                            : "bg-white border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'Persons'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700" 
                            : "bg-white border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="Any special requirements..."
                      />
                    </div>

                    {bookingError && (
                      <p className="text-red-500 text-sm">{bookingError}</p>
                    )}

                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                      <div className="flex justify-between mb-2">
                        <span>Price per person</span>
                        <span>₹{site.entry_fee_indian || 0}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-emerald-500">
                          ₹{(site.entry_fee_indian || 0) * bookingData.travelers}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBookNow}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}