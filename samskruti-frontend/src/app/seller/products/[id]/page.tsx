"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SellerLayout from "../../components/SellerLayout";

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  quantity: number;
  images: string[];
  thumbnail: string | null;
  category: string;
  status: string;
  created_at: string;
}

const getImageUrl = (thumbnail: string | null) => {
  if (!thumbnail) return null;
  if (thumbnail.includes('\\')) {
    const filename = thumbnail.split('\\').pop();
    return `http://localhost:5000/uploads/sellers/products/${filename}`;
  }
  return `http://localhost:5000/${thumbnail.replace(/\\/g, '/')}`;
};

export default function ProductDetailPage() {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imgId: string) => {
    setImageErrors(prev => ({ ...prev, [imgId]: true }));
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </SellerLayout>
    );
  }

  if (!product) {
    return (
      <SellerLayout>
        <div className="text-center py-16">
          <h2 className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product not found</h2>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <Link href={`/seller/products/${product.id}/edit`}>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Product
            </button>
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className={`relative h-96 rounded-xl overflow-hidden border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } mb-4`}>
              {product.images && product.images[selectedImage] && !imageErrors[`main-${selectedImage}`] ? (
                <Image
                  src={getImageUrl(product.images[selectedImage]) || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(`main-${selectedImage}`)}
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-6xl opacity-30">🖼️</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
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
                      src={getImageUrl(img) || ''}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(`thumb-${index}`)}
                      unoptimized={true}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h1 className={`text-3xl font-light mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SKU</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.sku || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.category || 'N/A'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
              <div className="flex items-center gap-3">
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{product.price.toLocaleString()}
                </p>
                {product.compare_at_price && (
                  <p className={`text-lg line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    ₹{product.compare_at_price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</p>
                <p className={`text-xl font-medium ${
                  product.quantity <= 5 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {product.quantity}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                <span className={`px-3 py-1 inline-block rounded-full text-xs font-medium ${
                  product.status === 'published'
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            {product.short_description && (
              <div className="mb-4">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Short Description</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {product.short_description}
                </p>
              </div>
            )}

            {product.description && (
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Description</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}