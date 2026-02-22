"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface MapMarker {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  type?: 'destination' | 'eatery' | 'craft';
  description?: string;
  image?: string;
  price?: string;
  rating?: number;
}

interface Props {
  center?: { lat: number; lng: number };
  markers?: MapMarker[];
  zoom?: number;
  height?: string;
  showSearch?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

// Custom marker icons
const createCustomIcon = (type: string = 'destination', isDarkMode: boolean = false) => {
  const colors = {
    destination: '#10b981', // emerald
    eatery: '#f59e0b',      // amber
    craft: '#8b5cf6'        // purple
  };

  const color = colors[type as keyof typeof colors] || colors.destination;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
        ">
          ${type === 'destination' ? '📍' : type === 'eatery' ? '🍽️' : '🎨'}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function MapView({ 
  center = { lat: 15.3173, lng: 75.7139 }, // Default to Karnataka center
  markers = [], 
  zoom = 7,
  height = "400px",
  showSearch = true,
  onMarkerClick 
}: Props) {
  const { isDarkMode } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    fixLeafletIcons();

    // Create map instance
    const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);
    mapRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers
    markers.forEach(marker => {
      const customIcon = createCustomIcon(marker.type, isDarkMode);
      
      const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { 
        icon: customIcon 
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          padding: 8px;
          max-width: 200px;
        ">
          <h3 style="
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #111;
          ">${marker.title}</h3>
          ${marker.description ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${marker.description}</p>` : ''}
          ${marker.rating ? `
            <div style="display: flex; align-items: center; gap: 4px; margin: 4px 0;">
              <span style="color: #f59e0b;">★</span>
              <span style="font-size: 12px;">${marker.rating}</span>
            </div>
          ` : ''}
          ${marker.price ? `
            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #10b981;">
              ${marker.price}
            </p>
          ` : ''}
        </div>
      `;

      leafletMarker.bindPopup(popupContent);

      leafletMarker.on('click', () => {
        onMarkerClick?.(marker);
      });
    });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);

          // Add user marker
          L.marker([userPos.lat, userPos.lng], {
            icon: L.divIcon({
              className: 'user-marker',
              html: `
                <div style="
                  width: 24px;
                  height: 24px;
                  background: #3b82f6;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 2px #3b82f6;
                "></div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(map).bindPopup('You are here');
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        }
      );
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [center.lat, center.lng, zoom, markers.length]);

  // Search using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Karnataka, India')}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);

      if (data.length > 0 && mapRef.current) {
        const first = data[0];
        mapRef.current.setView([parseFloat(first.lat), parseFloat(first.lon)], 12);
        
        // Add temporary marker for search result
        L.marker([parseFloat(first.lat), parseFloat(first.lon)], {
          icon: L.divIcon({
            className: 'search-marker',
            html: `
              <div style="
                width: 40px;
                height: 40px;
                background: #f59e0b;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
              ">
                <span style="color: white; font-size: 18px;">🔍</span>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })
        }).addTo(mapRef.current)
          .bindPopup(`<b>${first.display_name}</b>`)
          .openPopup();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get directions to a location
  const getDirections = (lat: number, lng: number) => {
    if (userLocation) {
      window.open(
        `https://www.openstreetmap.org/directions?engine=graphhopper_car&route=${userLocation.lat},${userLocation.lng};${lat},${lng}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`,
        '_blank'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search places in Karnataka..."
              className={`flex-1 px-4 py-2 rounded-lg text-sm border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:border-emerald-500`}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className={`absolute z-10 mt-2 w-full rounded-lg shadow-xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setView([parseFloat(result.lat), parseFloat(result.lon)], 15);
                    }
                    setSearchResults([]);
                    setSearchQuery(result.display_name.split(',')[0]);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-500/10 ${
                    index !== searchResults.length - 1 ? 'border-b' : ''
                  } ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <p className="font-medium">{result.display_name.split(',')[0]}</p>
                  <p className={`text-xs truncate ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {result.display_name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="rounded-2xl overflow-hidden shadow-lg"
      />

      {/* Map Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setView([center.lat, center.lng], zoom);
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs ${
            isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Reset View
        </button>

        {userLocation && (
          <button
            onClick={() => {
              if (mapRef.current && userLocation) {
                mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs ${
              isDarkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            My Location
          </button>
        )}

        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomIn();
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs ${
            isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          +
        </button>

        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomOut();
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs ${
            isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          −
        </button>

        {/* Legend */}
        <div className={`ml-auto flex gap-3 text-xs ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Destinations
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            Eateries
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            Crafting
          </span>
        </div>
      </div>
    </div>
  );
}