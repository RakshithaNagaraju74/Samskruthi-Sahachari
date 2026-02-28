"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  thumbnail: string | null;
  category: string;
  rating: number;
  review_count: number;
  sold_count: number;
  sku?: string;
  quantity?: number;
  seller?: {
    id: number;
    shop_name: string;
    rating: number;
  };
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // Demo product data
  const demoProduct: Product = {
    id: 1,
    name: 'Mysore Silk Saree',
    description: `Experience the elegance of pure Mysore silk, handwoven by skilled artisans in Karnataka. This exquisite saree features:
    
    • Pure Mysore silk with golden zari border
    • Traditional peacock motif design
    • Handwoven by master craftsmen
    • Comes with matching blouse piece
    • Perfect for weddings and special occasions
    
    Each saree is a unique piece of art, taking approximately 15-20 days to complete. The silk is known for its durability, natural sheen, and comfort.`,
    short_description: 'Elegant pure silk saree with golden zari border',
    price: 5499,
    compare_at_price: 6999,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-6c78276447e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'silk',
    rating: 4.8,
    review_count: 124,
    sold_count: 345,
    sku: 'MSK-SILK-001',
    quantity: 50,
    seller: {
      id: 1,
      shop_name: 'Mysore Silk Emporium',
      rating: 4.9
    }
  };

  // Demo reviews
  const demoReviews: Review[] = [
    {
      id: 1,
      user_name: 'Priya Sharma',
      rating: 5,
      comment: 'Absolutely beautiful saree! The silk quality is amazing and the zari work is exquisite. Worth every penny.',
      created_at: '2025-02-15T10:30:00Z'
    },
    {
      id: 2,
      user_name: 'Rajesh Kumar',
      rating: 5,
      comment: 'Bought this for my wife\'s birthday. She loved it! The color is exactly as shown and the fabric is very comfortable.',
      created_at: '2025-02-10T14:20:00Z'
    },
    {
      id: 3,
      user_name: 'Anita Desai',
      rating: 4,
      comment: 'Great quality saree. The delivery was prompt. Minus one star because the blouse piece color was slightly different.',
      created_at: '2025-02-05T09:15:00Z'
    }
  ];

  // Demo related products
  const demoRelatedProducts: Product[] = [
    {
      id: 2,
      name: 'Kanchipuram Silk Saree',
      description: 'Traditional Kanchipuram silk saree',
      short_description: 'Pure silk with temple border',
      price: 6499,
      compare_at_price: 7999,
      images: [],
      thumbnail: 'https://images.unsplash.com/photo-1583391733956-6c78276447e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'silk',
      rating: 4.7,
      review_count: 89,
      sold_count: 234
    },
    {
      id: 3,
      name: 'Banarasi Silk Saree',
      description: 'Elegant Banarasi silk saree',
      short_description: 'Rich zari work',
      price: 7999,
      compare_at_price: 9999,
      images: [],
      thumbnail: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'silk',
      rating: 4.9,
      review_count: 156,
      sold_count: 412
    },
    {
      id: 4,
      name: 'Paithani Silk Saree',
      description: 'Traditional Paithani silk saree',
      short_description: 'Peacock motif design',
      price: 8999,
      compare_at_price: 10999,
      images: [],
      thumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'silk',
      rating: 4.8,
      review_count: 67,
      sold_count: 178
    }
  ];

  useEffect(() => {
    fetchProduct();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [params.id]);

  const fetchProduct = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProduct(demoProduct);
      setReviews(demoReviews);
      setRelatedProducts(demoRelatedProducts);
      setLoading(false);
    }, 500);
  };

  const addToCart = () => {
    if (!product) return;

    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`${product.name} added to cart!`);
  };

  const buyNow = () => {
    addToCart();
    router.push('/checkout');
  };

  const getDiscountedPrice = () => {
    if (!product?.compare_at_price) return null;
    const discount = ((product.compare_at_price - product.price) / product.compare_at_price) * 100;
    return Math.round(discount);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className={`text-2xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Product Not Found
          </h1>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            The product you're looking for doesn't exist.
          </p>
          <Link href="/products">
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg rotate-12 group-hover:rotate-45 transition-all duration-500"></div>
                <span className={`text-xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Samskruthi
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/cart">
                <div className="relative cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-xs flex items-center justify-center rounded-full">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </div>
              </Link>
              <Link href="/products">
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className={`hover:text-emerald-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Home
          </Link>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>/</span>
          <Link href="/products" className={`hover:text-emerald-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Products
          </Link>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>/</span>
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
            {product.name}
          </span>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className={`relative h-96 rounded-xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
              <Image
                src={product.images[selectedImage] || product.thumbnail || ''}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.compare_at_price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {getDiscountedPrice()}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-emerald-500'
                        : isDarkMode
                          ? 'border-gray-700 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Title & Rating */}
            <h1 className={`text-3xl font-light mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg">★</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.rating}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({product.review_count} reviews)
                </span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {product.sold_count} sold
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{product.price.toLocaleString()}
                </span>
                {product.compare_at_price && (
                  <>
                    <span className={`text-lg line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ₹{product.compare_at_price.toLocaleString()}
                    </span>
                    <span className="text-sm bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                      Save ₹{(product.compare_at_price - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Inclusive of all taxes
              </p>
            </div>

            {/* Short Description */}
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {product.short_description}
            </p>

            {/* Availability */}
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Availability:
                </span>
                {product.quantity && product.quantity > 0 ? (
                  <span className="text-sm text-green-600">
                    In Stock ({product.quantity} available)
                  </span>
                ) : (
                  <span className="text-sm text-red-600">
                    Out of Stock
                  </span>
                )}
              </div>
              {product.sku && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    SKU:
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {product.sku}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 hover:bg-gray-700 text-white'
                      : 'border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={product.quantity}
                  className={`w-20 h-10 text-center rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } outline-none focus:ring-1 focus:ring-emerald-500`}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 hover:bg-gray-700 text-white'
                      : 'border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={addToCart}
                className="flex-1 py-3 border-2 border-emerald-500 text-emerald-500 rounded-lg text-sm font-medium hover:bg-emerald-500 hover:text-white transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={buyNow}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Buy Now
              </button>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sold by
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.seller.shop_name}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ⭐ {product.seller.rating} Seller rating
                    </p>
                  </div>
                  <Link href={`/sellers/${product.seller.id}`}>
                    <button className="text-sm text-emerald-500 hover:text-emerald-400">
                      View Shop
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className={`rounded-xl border overflow-hidden mb-12 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'description'
                  ? 'border-b-2 border-emerald-500 text-emerald-500'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-emerald-500 text-emerald-500'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Reviews ({product.review_count})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'description' ? (
              <div className={`whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {product.description}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {review.user_name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {review.rating}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className={`text-xl font-medium mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div className={`group rounded-xl overflow-hidden border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                    <div className="relative h-48">
                      <Image
                        src={product.thumbnail || ''}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.compare_at_price && (
                          <span className={`text-xs line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            ₹{product.compare_at_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {product.rating} ({product.review_count})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}