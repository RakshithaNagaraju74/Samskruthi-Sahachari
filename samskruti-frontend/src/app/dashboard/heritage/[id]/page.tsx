"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { heritageService, HeritageSite } from "@/services/heritageService";

interface PageProps {
  params: {
    id: string;
  };
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
  StarOutline: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
};

export default function HeritageDetailPage({ params }: PageProps) {
  const { isDarkMode } = useTheme();
  const { user, profile } = useUser();
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

  useEffect(() => {
    const fetchSite = async () => {
      try {
        setLoading(true);
        const id = parseInt(params.id);
        const data = await heritageService.getSiteById(id);
        
        if (data) {
          setSite(data);
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

    if (params.id) {
      fetchSite();
    }
  }, [params.id, router]);

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
      const result = await heritageService.bookSite(
        user.id,
        site!.id,
        bookingData.travelDate,
        bookingData.travelers,
        bookingData.specialRequests
      );

      if (result.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setBookingData({ travelDate: '', travelers: 1, specialRequests: '' });
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
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
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
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
          >
            <Icons.Back />
            <span>Back to Dashboard</span>
          </button>

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
                />
                {site.type === 'UNESCO World Heritage' && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    UNESCO World Heritage
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
                <span>{site.location}, {site.district} District</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icons.Star key={star} />
                  ))}
                  <span className="ml-2 text-sm">(4.5)</span>
                </div>
                <span className="text-emerald-500 font-bold text-2xl">
                  ₹{site.entry_fee_indian || 0}
                </span>
              </div>

              <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {site.description}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <Icons.Clock />
                  <p className="text-sm mt-1">Built: {site.built_in}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <Icons.Users />
                  <p className="text-sm mt-1">By: {site.built_by}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <Icons.Calendar />
                  <p className="text-sm mt-1">Best Time: {site.best_time_to_visit}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <Icons.Clock />
                  <p className="text-sm mt-1">Duration: {site.duration_required}</p>
                </div>
              </div>

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
                  {site.enterprise.company_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{site.enterprise.company_name}</h3>
                  <p className="text-sm opacity-75 flex items-center gap-2">
                    {site.enterprise.verified && (
                      <>
                        <span className="text-emerald-500">✓ Verified Partner</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Highlights */}
          {site.highlights && site.highlights.length > 0 && (
            <div className={`mb-8 p-6 rounded-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
            }`}>
              <h2 className="text-xl font-medium mb-4">Highlights</h2>
              <div className="grid grid-cols-2 gap-3">
                {site.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className={`mb-8 p-6 rounded-xl ${
            isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
          }`}>
            <h2 className="text-xl font-medium mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Icons.Phone />
                <span>{site.contact_phone || '+91 80 4123 4567'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Icons.Mail />
                <span>{site.contact_email || 'bookings@karnatakaheritage.com'}</span>
              </div>
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
                  <p className="mb-4">Your booking has been confirmed. Check your email for details.</p>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Book Your Visit</h2>
                  <p className="mb-6">{site.name}</p>

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