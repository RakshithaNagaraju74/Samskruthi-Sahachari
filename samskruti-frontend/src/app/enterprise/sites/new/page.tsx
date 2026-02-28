"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  seller_shop_name?: string;
  thumbnail?: string;
  description?: string;
}

export default function AddSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    district: "",
    state: "Karnataka",
    description: "",
    short_description: "",
    category: "",
    subcategory: "",
    site_type: "",
    built_in: "",
    built_by: "",
    architectural_style: "",
    significance: "",
    entry_fee_indian: "",
    entry_fee_foreigner: "",
    opening_time: "",
    closing_time: "",
    best_time_to_visit: "",
    duration_required: "",
    contact_phone: "",
    contact_email: "",
    website: "",
    tags: [] as string[],
    highlights: [] as string[],
    pickup_points: [] as string[],
    product_ids: [] as number[]
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [currentHighlight, setCurrentHighlight] = useState("");
  const [currentPickupPoint, setCurrentPickupPoint] = useState("");

  // Helper function to convert thumbnail path to full URL
  const getImageUrl = (thumbnail: string | null) => {
    if (!thumbnail) return null;
    // Windows path with backslashes
    if (thumbnail.includes('\\')) {
      const filename = thumbnail.split('\\').pop();
      return `http://localhost:5000/uploads/sellers/products/${filename}`;
    }
    // Relative path starting with 'uploads/'
    if (thumbnail.startsWith('uploads/')) {
      return `http://localhost:5000/${thumbnail}`;
    }
    // Already a full URL
    if (thumbnail.startsWith('http')) return thumbnail;
    // Default fallback
    return `http://localhost:5000/uploads/sellers/products/${thumbnail}`;
  };

  const categories = [
    { value: "heritage", label: "Heritage Site" },
    { value: "temple", label: "Temple" },
    { value: "palace", label: "Palace" },
    { value: "fort", label: "Fort" },
    { value: "monument", label: "Monument" },
    { value: "museum", label: "Museum" },
    { value: "nature", label: "Nature" },
    { value: "wildlife", label: "Wildlife" },
    { value: "beach", label: "Beach" },
    { value: "hill_station", label: "Hill Station" }
  ];

  const siteTypes = [
    { value: "historical", label: "Historical" },
    { value: "religious", label: "Religious" },
    { value: "archaeological", label: "Archaeological" },
    { value: "natural", label: "Natural" },
    { value: "cultural", label: "Cultural" }
  ];

  // ✅ Fetch from /api/products (public/enterprise endpoint)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        } else {
          console.error('Failed to fetch products:', data.message);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.seller_shop_name && p.seller_shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addHighlight = () => {
    if (currentHighlight.trim() && !formData.highlights.includes(currentHighlight.trim())) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, currentHighlight.trim()]
      }));
      setCurrentHighlight("");
    }
  };

  const removeHighlight = (highlight: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h !== highlight)
    }));
  };

  const addPickupPoint = () => {
    if (currentPickupPoint.trim() && !formData.pickup_points.includes(currentPickupPoint.trim())) {
      setFormData(prev => ({
        ...prev,
        pickup_points: [...prev.pickup_points, currentPickupPoint.trim()]
      }));
      setCurrentPickupPoint("");
    }
  };

  const removePickupPoint = (point: string) => {
    setFormData(prev => ({
      ...prev,
      pickup_points: prev.pickup_points.filter(p => p !== point)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags' || key === 'highlights' || key === 'pickup_points' || key === 'product_ids') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value) {
          formDataToSend.append(key, value.toString());
        }
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('http://localhost:5000/api/enterprise/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        router.push('/enterprise/sites?success=Site created successfully');
      } else {
        alert(data.message || 'Failed to create site');
      }
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Failed to create site');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/enterprise/sites" className="text-gray-400 hover:text-white">
                ← Back to Sites
              </Link>
              <h1 className="text-xl text-white">Add New Heritage Site</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Site Name <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., Mysore Palace"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., Mysuru"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., Mysore"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Karnataka"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subcategory</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., Palace, Temple"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Site Type</label>
                <select
                  value={formData.site_type}
                  onChange={(e) => setFormData({ ...formData, site_type: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Select Site Type</option>
                  {siteTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Built In</label>
                <input
                  type="text"
                  value={formData.built_in}
                  onChange={(e) => setFormData({ ...formData, built_in: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., 14th Century"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Short Description</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Brief description (max 200 characters)"
                maxLength={200}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Full Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Detailed description of the site..."
              />
            </div>
          </div>

          {/* Historical Information */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Historical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Built By</label>
                <input
                  type="text"
                  value={formData.built_by}
                  onChange={(e) => setFormData({ ...formData, built_by: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., King Rajendra"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Architectural Style</label>
                <input
                  type="text"
                  value={formData.architectural_style}
                  onChange={(e) => setFormData({ ...formData, architectural_style: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., Dravidian, Hoysala"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Significance</label>
                <textarea
                  value={formData.significance}
                  onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Historical and cultural significance..."
                />
              </div>
            </div>
          </div>

          {/* Entry Fees & Timing */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Entry Fees & Timing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Entry Fee (Indian) ₹</label>
                <input
                  type="number"
                  value={formData.entry_fee_indian}
                  onChange={(e) => setFormData({ ...formData, entry_fee_indian: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Entry Fee (Foreigner) ₹</label>
                <input
                  type="number"
                  value={formData.entry_fee_foreigner}
                  onChange={(e) => setFormData({ ...formData, entry_fee_foreigner: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., 200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Opening Time</label>
                <input
                  type="time"
                  value={formData.opening_time}
                  onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Closing Time</label>
                <input
                  type="time"
                  value={formData.closing_time}
                  onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Best Time to Visit</label>
                <input
                  type="text"
                  value={formData.best_time_to_visit}
                  onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., October to March"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration Required</label>
                <input
                  type="text"
                  value={formData.duration_required}
                  onChange={(e) => setFormData({ ...formData, duration_required: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g., 2-3 hours"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="contact@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Tags & Highlights & Pickup Points */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Additional Details</h2>
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Highlights</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentHighlight}
                    onChange={(e) => setCurrentHighlight(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Add a highlight and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map(highlight => (
                    <span
                      key={highlight}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm flex items-center gap-2"
                    >
                      {highlight}
                      <button
                        type="button"
                        onClick={() => removeHighlight(highlight)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pickup Points */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pickup Points</label>
                <p className="text-xs text-gray-500 mb-2">Add available pickup locations (e.g., Bengaluru, Yeshwanthpur)</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentPickupPoint}
                    onChange={(e) => setCurrentPickupPoint(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPickupPoint())}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Add a pickup point and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addPickupPoint}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.pickup_points.map((point, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm flex items-center gap-2"
                    >
                      🚌 {point}
                      <button
                        type="button"
                        onClick={() => removePickupPoint(point)}
                        className="text-amber-400 hover:text-amber-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Seller Products Section */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Associated Products (from Sellers)</h2>
            <p className="text-sm text-gray-400 mb-4">
              Select products created by sellers that can be booked together with this site (e.g., souvenirs, packages).
            </p>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products by name or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {loadingProducts ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'No products match your search' : 'No products available'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.product_ids.includes(product.id)
                        ? 'bg-emerald-500/10 border-emerald-500'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                      {product.thumbnail ? (
                        <Image
                          src={getImageUrl(product.thumbnail) || ''}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-500">
                          🛍️
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{product.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        ₹{product.price.toLocaleString()}
                        {product.seller_shop_name && (
                          <span className="ml-2 text-gray-500">by {product.seller_shop_name}</span>
                        )}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      formData.product_ids.includes(product.id)
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-600'
                    }`}>
                      {formData.product_ids.includes(product.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.product_ids.length > 0 && (
              <div className="mt-4 text-sm text-emerald-400">
                {formData.product_ids.length} product(s) selected
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Images</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <p className="text-xs text-gray-500 mt-1">You can upload up to 10 images (max 5MB each)</p>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/enterprise/sites"
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create Site'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}