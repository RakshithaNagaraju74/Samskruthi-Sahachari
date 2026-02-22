// app/dashboard/destination/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { destinationService, Destination } from "@/services/destinationService";

export default function DestinationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user, profile } = useUser();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    travel_date: '',
    travelers: 1,
    special_requests: '',
    contact_phone: profile?.phone || '',
    contact_email: user?.email || '',
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      setIsLoading(true);
      try {
        const response = await destinationService.getDestinationById(Number(id));
        if (response.success && response.data) {
          setDestination(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDestination();
    }
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    
    try {
      const response = await destinationService.createBooking({
        destination_id: Number(id),
        ...bookingData
      });
      
      if (response.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/bookings');
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <h2 className="text-2xl mb-2">Destination not found</h2>
          <button
            onClick={() => router.back()}
            className="text-emerald-500 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const allImages = destination.images?.length ? destination.images : [destination.image];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-lg ${
        isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              ← Back
            </button>
            <h1 className="text-xl font-light truncate">{destination.name}</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Image */}
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src={allImages[selectedImage] || destination.image}
                alt={destination.name}
                fill
                className="object-cover"
              />
              
              {/* Enterprise Badge */}
              {destination.enterprise && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-emerald-400">🏢</span>
                  <span className="text-white text-sm font-medium">
                    {destination.enterprise.company_name}
                  </span>
                  {destination.enterprise.verified && (
                    <span className="text-emerald-400 text-sm">✓ Verified</span>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      selectedImage === idx ? 'ring-2 ring-emerald-500' : ''
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${destination.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className="text-xl font-light mb-4">About this experience</h2>
              <p className={`leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {destination.long_description || destination.description}
              </p>

              {/* Highlights */}
              {destination.highlights && destination.highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Highlights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {destination.highlights.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {destination.tags && destination.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enterprise Details */}
            {destination.enterprise && (
              <div className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h2 className="text-xl font-light mb-4">About the Provider</h2>
                <div className="flex items-start gap-4">
                  {destination.enterprise.logo && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={destination.enterprise.logo}
                        alt={destination.enterprise.company_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {destination.enterprise.company_name}
                      {destination.enterprise.verified && (
                        <span className="ml-2 text-emerald-500 text-sm">✓ Verified</span>
                      )}
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {destination.enterprise.description}
                    </p>
                    <div className="mt-3 space-y-1">
                      {destination.enterprise.phone && (
                        <p className="text-sm flex items-center gap-2">
                          <span>📞</span> {destination.enterprise.phone}
                        </p>
                      )}
                      {destination.enterprise.email && (
                        <p className="text-sm flex items-center gap-2">
                          <span>📧</span> {destination.enterprise.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className="text-xl font-light mb-4">Book This Experience</h2>

              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-lg font-medium mb-2">Booking Successful!</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Redirecting to your bookings...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  
                  {/* Price Display */}
                  <div className="text-center py-4 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }">
                    <span className="text-sm text-gray-500">Starting from</span>
                    <div className="text-3xl font-bold text-emerald-500">
                      {destination.price}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      per person • {destination.duration}
                    </span>
                  </div>

                  {/* Travel Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Travel Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.travel_date}
                      onChange={e => setBookingData({...bookingData, travel_date: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>

                  {/* Travelers */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Travelers *</label>
                    <select
                      required
                      value={bookingData.travelers}
                      onChange={e => setBookingData({...bookingData, travelers: Number(e.target.value)})}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Traveler' : 'Travelers'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={bookingData.contact_phone}
                      onChange={e => setBookingData({...bookingData, contact_phone: e.target.value})}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Your phone number"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Special Requests</label>
                    <textarea
                      value={bookingData.special_requests}
                      onChange={e => setBookingData({...bookingData, special_requests: e.target.value})}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Any special requirements?"
                    />
                  </div>

                  {/* Book Button */}
                  <button
                    type="submit"
                    disabled={isBooking}
                    className={`w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transition-all ${
                      isBooking ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isBooking ? 'Processing...' : `Book Now - ${destination.price}`}
                  </button>

                  <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    You won't be charged yet
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}