"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Destination } from "@/types";

interface Props {
  destination: Destination;
  variant?: "default" | "compact" | "featured";
  showEateries?: boolean;
  onLike?: (id: number) => void;
}

const Icons = {
  Location: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  HeartFilled: () => <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
  Share: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
};

export default function DestinationCard({ destination, variant = "default", onLike }: Props) {
  const { isDarkMode } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(destination.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.share?.({
      title: destination.name,
      text: destination.description,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard?.writeText(window.location.href);
    });
  };

  if (variant === "compact") {
    return (
      <Link href={`/dashboard/destination/${destination.id}`}>
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
            isDarkMode ? "bg-gray-800" : "bg-white shadow-md hover:shadow-xl"
          }`}
        >
          <div className="relative h-32">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-[10px] text-white">
              ⭐ {destination.rating}
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium">{destination.name}</h3>
            <p className={`text-xs flex items-center gap-1 mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              <Icons.Location />
              {destination.location}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-emerald-400 text-xs font-medium">{destination.price}</span>
              <span className="text-xs opacity-60">{destination.duration}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/dashboard/destination/${destination.id}`}>
      <motion.div
        onHoverStart={() => {
          setIsHovered(true);
          setShowQuickView(true);
        }}
        onHoverEnd={() => {
          setIsHovered(false);
          setShowQuickView(false);
        }}
        whileHover={{ y: -10 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
          isDarkMode 
            ? "bg-gray-800 hover:bg-gray-750" 
            : "bg-white shadow-md hover:shadow-2xl"
        }`}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
            />
          </motion.div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white"
          >
            {destination.category}
          </motion.div>
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
            >
              {isLiked ? <Icons.HeartFilled /> : <Icons.Heart />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
            >
              <Icons.Share />
            </motion.button>
          </div>
          
          {/* Price Tag */}
          <motion.div
            animate={{ y: isHovered ? -5 : 0 }}
            className="absolute bottom-3 left-3 text-white"
          >
            <span className="text-2xl font-light">{destination.price}</span>
            <span className="text-xs opacity-80 ml-1">/person</span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-lg">{destination.name}</h3>
              <p className={`text-xs flex items-center gap-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <Icons.Location />
                {destination.location}
              </p>
            </div>
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full"
            >
              <Icons.Star />
              <span className="text-sm font-medium">{destination.rating}</span>
            </motion.div>
          </div>

          <p className={`text-sm line-clamp-2 mb-3 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {destination.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <Icons.Clock />
                {destination.duration}
              </span>
              <span className={`px-2 py-1 rounded-full ${
                isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}>
                {destination.bestTime}
              </span>
            </div>
            
            <motion.span
              animate={{ x: isHovered ? 5 : 0 }}
              className="text-emerald-400 text-sm"
            >
              View Details →
            </motion.span>
          </div>

          {/* Quick View Overlay */}
          <AnimatePresence>
            {showQuickView && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm"
              >
                <h4 className="text-white font-medium mb-2">Quick Highlights</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {destination.highlights?.slice(0, 3).map((highlight, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-white/20 rounded-full text-white">
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 text-xs text-white/80">
                  <span>⭐ {destination.rating} Rating</span>
                  <span>•</span>
                  <span>📍 {destination.location}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Link>
  );
}