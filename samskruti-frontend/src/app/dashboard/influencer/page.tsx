"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import api from "@/services/api";
import {
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Copy,
  CheckCircle,
} from "lucide-react";

interface Stats {
  total_earnings: number;
  total_bookings: number;
  top_codes: { code: string; bookings_count: number; earnings: number }[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  delay,
}: {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
  delay: number;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView && typeof value === "number") {
      let start = 0;
      const end = value;
      const duration = 1500;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    } else if (inView) {
      setCount(value as number);
    }
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      className="group relative"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
      />
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-3xl font-light text-emerald-500">↗</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === "number" ? `₹${count.toLocaleString()}` : value}
        </p>
      </div>
    </motion.div>
  );
};

const TopCodeRow = ({ code, bookings, earnings, index }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.tr
      variants={fadeInUp}
      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {code}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {bookings}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-400">
        ₹{earnings.toLocaleString()}
      </td>
    </motion.tr>
  );
};

export default function InfluencerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/influencer/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-900/30" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-light bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Influencer Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Track your earnings and promo code performance
            </p>
          </div>
          <Link
            href="/dashboard/influencer/promo-codes"
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              Manage Promo Codes
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <StatCard
            title="Total Earnings"
            value={stats?.total_earnings || 0}
            icon={TrendingUp}
            gradient="from-emerald-500 to-teal-500"
            delay={0.1}
          />
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings || 0}
            icon={Users}
            gradient="from-blue-500 to-indigo-500"
            delay={0.2}
          />
        </motion.div>

        {/* Top Performing Codes */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Top Performing Codes
              </h2>
            </div>
            {stats?.top_codes && stats.top_codes.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Based on earnings
              </span>
            )}
          </div>

          {stats?.top_codes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 dark:text-gray-400">
                No codes used yet. Share your promo codes to start earning!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats?.top_codes.map((code, idx) => (
                    <TopCodeRow key={code.code} {...code} index={idx} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Quick Tip */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            💡 <span className="font-medium">Pro tip:</span> Share your promo
            codes on social media to increase bookings and earnings!
          </p>
        </motion.div>
      </div>
    </div>
  );
}