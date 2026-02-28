"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { heritageService, HeritageSite, Review, SiteProduct } from "@/services/heritageService"; // added SiteProduct
import { bookingService } from "@/services/bookingService";
import { userService } from "@/services/userService";
import { messageService } from "@/services/messageService";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Icons (same as before)
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Location: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Phone: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Star: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  StarOutline: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.524c.969 0 1.371 1.24.588 1.81l-3.66 2.658a1 1 0 00-.364 1.118l1.398 4.305c.3.921-.755 1.688-1.54 1.118l-3.66-2.658a1 1 0 00-1.175 0l-3.66 2.658c-.784.57-1.838-.197-1.539-1.118l1.398-4.305a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.524a1 1 0 00.95-.69l1.519-4.674z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  HeartFilled: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Info: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Write: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
};

export default function HeritageDetailPage({ params }: PageProps) {
  const { isDarkMode } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  
  const [site, setSite] = useState<HeritageSite | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // NEW: products state
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ product_id: number; quantity: number; name: string; price: number }[]>([]);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    commission_rate: number;
  } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  // Updated bookingData to include pickupPoint
  const [bookingData, setBookingData] = useState({
    travelDate: '',
    travelers: 1,
    specialRequests: '',
    pickupPoint: ''  // new field
  });
  
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    visitDate: ''
  });
  
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'products' | 'reviews'>('overview'); // added 'products'
  const [siteId, setSiteId] = useState<number | null>(null);
 const siteImages: Record<string, string> = {
  'Mysore Palace': '/images/mysore-palace.jpeg',
  'Hampi Group of Monuments': '/images/hampi.jpeg',
  'Coorg': '/images/coorg.jpeg',
  'Gokarna': '/images/gokarna.jpeg',
  'Kabini Wildlife Sanctuary': '/images/kabini.jpeg',
  'Hoysaleswara Temple': '/images/hoysaleswara-temple.jpg',
  'Badami Cave Temples': '/images/badami.jpeg',
  'Pattadakal Group of Temples': '/images/pattadakal.jpeg',
  'Chennakesava Temple': '/images/chennakesava-temple.jpg',
  'Shravanabelagola': '/images/shravanabelagola.jpeg',
  'Jog Falls': '/images/jog-falls.jpeg',
  'Murudeshwar Temple': '/images/murdeshwar.jpeg',
  'Bangalore Palace': '/images/bangalore-palace.jpg',
  'Bidar Fort': '/images/bidar-fort.jpg',
  'Chitradurga Fort': '/images/chitradurga-fort.jpg',
  'Tipu Sultan\'s Summer Palace': '/images/tipu-summer-palace.jpg',
  'Gulbarga Fort': '/images/gulbarga-fort.jpg',
  'Srirangapatna Fort': '/images/srirangapatna-fort.jpg',
  'Devanahalli Fort': '/images/devanahalli-fort.jpg',
  'Madhugiri Fort': '/images/madhugiri-fort.jpg',
  'Savandurga': '/images/savandurga.jpg',
  'Dambal': '/images/dambal.jpg',
  'Siddhesvara Temple': '/images/siddhesvara-temple.jpg',
  'Balligavi': '/images/balligavi.jpeg',
  'Aihole Temple Complex': '/images/aihole.jpg',
  'Kittur Fort': '/images/kittur-fort.jpeg',
  'Mahakuta Temples': '/images/mahakuta-temples.jpeg',
  'Humcha Jain Temple': '/images/humcha-jain-temple.jpeg',
  'Queen\'s Bath': '/images/queens-bath.jpeg',
  'Archaeological Museum': '/images/archaeological-museum.jpg',
  'Folklore Museum': '/images/folklore-museum.jpeg',
  'Makalidurga': '/images/makalidurga.jpeg',
  'Talakadu Temples': '/images/talakadu-temples.jpg',
  'Banashankari Temple': '/images/banashankari-temple.jpg',
  'Royal Stepwells (Pushkarni)': '/images/royal-stepwells.jpeg',
  'Government Museum': '/images/government-museum.jpg',
  'Karnataka Temple Tour': '/images/karnataka-temple-tour.jpeg',
  'Mysore Palace Light & Sound Show': '/images/mysore-palace.jpg',
  'Gokarna Water Sports Center': '/images/gokarna-water-sports.jpg',
  'Hampi Heritage Walk': '/images/hampi-heritage-walk.jpg',
  'Kabini Bird Watching Expedition': '/images/kabini-bird-watching.webp',
  'Kabini River Safari Camp': '/images/kabini-river-safari.jpeg',
  'Coorg Coffee Plantation Stay': '/images/coorg-coffee-plantation.jpeg',
  'Keshava Temple': '/images/keshava-temple.jpg',
  'Mahabaleshwar Temple': '/images/mahabaleshwar-temple.jpg',
  'Banavasi': '/images/banavasi.jpeg',
  'Lakkundi Temple Complex': '/images/lakkundi.jpeg',
  'Taj West End Garden': '/images/taj-west-end-garden.jpeg',
  'Skandagiri (Kalavara Durga)': '/images/skandagiri.jpeg',
  'Kavala Caves': '/images/kavala-caves.jpeg',
  'Aihole Jain Caves': '/images/aihole.jpg',
  'Sangolli Rayanna Fort': '/images/sangolli-rayanna-fort.webp',
};
// Add this helper function after the `siteImages` definition (around line 100)
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800'; // or use a local placeholder

const getHeritageImageUrl = (imagePath: string | null | undefined, siteName?: string): string => {
  // 1. If we have a site name and it exists in the local mapping, use that
  if (siteName && siteImages[siteName]) {
    return siteImages[siteName];
  }
  
  // 2. If no image path provided, fallback to placeholder
  if (!imagePath) return PLACEHOLDER_IMAGE;
  
  // 3. If it's already a local path starting with '/images/', use it as is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // 4. If it's a full URL (e.g., http://...), use it directly
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // 5. Otherwise, assume it's a relative path from the backend and construct the full URL
  const fixedPath = imagePath.replace(/\\/g, '/');
  return `http://localhost:5000/${fixedPath}`;
};
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
        console.log("SITE DATA:", data);
        
        if (data) {
          setSite(data);
          console.log("Pickup points from API:", data?.pickup_points);
          // NEW: fetch associated products
          const prods = await heritageService.getSiteProducts(siteId);
          setProducts(prods);
          
          if (user) {
            const isInWishlist = await userService.checkWishlist(siteId);
            setIsWishlisted(isInWishlist);
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

  // Fetch reviews when site is loaded or tab changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!siteId || activeTab !== 'reviews') return;
      
      setReviewsLoading(true);
      try {
        const data = await heritageService.getReviews(siteId);
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [siteId, activeTab]);

  // NEW: handle product quantity change
  const updateItemQuantity = (productId: number, quantity: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.product_id === productId);
      if (existing) {
        if (quantity <= 0) {
          return prev.filter(item => item.product_id !== productId);
        } else {
          return prev.map(item => item.product_id === productId ? { ...item, quantity } : item);
        }
      } else {
        const product = products.find(p => p.id === productId);
        if (product && quantity > 0) {
          return [...prev, { product_id: productId, quantity, name: product.name, price: product.price }];
        }
        return prev;
      }
    });
  };

  // NEW: calculate total including products
  const calculateTotal = (): number => {
    const entryTotal = (site?.entry_fee_indian || 0) * bookingData.travelers;
    const productsTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return entryTotal + productsTotal;
  };

  const handleBookNow = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!bookingData.travelDate) {
      setBookingError('Please select a travel date');
      return;
    }

    if (!site) {
      setBookingError('Site data not loaded');
      return;
    }

    // Validate pickup point if site has them
    if (site.pickup_points && site.pickup_points.length > 0 && !bookingData.pickupPoint) {
      setBookingError('Please select a pickup point');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const formattedDate = new Date(bookingData.travelDate)
        .toISOString()
        .split('T')[0];

      const travelers = Number(bookingData.travelers);

      const bookingPayload: any = {
        user_id: Number(user.id),
        site_id: Number(site.id),
        enterprise_id: site.enterprise_id ?? null,
        travel_date: formattedDate,
        travelers: travelers,
        special_requests: bookingData.specialRequests || null,
        pickup_point: bookingData.pickupPoint || null,
        // NEW: include selected items
        items: selectedItems.map(item => ({ product_id: item.product_id, quantity: item.quantity }))
      };

      if (appliedPromo) {
        bookingPayload.promo_code = appliedPromo.code;
      }

      console.log("FINAL PAYLOAD:", bookingPayload);

      const result = await bookingService.createBooking(bookingPayload); // backend will compute total

      if (result.success && result.booking) {
        setBookingSuccess(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setBookingData({ travelDate: '', travelers: 1, specialRequests: '', pickupPoint: '' });
          setSelectedItems([]); // clear selected items
          router.push('/dashboard/tickets');
        }, 3000);
      } else {
        setBookingError(result.error || 'Booking failed');
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      if (error.response) {
        console.error('Backend error:', error.response.data);
        setBookingError(
          error.response.data?.message ||
          `Error ${error.response.status}: Booking failed`
        );
      } else {
        setBookingError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-codes/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await response.json();
      if (data.success) {
        setAppliedPromo(data.data);
        setPromoCode('');
      } else {
        setPromoError(data.message || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to validate code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {  
      router.push('/auth');
      return;
    }

    if (!reviewData.comment) {
      setReviewError('Please write a review comment');
      return;
    }

    setIsSubmitting(true);
    setReviewError('');

    try {
      const success = await heritageService.addReview(site!.id, {
        rating: reviewData.rating,
        title: reviewData.title || undefined,
        comment: reviewData.comment,
        visit_date: reviewData.visitDate || undefined
      });

      if (success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess(false);
          setReviewData({ rating: 5, title: '', comment: '', visitDate: '' });
          heritageService.getReviews(site!.id).then(setReviews);
        }, 2000);
      } else {
        setReviewError('Failed to submit review');
      }
    } catch (error) {
      console.error('Review error:', error);
      setReviewError('An error occurred. Please try again.');
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

  const calculateDiscountedTotal = (baseTotal: number): number => {
    if (!appliedPromo) return baseTotal;
    let discount = 0;
    if (appliedPromo.discount_type === 'percentage') {
      discount = (baseTotal * appliedPromo.discount_value) / 100;
    } else {
      discount = appliedPromo.discount_value;
    }
    if (discount > baseTotal) discount = baseTotal;
    return baseTotal - discount;
  };

  const formatTime = (time?: string) => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Icons.Star key={i} />);
      } else {
        stars.push(<Icons.StarOutline key={i} />);
      }
    }
    return stars;
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
  src={getHeritageImageUrl(images[selectedImage], site.name) || defaultImage}
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
                {site.rating !== undefined && site.rating !== null && Number(site.rating) > 0 && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <span>⭐</span>
                    <span>{typeof site.rating === 'number' ? site.rating.toFixed(1) : Number(site.rating).toFixed(1)}</span>
                    {site.total_reviews ? <span>({site.total_reviews})</span> : null}
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
  src={getHeritageImageUrl(img, site.name) || defaultImage}
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
              
              {/* Location */}
              <div className="flex items-center gap-2 mb-2">
                <Icons.Location />
                <span>
                  {site.location}
                  {site.district ? `, ${site.district} District` : ''}
                  {site.state ? `, ${site.state}` : ''}
                </span>
              </div>

              {/* Quick Info Row */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="text-emerald-500 font-bold text-2xl">
                  {site.display_price || `₹${site.entry_fee_indian || 0}`}
                </span>
                
                {site.opening_time && site.closing_time && (
                  <span className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Icons.Clock />
                    {formatTime(site.opening_time)} - {formatTime(site.closing_time)}
                  </span>
                )}
                
                {site.duration_required && (
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    • {site.duration_required}
                  </span>
                )}
              </div>

              {/* Significance */}
              {site.significance && (
                <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className="text-sm italic">"{site.significance}"</p>
                </div>
              )}

              {/* Tabs - updated to include products */}
              <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                {(['overview', 'highlights', 'products', 'reviews'] as const).map((tab) => (
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

                      {/* Additional Info */}
                      {site.site_type && (
                        <div className="mt-4">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Type: {site.site_type} {site.subcategory ? `• ${site.subcategory}` : ''}
                          </span>
                        </div>
                      )}
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
                  
                  {/* NEW: Products tab */}
                  {activeTab === 'products' && (
                    <div>
                      {products.length === 0 ? (
                        <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No products available for this site.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {products.map(product => {
                            const selected = selectedItems.find(i => i.product_id === product.id);
                            return (
                              <div key={product.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div className="flex items-start gap-3">
                                  {product.thumbnail && (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      <Image
                                        src={product.thumbnail.startsWith('http') ? product.thumbnail : `http://localhost:5000/${product.thumbnail.replace(/\\/g, '/')}`}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium">{product.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1">by {product.seller_shop_name}</p>
                                    {product.description && (
                                      <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                                    )}
                                    <p className="text-sm font-bold mt-2">₹{product.price}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateItemQuantity(product.id, (selected?.quantity || 0) - 1)}
                                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 disabled:opacity-50"
                                      disabled={!selected}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center">{selected?.quantity || 0}</span>
                                    <button
                                      onClick={() => updateItemQuantity(product.id, (selected?.quantity || 0) + 1)}
                                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div>
                      {user && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="mb-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                        >
                          <Icons.Write />
                          Write a Review
                        </button>
                      )}
                      
                      {reviewsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                        </div>
                      ) : reviews.length > 0 ? (
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {review.user_name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{review.user_name}</p>
                                    <p className="text-xs opacity-60">{formatDate(review.created_at)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              {review.title && (
                                <h4 className="text-sm font-medium mb-1">{review.title}</h4>
                              )}
                              <p className="text-sm">{review.comment}</p>
                              {review.visit_date && (
                                <p className="text-xs opacity-60 mt-2">
                                  Visited: {formatDate(review.visit_date)}
                                </p>
                              )}
                              {review.helpful_count > 0 && (
                                <p className="text-xs text-emerald-500 mt-2">
                                  {review.helpful_count} found this helpful
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No reviews yet. Be the first to review!
                        </p>
                      )}
                    </div>
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

      {/* Booking Modal - updated */}
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

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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

                    {/* Pickup Point Dropdown */}
                    {site.pickup_points && site.pickup_points.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Pickup Point</label>
                        <select
                          value={bookingData.pickupPoint}
                          onChange={(e) => setBookingData({...bookingData, pickupPoint: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? "bg-gray-800 border-gray-700" 
                              : "bg-white border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          required
                        >
                          <option value="">Select a pickup point</option>
                          {site.pickup_points.map((point, idx) => (
                            <option key={idx} value={point}>{point}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* NEW: Products selection inside modal */}
                    {products.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Add Products</h3>
                        <div className="space-y-3">
                          {products.map(product => {
                            const selected = selectedItems.find(i => i.product_id === product.id);
                            return (
                              <div key={product.id} className={`p-3 rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                {product.thumbnail && (
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={product.thumbnail.startsWith('http') ? product.thumbnail : `http://localhost:5000/${product.thumbnail.replace(/\\/g, '/')}`}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{product.name}</p>
                                  <p className="text-xs text-gray-400">₹{product.price}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateItemQuantity(product.id, (selected?.quantity || 0) - 1)}
                                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 disabled:opacity-50"
                                    disabled={!selected}
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">{selected?.quantity || 0}</span>
                                  <button
                                    onClick={() => updateItemQuantity(product.id, (selected?.quantity || 0) + 1)}
                                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Promo Code Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Promo Code (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          placeholder="Enter promo code"
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            isDarkMode 
                              ? "bg-gray-800 border-gray-700" 
                              : "bg-white border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          disabled={!!appliedPromo || isSubmitting}
                        />
                        {!appliedPromo ? (
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={!promoCode.trim() || validatingPromo}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {validatingPromo ? '...' : 'Apply'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedPromo(null);
                              setPromoCode('');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                      {appliedPromo && (
                        <p className="text-emerald-500 text-sm mt-1">
                          Promo code applied: {appliedPromo.code} –{' '}
                          {appliedPromo.discount_type === 'percentage'
                            ? `${appliedPromo.discount_value}% off`
                            : `₹${appliedPromo.discount_value} off`}
                        </p>
                      )}
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

                    {/* Dynamic Price Summary with products */}
                    {(() => {
                      const entryTotal = (site.entry_fee_indian || 0) * bookingData.travelers;
                      const productsTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                      const baseTotal = entryTotal + productsTotal;
                      const finalTotal = appliedPromo ? calculateDiscountedTotal(baseTotal) : baseTotal;
                      return (
                        <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <div className="flex justify-between mb-2">
                            <span>Entry fee ({bookingData.travelers} person{bookingData.travelers > 1 ? 's' : ''})</span>
                            <span>₹{entryTotal}</span>
                          </div>
                          {selectedItems.length > 0 && (
                            <>
                              {selectedItems.map(item => (
                                <div key={item.product_id} className="flex justify-between text-sm">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </>
                          )}
                          {appliedPromo && (
                            <div className="flex justify-between text-emerald-500 text-sm mb-1">
                              <span>Discount ({appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}%` : `₹${appliedPromo.discount_value}`})</span>
                              <span>-₹{(baseTotal - finalTotal).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-600">
                            <span>Total</span>
                            <span className="text-emerald-500">₹{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}

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

      {/* Review Modal (unchanged) */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReviewModal(false)}
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
              {reviewSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Check />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                  <p className="mb-4">Your review has been submitted successfully.</p>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
                  <p className="mb-6">{site.name}</p>

                  <div className="space-y-4">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewData({...reviewData, rating: star})}
                            className={`text-2xl ${
                              star <= reviewData.rating 
                                ? 'text-yellow-400' 
                                : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Review Title (Optional)</label>
                      <input
                        type="text"
                        value={reviewData.title}
                        onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700" 
                            : "bg-white border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="Summarize your experience"
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Review</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700" 
                            : "bg-white border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="Share your experience..."
                      />
                    </div>

                    {/* Visit Date */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Visit (Optional)</label>
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={reviewData.visitDate}
                        onChange={(e) => setReviewData({...reviewData, visitDate: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? "bg-gray-800 border-gray-700" 
                            : "bg-white border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>

                    {reviewError && (
                      <p className="text-red-500 text-sm">{reviewError}</p>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowReviewModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
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