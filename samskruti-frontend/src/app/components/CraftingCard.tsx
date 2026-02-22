"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { CraftingPlace } from "@/types";

interface Props {
  crafting: CraftingPlace;
}

const Icons = {
  Location: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Phone: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Workshop: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
};

export default function CraftingCard({ crafting }: Props) {
  const { isDarkMode } = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div 
      className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
        isDarkMode 
          ? "bg-gray-800 hover:bg-gray-750" 
          : "bg-white shadow-md hover:shadow-xl"
      }`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="relative h-32">
        <Image
          src={crafting.image}
          alt={crafting.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-[10px] text-white flex items-center gap-1">
          <Icons.Workshop />
          <span>{crafting.type}</span>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-[10px] text-white flex items-center gap-1">
          <Icons.Star />
          <span>{crafting.rating}</span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-sm font-medium">{crafting.name}</h4>
          <span className="text-emerald-400 text-xs font-medium">{crafting.price}</span>
        </div>
        
        <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {crafting.craft}
        </p>

        {/* Quick Details */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className={`flex items-center gap-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            <Icons.Location />
            {crafting.location || "Nearby"}
          </span>
          {crafting.timing && (
            <span className={`flex items-center gap-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              <Icons.Clock />
              {crafting.timing}
            </span>
          )}
        </div>

        {/* Hover Details */}
        {showDetails && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm p-3 flex flex-col justify-center">
            <h5 className="text-white text-xs font-medium mb-2">Workshop Details</h5>
            <p className="text-[10px] text-white/80 mb-2 line-clamp-2">
              {crafting.description || "Learn traditional crafts from local artisans"}
            </p>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 text-[10px] py-1 bg-emerald-500 rounded text-white hover:bg-emerald-600 transition-colors">
                Book Workshop
              </button>
              {crafting.contact && (
                <button className="text-[10px] p-1 bg-white/10 rounded text-white hover:bg-white/20 transition-colors">
                  <Icons.Phone />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}