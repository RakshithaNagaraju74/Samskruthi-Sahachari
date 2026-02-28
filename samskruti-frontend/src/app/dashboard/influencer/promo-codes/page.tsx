"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  CheckCircle,
  Calendar,
  Users,
  Percent,
  IndianRupee,
} from "lucide-react";
import api from "@/services/api";

interface PromoCode {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CodeCard = ({
  code,
  onToggle,
  onDelete,
}: {
  code: PromoCode;
  onToggle: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usagePercentage = code.usage_limit
    ? (code.times_used / code.usage_limit) * 100
    : code.times_used > 0
    ? 100
    : 0;

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
    >
      {/* Status indicator */}
      <div
        className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
          code.is_active ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
        }`}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {code.code}
            </h3>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy code"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                code.discount_type === "percentage"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
              }`}
            >
              {code.discount_type === "percentage" ? (
                <Percent className="w-3 h-3 inline mr-1" />
              ) : (
                <IndianRupee className="w-3 h-3 inline mr-1" />
              )}
              {code.discount_value}
              {code.discount_type === "percentage" ? "%" : "₹"}
            </span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                code.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {code.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Usage progress */}
      {code.usage_limit && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Usage</span>
            <span>
              {code.times_used} / {code.usage_limit}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 text-sm mb-6">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(code.valid_from).toLocaleDateString()} -{" "}
            {new Date(code.valid_to).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>
            Used {code.times_used} time{code.times_used !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => onToggle(code.id, code.is_active)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            code.is_active
              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
          }`}
        >
          {code.is_active ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">
            {code.is_active ? "Deactivate" : "Activate"}
          </span>
        </button>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/influencer/promo-codes/${code.id}/edit`}
            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(code.id)}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = async () => {
    try {
      const response = await api.get("/promo-codes/my-codes");
      setCodes(response.data.data);
    } catch (error) {
      console.error("Failed to fetch promo codes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const toggleActive = async (id: number, current: boolean) => {
    try {
      await api.put(`/promo-codes/${id}`, { is_active: !current });
      fetchCodes();
    } catch (error) {
      console.error("Failed to update code", error);
    }
  };

  const deleteCode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await api.delete(`/promo-codes/${id}`);
      fetchCodes();
    } catch (error) {
      console.error("Failed to delete code", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-900/30" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading your codes...
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
              My Promo Codes
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Create and manage your discount codes
            </p>
          </div>
          <Link
            href="/dashboard/influencer/promo-codes/create"
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Code
            </span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </Link>
        </motion.div>

        {codes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-16 text-center"
          >
            <div className="text-8xl mb-6">🎫</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No promo codes yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Create your first promo code and start sharing!
            </p>
            <Link
              href="/dashboard/influencer/promo-codes/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Code
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {codes.map((code) => (
              <CodeCard
                key={code.id}
                code={code}
                onToggle={toggleActive}
                onDelete={deleteCode}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}