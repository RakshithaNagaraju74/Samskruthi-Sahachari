"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function AdminLoginPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Use your Express server URL - adjust the port if different
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData), // Don't add role here, let backend handle it
    });

    const data = await response.json();
    console.log("Login response:", data); // Debug log

    if (data.success) {
      // Check if user is admin
      if (data.data.user.role === "admin") {
        // Store token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Redirect to admin dashboard
        router.push("/admin/dashboard");
      } else {
        setError("Access denied. Admin privileges required.");
      }
    } else {
      setError(data.message || "Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Login failed. Please check if server is running.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className={`relative overflow-hidden rounded-3xl ${
          isDarkMode
            ? "bg-gray-900/50 backdrop-blur-xl border-gray-800/50"
            : "bg-white/50 backdrop-blur-xl border-gray-200/50"
        } border shadow-2xl p-8`}>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl"
              >
                👑
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Secure access for administrators only
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 text-white"
                      : "bg-white/50 border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                  placeholder="admin@samskruthi.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 text-white"
                      : "bg-white/50 border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                  placeholder="••••••••"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Access Dashboard"
                )}
              </motion.button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Secure Admin Access
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    This area is restricted to authorized personnel only. All actions are logged.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Main Site */}
            <Link
              href="/"
              className="mt-6 block text-center text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              ← Return to main website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}