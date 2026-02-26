"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import confetti from 'canvas-confetti';

export default function PendingApprovalPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(48); // 48 hours estimated time
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch application status periodically
  useEffect(() => {
    // Trigger confetti on load
    const duration = 3 * 1000;
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

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 60000); // Decrease every minute

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const handleCheckStatus = async () => {
    // API call to check verification status
    // Redirect to appropriate dashboard if approved
    router.push('/dashboard');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDarkMode ? "bg-gray-950" : "bg-gray-50"
    }`}>
      
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-32 h-32 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
            >
              Application Submitted!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Thank you for joining our community. Your application is being reviewed.
            </motion.p>
          </div>

          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Estimated Time Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-6 rounded-2xl ${
                isDarkMode ? "bg-gray-800/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
              } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-xl`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Estimated Time</p>
                  <p className="text-2xl font-bold text-emerald-500">{timeLeft} hours</p>
                </div>
              </div>
            </motion.div>

            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl ${
                isDarkMode ? "bg-gray-800/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
              } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-xl`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Current Status</p>
                  <p className="text-2xl font-bold text-yellow-500">Under Review</p>
                </div>
              </div>
            </motion.div>

            {/* Queue Position Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className={`p-6 rounded-2xl ${
                isDarkMode ? "bg-gray-800/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
              } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-xl`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Queue Position</p>
                  <p className="text-2xl font-bold text-purple-500">#247</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`p-8 rounded-2xl mb-8 ${
              isDarkMode ? "bg-gray-800/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
            } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-xl`}
          >
            <h3 className="text-lg font-medium mb-6">Application Progress</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
              
              {/* Timeline Items */}
              <div className="space-y-8">
                {/* Step 1: Submitted */}
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-3">
                    <h4 className="text-lg font-medium mb-1">Application Submitted</h4>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Your application has been successfully submitted
                    </p>
                    <p className="text-xs text-emerald-500 mt-2">Completed • Just now</p>
                  </div>
                </div>

                {/* Step 2: Document Verification */}
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center animate-pulse">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-3">
                    <h4 className="text-lg font-medium mb-1">Document Verification</h4>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Our team is verifying your uploaded documents
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        />
                      </div>
                      <span className="text-xs text-yellow-500">In Progress</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Background Check */}
                <div className="relative flex items-start gap-4 opacity-50">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-3">
                    <h4 className="text-lg font-medium mb-1">Background Check</h4>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Security verification in progress
                    </p>
                  </div>
                </div>

                {/* Step 4: Final Approval */}
                <div className="relative flex items-start gap-4 opacity-30">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-3">
                    <h4 className="text-lg font-medium mb-1">Final Approval</h4>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Account activation pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What Happens Next Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className={`p-6 rounded-2xl ${
              isDarkMode ? "bg-gray-800/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
            } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-xl`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium">Email Notification</h4>
              </div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                You'll receive an email once your application is reviewed. We'll notify you about the decision within 48 hours.
              </p>
            </div>

            <div className={`p-6 rounded-2xl ${
              isDarkMode ? "bg-gray-800/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
            } border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} shadow-xl`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium">Estimated Timeline</h4>
              </div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Most applications are reviewed within 24-48 hours. You can check status anytime.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCheckStatus}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Check Status
            </motion.button>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 border ${
                  isDarkMode
                    ? "border-gray-700 hover:bg-gray-800 text-white"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                Go to Dashboard
              </motion.button>
            </Link>

            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 border ${
                  isDarkMode
                    ? "border-gray-700 hover:bg-gray-800 text-white"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                Return Home
              </motion.button>
            </Link>
          </motion.div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center"
          >
            <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              Need help? Contact our support team at{" "}
              <a href="mailto:support@samskruthi.com" className="text-emerald-500 hover:text-emerald-400">
                support@samskruthi.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}