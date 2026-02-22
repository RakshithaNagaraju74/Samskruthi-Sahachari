// components/TravelTimeline.tsx
"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

interface TimelineEvent {
  id: number;
  date: string;
  destination: string;
  image: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  type: 'visited' | 'booked';
}

interface TravelTimelineProps {
  events: TimelineEvent[];
}

export default function TravelTimeline({ events }: TravelTimelineProps) {
  const { isDarkMode } = useTheme();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'visited' ? '✓' : '📅';
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`} />

      <div className="space-y-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            {/* Timeline dot */}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
              getStatusColor(event.status)
            } text-white text-sm`}>
              {getTypeIcon(event.type)}
            </div>

            {/* Content */}
            <div className={`flex-1 p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white'
            } shadow-md`}>
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={event.image}
                    alt={event.destination}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{event.destination}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'completed' 
                        ? 'bg-green-500/20 text-green-500'
                        : event.status === 'upcoming'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-red-500/20 text-red-500'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}