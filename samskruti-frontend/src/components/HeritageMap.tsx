"use client";

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(
  () => import('@/components/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }
);

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

export default function HeritageMap(props: HeritageMapProps) {
  return <LeafletMap {...props} />;
}