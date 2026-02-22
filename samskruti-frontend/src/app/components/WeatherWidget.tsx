"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface WeatherData {
  city: string;
  temp: string;
  condition: string;
  icon: string;
  humidity: number;
  wind: string;
}

const weatherData: WeatherData[] = [
  { city: "Mysuru", temp: "28°C", condition: "Sunny", icon: "☀️", humidity: 65, wind: "12 km/h" },
  { city: "Coorg", temp: "22°C", condition: "Misty", icon: "🌫️", humidity: 85, wind: "8 km/h" },
  { city: "Gokarna", temp: "30°C", condition: "Clear", icon: "☀️", humidity: 70, wind: "15 km/h" },
  { city: "Hampi", temp: "32°C", condition: "Sunny", icon: "☀️", humidity: 55, wind: "10 km/h" },
];

export default function WeatherWidget() {
  const { isDarkMode } = useTheme();
  const [selectedCity, setSelectedCity] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshWeather = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSelectedCity((prev) => (prev + 1) % weatherData.length);
      setIsRefreshing(false);
    }, 1000);
  };

  const weather = weatherData[selectedCity];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-2xl relative overflow-hidden ${
        isDarkMode ? "bg-gray-800/50" : "bg-white shadow-sm"
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span>🌤️</span> Weather in Karnataka
          </h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={refreshWeather}
            className={`p-1 rounded-lg ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <motion.span
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              🔄
            </motion.span>
          </motion.button>
        </div>

        <motion.div
          key={selectedCity}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center justify-between"
        >
          <div>
            <h4 className="text-lg font-medium">{weather.city}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl">{weather.icon}</span>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{weather.temp}</p>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {weather.condition}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Humidity</span>
              <p className="font-medium">{weather.humidity}%</p>
            </div>
            <div className="text-sm mt-2">
              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Wind</span>
              <p className="font-medium">{weather.wind}</p>
            </div>
          </div>
        </motion.div>

        {/* City selector dots */}
        <div className="flex gap-1 mt-3 justify-center">
          {weatherData.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedCity(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedCity
                  ? "w-4 bg-emerald-500"
                  : isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500"
                    : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}