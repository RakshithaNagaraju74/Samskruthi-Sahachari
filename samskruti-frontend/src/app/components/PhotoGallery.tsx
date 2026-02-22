"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  images: string[];
  title: string;
}

export default function PhotoGallery({ images, title }: Props) {
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const allImages = images.length > 0 ? images : [
    "/images/placeholder-1.jpg",
    "/images/placeholder-2.jpg",
    "/images/placeholder-3.jpg",
    "/images/placeholder-4.jpg",
  ];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative h-96 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => setShowLightbox(true)}
      >
        <Image
          src={allImages[selectedImage]}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Image Count */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
          {selectedImage + 1} / {allImages.length}
        </div>
        
        {/* View All Button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium">
            Click to view all photos
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3">
        {allImages.slice(0, 4).map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative h-24 rounded-lg overflow-hidden transition-all duration-300 ${
              selectedImage === index 
                ? "ring-2 ring-emerald-500 scale-105" 
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`${title} - ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative w-full max-w-6xl h-[80vh] mx-4">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-full rounded-2xl overflow-hidden">
              <Image
                src={allImages[selectedImage]}
                alt={title}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
            >
              →
            </button>

            {/* Thumbnails in Lightbox */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    selectedImage === index ? "ring-2 ring-emerald-500 scale-110" : "opacity-50"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}