// components/EnterpriseDestinationCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import type { Destination, Enterprise } from "@/types";

interface EnterpriseDestinationCardProps {
  destination: Destination;
  onBook?: (id: number) => void;
  onLike?: (id: number) => void;
  variant?: 'default' | 'compact' | 'featured';
}

export default function EnterpriseDestinationCard({ 
  destination, 
  onBook, 
  onLike,
  variant = 'default' 
}: EnterpriseDestinationCardProps) {
  const { isDarkMode } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    onLike?.(destination.id);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    onBook?.(destination.id);
  };

  const defaultImage = '/images/placeholder-destination.jpg';
  const imageSrc = imageError || !destination.image ? defaultImage : destination.image;

  if (variant === 'compact') {
    return (
      <Link href={`/dashboard/destination/${destination.id}`}>
        <div className={`flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-opacity-80 ${
          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}>
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={imageSrc}
              alt={destination.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            {destination.isEnterpriseAdded && (
              <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] px-1 rounded-br">
                🏢
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{destination.name}</h4>
            <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {destination.location}
            </p>
            {destination.enterprise && (
              <p className="text-[10px] text-emerald-500 truncate">
                {destination.enterprise.company_name}
              </p>
            )}
          </div>
          <span className="text-emerald-500 text-sm font-medium">{destination.price}</span>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/dashboard/destination/${destination.id}`}>
        <motion.div
          whileHover={{ y: -5 }}
          className={`group relative rounded-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}
        >
          <div className="relative h-64 w-full">
            <Image
              src={imageSrc}
              alt={destination.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Enterprise Badge */}
            {destination.enterprise && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                {destination.enterprise.logo ? (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={destination.enterprise.logo}
                      alt={destination.enterprise.company_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-emerald-400">🏢</span>
                )}
                <span className="text-white text-xs font-medium">
                  {destination.enterprise.company_name}
                </span>
                {destination.enterprise.verified && (
                  <span className="text-emerald-400 text-xs">✓</span>
                )}
              </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
              <p className="text-sm text-gray-200 mb-2">{destination.location}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-medium">{destination.rating}</span>
                  {destination.review_count && (
                    <span className="text-sm text-gray-300">
                      ({destination.review_count} reviews)
                    </span>
                  )}
                </div>
                <span className="text-emerald-400 font-bold text-xl">{destination.price}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/dashboard/destination/${destination.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className={`group relative rounded-xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
        } shadow-lg hover:shadow-xl transition-all`}
      >
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={destination.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              isDarkMode ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-900'
            }`}>
              {destination.category}
            </span>
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <span className={isLiked ? 'text-red-500' : 'text-white'}>
              {isLiked ? '❤️' : '🤍'}
            </span>
          </button>

          {/* Enterprise Badge */}
          {destination.enterprise && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
              {destination.enterprise.logo ? (
                <div className="relative w-4 h-4 rounded-full overflow-hidden">
                  <Image
                    src={destination.enterprise.logo}
                    alt={destination.enterprise.company_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-emerald-400 text-xs">🏢</span>
              )}
              <span className="text-white text-[10px] font-medium">
                {destination.enterprise.company_name}
              </span>
              {destination.enterprise.verified && (
                <span className="text-emerald-400 text-[10px]">✓</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{destination.name}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {destination.location}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium">{destination.rating}</span>
            </div>
            {destination.review_count && (
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                ({destination.review_count} reviews)
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {destination.tags?.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Duration & Price */}
          <div className="flex items-center justify-between pt-3 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ⏱️ {destination.duration}
              </span>
              {destination.max_guests && (
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  👥 Max {destination.max_guests}
                </span>
              )}
            </div>
            <span className="text-emerald-500 font-bold">{destination.price}</span>
          </div>

          {/* Book Button */}
          <button
            onClick={handleBook}
            className="w-full mt-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            Book Now
          </button>
        </div>
      </motion.div>
    </Link>
  );
}