"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import confetti from 'canvas-confetti';

export default function EnterpriseOnboardingPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (step === 4) {
      // Trigger confetti on final step
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [step]);

  const steps = [
    { number: 1, title: "Welcome", icon: "👋", gradient: "from-emerald-500 to-teal-500" },
    { number: 2, title: "Getting Started", icon: "🚀", gradient: "from-blue-500 to-indigo-500" },
    { number: 3, title: "Features", icon: "✨", gradient: "from-purple-500 to-pink-500" },
    { number: 4, title: "Ready", icon: "✅", gradient: "from-amber-500 to-orange-500" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDarkMode ? "bg-gray-950" : "bg-gray-50"
    } py-12 px-4`}>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-purple-500/5 to-blue-500/5" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, -180, -270, -360],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Bar with 3D Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />
            
            {/* Progress Line */}
            <motion.div
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((s, idx) => (
                <motion.div
                  key={s.number}
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl cursor-pointer transition-all duration-300 ${
                      step >= s.number
                        ? `bg-gradient-to-r ${s.gradient} text-white`
                        : isDarkMode
                          ? "bg-gray-800 text-gray-400 border border-gray-700"
                          : "bg-white text-gray-500 border border-gray-200"
                    }`}
                    animate={step === s.number ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    onClick={() => step > s.number && setStep(s.number)}
                  >
                    {step > s.number ? "✓" : s.icon}
                  </motion.div>
                  <span className={`text-sm mt-3 font-medium ${
                    step >= s.number
                      ? "text-emerald-500"
                      : isDarkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                  }`}>
                    {s.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden rounded-3xl ${
              isDarkMode
                ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/50"
                : "bg-white/50 backdrop-blur-xl border-gray-200/50"
            } border shadow-2xl`}
          >
            {/* Card Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            
            <div className="relative p-8 md:p-12">
              {/* Step 1: Welcome */}
              {step === 1 && (
                <motion.div variants={itemVariants} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative w-32 h-32 mx-auto mb-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping opacity-20" />
                    <div className="absolute inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-5xl">🏢</span>
                    </div>
                  </motion.div>

                  <motion.h2 
                    variants={itemVariants}
                    className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                  >
                    Welcome to Enterprise Dashboard!
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className={`text-lg mb-12 max-w-2xl mx-auto ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Your application is being reviewed. While you wait, let's explore the amazing features waiting for you.
                  </motion.p>

                  <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                  >
                    {[
                      { 
                        icon: "📊", 
                        title: "Advanced Analytics", 
                        desc: "Real-time insights into your business performance",
                        gradient: "from-emerald-500 to-teal-500",
                        stats: "24/7 Live"
                      },
                      { 
                        icon: "🏛️", 
                        title: "Site Management", 
                        desc: "Add and manage multiple heritage sites",
                        gradient: "from-blue-500 to-indigo-500",
                        stats: "Unlimited"
                      },
                      { 
                        icon: "💰", 
                        title: "Revenue Tracking", 
                        desc: "Monitor earnings and transactions",
                        gradient: "from-purple-500 to-pink-500",
                        stats: "Real-time"
                      },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className={`relative p-6 rounded-2xl overflow-hidden group ${
                          isDarkMode ? "bg-gray-800/50" : "bg-white/50"
                        } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-lg`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        <span className="text-4xl mb-3 block">{item.icon}</span>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {item.desc}
                        </p>
                        <div className={`text-xs font-medium text-emerald-500 bg-emerald-500/10 inline-block px-3 py-1 rounded-full`}>
                          {item.stats}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStep(2)}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center gap-2 group"
                    >
                      Start Exploring
                      <motion.svg
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Getting Started */}
              {step === 2 && (
                <motion.div variants={itemVariants}>
                  <motion.h2 
                    variants={itemVariants}
                    className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
                  >
                    Getting Started Guide
                  </motion.h2>

                  <div className="space-y-4 mb-8">
                    {[
                      { 
                        step: 1, 
                        title: "Complete Your Profile", 
                        desc: "Add your company logo, detailed description, and complete contact information",
                        icon: "👤",
                        gradient: "from-emerald-500 to-teal-500",
                        tips: ["Upload high-quality logo", "Write compelling description", "Add all contact details"]
                      },
                      { 
                        step: 2, 
                        title: "Add Your First Heritage Site", 
                        desc: "List heritage sites with stunning images, detailed descriptions, and competitive pricing",
                        icon: "🏛️",
                        gradient: "from-blue-500 to-indigo-500",
                        tips: ["Use high-resolution images", "Include historical significance", "Set competitive prices"]
                      },
                      { 
                        step: 3, 
                        title: "Set Up Payment Gateway", 
                        desc: "Configure secure payment methods for hassle-free ticket sales",
                        icon: "💳",
                        gradient: "from-purple-500 to-pink-500",
                        tips: ["Connect bank account", "Set up UPI/QR codes", "Configure tax settings"]
                      },
                      { 
                        step: 4, 
                        title: "Build Your Team", 
                        desc: "Add team members with different permission levels to manage operations",
                        icon: "👥",
                        gradient: "from-amber-500 to-orange-500",
                        tips: ["Assign roles", "Set permissions", "Track team activity"]
                      },
                    ].map((item) => (
                      <motion.div
                        key={item.step}
                        whileHover={{ scale: 1.02, x: 10 }}
                        className={`relative p-6 rounded-xl ${
                          isDarkMode ? "bg-gray-800/30" : "bg-white/30"
                        } border ${isDarkMode ? "border-gray-700/30" : "border-gray-200/30"} group cursor-pointer`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{item.icon}</span>
                              <h3 className="text-xl font-semibold">{item.title}</h3>
                            </div>
                            <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {item.desc}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {item.tips.map((tip, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    isDarkMode ? "bg-gray-700/50" : "bg-gray-100/50"
                                  }`}
                                >
                                  💡 {tip}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Features */}
              {step === 3 && (
                <motion.div variants={itemVariants}>
                  <motion.h2 
                    variants={itemVariants}
                    className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  >
                    Powerful Enterprise Features
                  </motion.h2>

                  <motion.p 
                    variants={itemVariants}
                    className={`text-center mb-12 max-w-2xl mx-auto ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Everything you need to manage, grow, and scale your heritage business
                  </motion.p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {[
                      { 
                        icon: "📈", 
                        title: "Advanced Analytics", 
                        desc: "Real-time insights into your business performance with predictive analytics",
                        gradient: "from-emerald-500 to-teal-500",
                        metrics: ["Revenue forecast", "Visitor trends", "Peak seasons"]
                      },
                      { 
                        icon: "🎫", 
                        title: "Smart Ticketing", 
                        desc: "Dynamic pricing, bulk discounts, and automated QR code generation",
                        gradient: "from-blue-500 to-indigo-500",
                        metrics: ["Dynamic pricing", "Group discounts", "QR verification"]
                      },
                      { 
                        icon: "📱", 
                        title: "Mobile Integration", 
                        desc: "Fully responsive dashboard and mobile app for on-the-go management",
                        gradient: "from-purple-500 to-pink-500",
                        metrics: ["Real-time updates", "Push notifications", "Offline mode"]
                      },
                      { 
                        icon: "💬", 
                        title: "Customer Engagement", 
                        desc: "Manage reviews, respond to queries, and build customer loyalty",
                        gradient: "from-amber-500 to-orange-500",
                        metrics: ["Review management", "Automated responses", "Loyalty programs"]
                      },
                      { 
                        icon: "📊", 
                        title: "Financial Reports", 
                        desc: "Detailed revenue reports, tax calculations, and export options",
                        gradient: "from-red-500 to-pink-500",
                        metrics: ["GST reports", "Invoice generation", "Bank reconciliation"]
                      },
                      { 
                        icon: "🔔", 
                        title: "Smart Alerts", 
                        desc: "Automated notifications for bookings, cancellations, and special events",
                        gradient: "from-cyan-500 to-blue-500",
                        metrics: ["Email alerts", "SMS notifications", "In-app messages"]
                      },
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`relative p-6 rounded-xl overflow-hidden group ${
                          isDarkMode ? "bg-gray-800/30" : "bg-white/30"
                        } border ${isDarkMode ? "border-gray-700/30" : "border-gray-200/30"} shadow-lg`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white text-2xl`}>
                              {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold">{feature.title}</h3>
                          </div>
                          <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {feature.desc}
                          </p>
                          <div className="space-y-1">
                            {feature.metrics.map((metric, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{metric}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Ready */}
              {step === 4 && (
                <motion.div variants={itemVariants} className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative w-40 h-40 mx-auto mb-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse opacity-20" style={{ animationDelay: "0.5s" }} />
                    <div className="absolute inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-6xl">✨</span>
                    </div>
                  </motion.div>

                  <motion.h2 
                    variants={itemVariants}
                    className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                  >
                    You're All Set!
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className={`text-xl mb-8 max-w-2xl mx-auto ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Your enterprise account is ready for approval. Once verified, you'll have immediate access to all these powerful features.
                  </motion.p>

                  <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                  >
                    {[
                      { label: "Sites Limit", value: "Unlimited", icon: "🏛️" },
                      { label: "Team Members", value: "Up to 10", icon: "👥" },
                      { label: "Commission", value: "5%", icon: "💰" },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-xl ${
                          isDarkMode ? "bg-gray-800/50" : "bg-white/50"
                        }`}
                      >
                        <span className="text-3xl mb-2 block">{item.icon}</span>
                        <p className="text-2xl font-bold text-emerald-500">{item.value}</p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/auth/pending-approval')}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                      Check Application Status
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/dashboard')}
                      className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 border ${
                        isDarkMode
                          ? "border-gray-700 hover:bg-gray-800 text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Go to Dashboard
                    </motion.button>
                  </motion.div>

                  <motion.p 
                    variants={itemVariants}
                    className={`mt-6 text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    You'll receive an email notification once your account is approved
                  </motion.p>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex justify-between mt-12 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800"
              >
                {step > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(step - 1)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 border ${
                      isDarkMode
                        ? "border-gray-700 hover:bg-gray-800"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </motion.button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
                  >
                    Continue
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ) : null}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Setup Progress", value: `${(step / 4) * 100}%`, icon: "📊" },
            { label: "Time Remaining", value: "2-3 mins", icon: "⏱️" },
            { label: "Features Unlocked", value: `${step * 3}`, icon: "🔓" },
            { label: "Next Step", value: steps[step]?.title || "Complete", icon: "🎯" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800/30" : "bg-white/30"
              } backdrop-blur-sm border ${isDarkMode ? "border-gray-700/30" : "border-gray-200/30"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{stat.value}</p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Need assistance? Contact our enterprise support at{" "}
            <a href="mailto:enterprise@samskruthi.com" className="text-emerald-500 hover:text-emerald-400 font-medium">
              enterprise@samskruthi.com
            </a>
          </p>
        </motion.div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}