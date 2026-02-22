// components/HeritageMap.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface HeritageSite {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  image: string;
  price: string;
  visited?: boolean;
  booked?: boolean;
}

interface HeritageMapProps {
  sites: HeritageSite[];
  userVisited?: number[];
  userBooked?: number[];
  onSiteClick?: (id: number) => void;
}

export default function HeritageMap({ sites, userVisited = [], userBooked = [], onSiteClick }: HeritageMapProps) {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapRef.current && mapContainerRef.current) {
      fixLeafletIcon();

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView([15.3173, 75.7139], 7); // Center on Karnataka

      // Add tile layer (OpenStreetMap is free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      setIsMapReady(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isMapReady && mapRef.current && sites.length > 0) {
      // Clear existing markers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });

      // Add markers for each site
      sites.forEach((site) => {
        if (site.coordinates?.lat && site.coordinates?.lng) {
          // Create custom icon based on status
          const isVisited = userVisited.includes(site.id);
          const isBooked = userBooked.includes(site.id);

          let iconColor = 'blue';
          if (isVisited) iconColor = 'green';
          if (isBooked) iconColor = 'orange';

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${iconColor === 'green' ? '#10b981' : iconColor === 'orange' ? '#f59e0b' : '#3b82f6'};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">${isVisited ? '✓' : isBooked ? '📅' : '🏛️'}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([site.coordinates.lat, site.coordinates.lng], { icon: customIcon })
            .addTo(mapRef.current!)
            .bindPopup(`
              <div style="min-width: 180px;">
                <img src="${site.image}" alt="${site.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
                <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 2px;">${site.name}</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 2px;">${site.location}</p>
                <p style="color: #10b981; font-weight: bold; font-size: 13px; margin-bottom: 6px;">${site.price}</p>
                <div style="display: flex; gap: 8px;">
                  ${!isVisited && !isBooked ? `
                    <button onclick="window.dispatchEvent(new CustomEvent('siteClick', { detail: ${site.id} }))" 
                      style="background-color: #10b981; color: white; padding: 4px 10px; border-radius: 4px; border: none; cursor: pointer; font-size: 11px;">
                      Book Now
                    </button>
                  ` : ''}
                  ${isVisited ? '<span style="background-color: #10b981; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px;">✓ Visited</span>' : ''}
                  ${isBooked ? '<span style="background-color: #f59e0b; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px;">📅 Booked</span>' : ''}
                </div>
              </div>
            `);

          marker.on('click', () => {
            if (onSiteClick) onSiteClick(site.id);
          });
        }
      });

      // Fit bounds to show all markers
      if (sites.length > 0) {
        const bounds = L.latLngBounds(sites.map(s => [s.coordinates.lat, s.coordinates.lng]));
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [isMapReady, sites, userVisited, userBooked, onSiteClick]);

  // Listen for custom events from popup buttons
  useEffect(() => {
    const handleSiteClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (onSiteClick) onSiteClick(customEvent.detail);
    };

    window.addEventListener('siteClick', handleSiteClick);
    return () => window.removeEventListener('siteClick', handleSiteClick);
  }, [onSiteClick]);

  return (
    <div className="relative w-full h-[350px] rounded-xl overflow-hidden shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend - Smaller */}
      <div className={`absolute top-3 left-3 z-10 p-2 rounded-lg backdrop-blur-md ${
        isDarkMode ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-900'
      } shadow-lg text-xs`}>
        <h4 className="text-xs font-medium mb-1">📍 Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
            <span>Heritage Site</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white" />
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay - Smaller */}
      <div className={`absolute top-3 right-3 z-10 p-2 rounded-lg backdrop-blur-md ${
        isDarkMode ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-900'
      } shadow-lg`}>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-500">{sites.length}</p>
          <p className="text-[10px]">Total Sites</p>
        </div>
        <div className="flex gap-3 mt-1 pt-1 border-t border-gray-300 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs font-medium text-green-500">{userVisited.length}</p>
            <p className="text-[10px]">Visited</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-orange-500">{userBooked.length}</p>
            <p className="text-[10px]">Booked</p>
          </div>
        </div>
      </div>
    </div>
  );
}