"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface Site {
  id: string;
  name: string;
  location: string;
  district: string | null;
  state: string;
  description: string;
  short_description: string | null;
  image: string;
  gallery_images?: string[];
  category: string;
  subcategory: string | null;
  site_type: string | null;
  built_in: string | null;
  built_by: string | null;
  architectural_style: string | null;
  significance: string | null;
  entry_fee_indian: number | null;
  entry_fee_foreigner: number | null;
  opening_time: string | null;
  closing_time: string | null;
  best_time_to_visit: string | null;
  duration_required: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  tags: string[];
  highlights: string[];
  pickup_points: string[];
}

export default function EditSitePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
    pickup_points: [] as string[]
  });

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Tag/Highlight/Pickup input states
  const [currentTag, setCurrentTag] = useState("");
  const [currentHighlight, setCurrentHighlight] = useState("");
  const [currentPickupPoint, setCurrentPickupPoint] = useState("");

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

  // Fetch site data
  useEffect(() => {
    const fetchSite = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/enterprise/sites/${siteId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          const site = data.data;
          setFormData({
            name: site.name || "",
            location: site.location || "",
            district: site.district || "",
            state: site.state || "Karnataka",
            description: site.description || "",
            short_description: site.short_description || "",
            category: site.category || "",
            subcategory: site.subcategory || "",
            site_type: site.site_type || "",
            built_in: site.built_in || "",
            built_by: site.built_by || "",
            architectural_style: site.architectural_style || "",
            significance: site.significance || "",
            entry_fee_indian: site.entry_fee_indian?.toString() || "",
            entry_fee_foreigner: site.entry_fee_foreigner?.toString() || "",
            opening_time: site.opening_time || "",
            closing_time: site.closing_time || "",
            best_time_to_visit: site.best_time_to_visit || "",
            duration_required: site.duration_required || "",
            contact_phone: site.contact_phone || "",
            contact_email: site.contact_email || "",
            website: site.website || "",
            tags: site.tags || [],
            highlights: site.highlights || [],
            pickup_points: site.pickup_points || []
          });
          setExistingImages(site.gallery_images || []);
        } else {
          setFetchError('Failed to load site data');
        }
      } catch (error) {
        console.error('Error fetching site:', error);
        setFetchError('Error loading site');
      } finally {
        setLoading(false);
      }
    };

    if (siteId) fetchSite();
  }, [siteId]);

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imagePath: string) => {
    setImagesToDelete(prev => [...prev, imagePath]);
    setExistingImages(prev => prev.filter(img => img !== imagePath));
  };

  // Tag/Highlight/Pickup helpers
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addHighlight = () => {
    if (currentHighlight.trim() && !formData.highlights.includes(currentHighlight.trim())) {
      setFormData(prev => ({ ...prev, highlights: [...prev.highlights, currentHighlight.trim()] }));
      setCurrentHighlight("");
    }
  };

  const removeHighlight = (highlight: string) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter(h => h !== highlight) }));
  };

  const addPickupPoint = () => {
    if (currentPickupPoint.trim() && !formData.pickup_points.includes(currentPickupPoint.trim())) {
      setFormData(prev => ({ ...prev, pickup_points: [...prev.pickup_points, currentPickupPoint.trim()] }));
      setCurrentPickupPoint("");
    }
  };

  const removePickupPoint = (point: string) => {
    setFormData(prev => ({ ...prev, pickup_points: prev.pickup_points.filter(p => p !== point) }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags' || key === 'highlights' || key === 'pickup_points') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append new images
      newImages.forEach(image => formDataToSend.append('images', image));

      // Send update
      const response = await fetch(`http://localhost:5000/api/enterprise/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await response.json();
      if (data.success) {
        // Delete marked images (if any)
        for (const imgPath of imagesToDelete) {
          await fetch(`http://localhost:5000/api/enterprise/sites/${siteId}/images`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imagePath: imgPath })
          });
        }
        router.push('/enterprise/sites?success=Site updated successfully');
      } else {
        alert(data.message || 'Failed to update site');
      }
    } catch (error) {
      console.error('Error updating site:', error);
      alert('Failed to update site');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading site data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{fetchError}</p>
          <Link href="/enterprise/sites" className="text-emerald-500 hover:underline">
            ← Back to Sites
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/enterprise/sites" className="text-gray-400 hover:text-white">
                ← Back to Sites
              </Link>
              <h1 className="text-xl text-white">Edit Heritage Site</h1>
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
                <label className="block text-sm text-gray-400 mb-2">Site Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Architectural Style</label>
                <input
                  type="text"
                  value={formData.architectural_style}
                  onChange={(e) => setFormData({ ...formData, architectural_style: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Significance</label>
                <textarea
                  value={formData.significance}
                  onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Entry Fee (Foreigner) ₹</label>
                <input
                  type="number"
                  value={formData.entry_fee_foreigner}
                  onChange={(e) => setFormData({ ...formData, entry_fee_foreigner: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration Required</label>
                <input
                  type="text"
                  value={formData.duration_required}
                  onChange={(e) => setFormData({ ...formData, duration_required: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Tags, Highlights, Pickup Points */}
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
                    placeholder="Add a tag"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-emerald-400 hover:text-emerald-300">×</button>
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
                    placeholder="Add a highlight"
                  />
                  <button type="button" onClick={addHighlight} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map(h => (
                    <span key={h} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm flex items-center gap-2">
                      {h}
                      <button type="button" onClick={() => removeHighlight(h)} className="text-blue-400 hover:text-blue-300">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pickup Points */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pickup Points</label>
                <p className="text-xs text-gray-500 mb-2">Add available pickup locations</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentPickupPoint}
                    onChange={(e) => setCurrentPickupPoint(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPickupPoint())}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Add a pickup point"
                  />
                  <button type="button" onClick={addPickupPoint} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.pickup_points.map((point, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm flex items-center gap-2">
                      🚌 {point}
                      <button type="button" onClick={() => removePickupPoint(point)} className="text-amber-400 hover:text-amber-300">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Images</h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-3">Current Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((imgPath, idx) => (
                    <div key={idx} className="relative group">
                      <div className="relative h-32 rounded-lg overflow-hidden">
                        <Image
                          src={`http://localhost:5000/${imgPath}`}
                          alt={`Site image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(imgPath)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Add New Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <p className="text-xs text-gray-500 mt-1">You can upload up to 10 images (max 5MB each)</p>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href="/enterprise/sites"
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}