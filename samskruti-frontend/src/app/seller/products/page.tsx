"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import Image from "next/image";
import SellerLayout from "../components/SellerLayout";

interface Product {
  id: number;
  name: string;
  thumbnail: string | null;
  price: number;
  quantity: number;
  status: string;
  sold_count: number;
  sku: string;
  created_at: string;
}

// Single helper function defined once
const getImageUrl = (thumbnail: string | null) => {
  if (!thumbnail) return null;
  
  // If it's already a full Windows path, extract just the filename
  if (thumbnail.includes('\\')) {
    const filename = thumbnail.split('\\').pop();
    return `http://localhost:5000/uploads/sellers/products/${filename}`;
  }
  
  // If it's already a relative path with forward slashes
  if (thumbnail.startsWith('uploads/')) {
    return `http://localhost:5000/${thumbnail}`;
  }
  
  // Default case
  return `http://localhost:5000/uploads/sellers/products/${thumbnail}`;
};

export default function ProductsPage() {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [expandedImage, setExpandedImage] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, search]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: statusFilter !== 'all' ? statusFilter : '',
        search: search
      });

      const response = await fetch(`http://localhost:5000/api/seller/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleImageError = (productId: number, e: any) => {
    console.log(`Image failed to load for product ${productId}:`, e.target.src);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full text-xs font-medium">Published</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-full text-xs font-medium">Draft</span>;
      case 'archived':
        return <span className="px-2 py-1 bg-gray-500/10 text-gray-600 border border-gray-500/20 rounded-full text-xs font-medium">Archived</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/10 text-gray-600 border border-gray-500/20 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Products
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your product catalog
            </p>
          </div>
          <Link href="/seller/products/add">
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Product
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl border backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full px-4 py-2 pl-10 rounded-lg text-sm border ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm`}
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? 'bg-gray-700/50 border-gray-600 text-white'
                  : 'bg-gray-50/50 border-gray-200 text-gray-900'
              } outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm`}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`rounded-xl border overflow-hidden backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`group relative rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image Section */}
                      <div className="relative w-full sm:w-32 h-32 bg-gray-100 flex-shrink-0">
                        {product.thumbnail && !imageErrors[product.id] ? (
                          <>
                            <Image
                              src={getImageUrl(product.thumbnail) || ''}
                              alt={product.name}
                              fill
                              sizes="128px"
                              className="object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
                              onError={(e) => handleImageError(product.id, e)}
                              onClick={() => setExpandedImage(product.id)}
                              unoptimized={true}
                            />
                            <button
                              onClick={() => setExpandedImage(product.id)}
                              className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-3xl opacity-30">🖼️</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className={`text-lg font-medium group-hover:text-emerald-500 transition-colors ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {product.name}
                            </h3>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: #{product.id} • SKU: {product.sku || 'N/A'}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {getStatusBadge(product.status)}
                            <div className="flex items-center gap-2">
                              <Link href={`/seller/products/${product.id}`}>
                                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                                  isDarkMode 
                                    ? 'hover:bg-gray-600 text-gray-400 hover:text-emerald-400' 
                                    : 'hover:bg-gray-200 text-gray-600 hover:text-emerald-600'
                                }`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </Link>
                              <Link href={`/seller/products/${product.id}/edit`}>
                                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                                  isDarkMode 
                                    ? 'hover:bg-gray-600 text-gray-400 hover:text-emerald-400' 
                                    : 'hover:bg-gray-200 text-gray-600 hover:text-emerald-600'
                                }`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                                  isDarkMode 
                                    ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' 
                                    : 'hover:bg-gray-200 text-gray-600 hover:text-red-600'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₹{product.price?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</p>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    product.quantity <= 5 
                                      ? 'bg-red-500' 
                                      : product.quantity <= 10 
                                        ? 'bg-yellow-500' 
                                        : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-medium ${
                                product.quantity <= 5 
                                  ? 'text-red-500' 
                                  : product.quantity <= 10 
                                    ? 'text-yellow-500' 
                                    : 'text-green-500'
                              }`}>
                                {product.quantity || 0}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sold</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {product.sold_count || 0}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Added</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {new Date(product.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 disabled:opacity-50 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 disabled:opacity-50 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Image Expansion Modal */}
        {expandedImage && products.find(p => p.id === expandedImage)?.thumbnail && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
              <Image
                src={getImageUrl(products.find(p => p.id === expandedImage)?.thumbnail || '') || ''}
                alt="Expanded view"
                fill
                className="object-contain"
                unoptimized={true}
              />
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}