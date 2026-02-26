// app/dashboard/tickets/page.tsx - Complete updated version
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService, ExtendedTicket } from '@/services/bookingService';
import Image from 'next/image';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import TicketCheckIn from '@/components/TicketCheckIn';

export default function TicketsPage() {
    const { isDarkMode } = useTheme();
    const { user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    
    const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<ExtendedTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [checkInTicket, setCheckInTicket] = useState<ExtendedTicket | null>(null);
    const [sortBy, setSortBy] = useState<'date' | 'status' | 'site'>('date');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    // Helper function to get user ID from token
    const getUserIdFromToken = useCallback((): number | null => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                return null;
            }
            
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            const userId = payload.id || payload.userId || payload.sub;
            return userId ? Number(userId) : null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }, []);

    // Define fetchTickets FIRST before using it in useEffect
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const userId = getUserIdFromToken();
            if (!userId) {
                console.error('No user ID available to fetch tickets');
                setLoading(false);
                return;
            }
            
            console.log('🎟️ Fetching tickets for user:', userId);
            
            // Use bookingService which now joins ticket and booking data
            const userTickets = await bookingService.getUserTickets();
            console.log('✅ Fetched tickets with booking data:', userTickets.length);
            
            setTickets(userTickets);
            setFilteredTickets(userTickets);
        } catch (error) {
            console.error('❌ Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    }, [getUserIdFromToken]);

    // Define other functions
    const generateQRCode = useCallback(async (ticketNumber: string) => {
        try {
            const url = await QRCode.toDataURL(ticketNumber);
            setQrCodeUrl(url);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }, []);

    const filterAndSortTickets = useCallback(() => {
        let filtered = [...tickets];
        
        // Apply status filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(t => t.status === activeFilter);
        }
        
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                (t.site_name?.toLowerCase().includes(query) || false) ||
                (t.ticket_number?.toLowerCase().includes(query) || false)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'site':
                    return (a.site_name || '').localeCompare(b.site_name || '');
                default:
                    return 0;
            }
        });
        
        setFilteredTickets(filtered);
    }, [tickets, activeFilter, searchQuery, sortBy]);

    // NOW use fetchTickets in useEffect after it's defined
    useEffect(() => {
        const userId = getUserIdFromToken();
        if (!userId && !isUserLoading) {
            console.log('No user ID found, redirecting to login...');
            router.push('/auth');
            return;
        }
        
        fetchTickets();
    }, [router, isUserLoading, getUserIdFromToken, fetchTickets]);

    // Add event listeners for booking updates
    useEffect(() => {
        const handleBookingUpdate = () => {
            console.log('🔄 Booking updated, refreshing tickets...');
            fetchTickets();
        };

        window.addEventListener('booking-updated', handleBookingUpdate);
        window.addEventListener('ticket-updated', handleBookingUpdate);
        
        return () => {
            window.removeEventListener('booking-updated', handleBookingUpdate);
            window.removeEventListener('ticket-updated', handleBookingUpdate);
        };
    }, [fetchTickets]);

    useEffect(() => {
        filterAndSortTickets();
    }, [filterAndSortTickets]);

    // Generate QR code when ticket is selected
    useEffect(() => {
        if (selectedTicket) {
            generateQRCode(selectedTicket.ticket_number);
        }
    }, [selectedTicket, generateQRCode]);

    // Check expiration status function
    const checkExpirationStatus = (ticket: ExtendedTicket) => {
        const now = new Date();
        const expiresAt = new Date(ticket.expires_at);
        
        if (ticket.status === 'active' && expiresAt < now) {
            return 'expired';
        }
        return ticket.status;
    };

    // Helper functions for status counts and styling
    const getStatusCount = (status: string) => {
        if (status === 'all') return tickets.length;
        return tickets.filter(t => t.status === status).length;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'from-green-500 to-emerald-500';
            case 'used': return 'from-blue-500 to-indigo-500';
            case 'expired': return 'from-orange-500 to-red-500';
            case 'cancelled': return 'from-gray-500 to-gray-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'used': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'expired': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'cancelled': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return '✅';
            case 'used': return '✓';
            case 'expired': return '⏰';
            case 'cancelled': return '❌';
            default: return '🎫';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    const handleViewQR = async (ticket: ExtendedTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Viewing QR for ticket:', ticket.ticket_number);
        setSelectedTicket(ticket);
        await generateQRCode(ticket.ticket_number);
        setShowQRModal(true);
    };

    const handleCheckInClick = (ticket: ExtendedTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCheckInTicket(ticket);
        setShowCheckIn(true);
    };

    const handleDownloadTicket = async (ticket: ExtendedTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Downloading ticket:', ticket.ticket_number);
        try {
            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.setTextColor(16, 185, 129);
            doc.text('KARNATAKA HERITAGE', 105, 20, { align: 'center' });
            
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('ENTRY TICKET', 105, 30, { align: 'center' });
            
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.5);
            doc.line(20, 35, 190, 35);
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            
            const qrDataUrl = await QRCode.toDataURL(ticket.ticket_number);
            
            const details = [
                ['Ticket Number:', ticket.ticket_number],
                ['Site Name:', ticket.site_name || 'Heritage Site'],
                ['Location:', ticket.site_location || 'Karnataka'],
                ['Issue Date:', formatDate(ticket.issued_at) + ' ' + formatTime(ticket.issued_at)],
                ['Valid Until:', formatDate(ticket.expires_at)],
                ['Status:', ticket.status.toUpperCase()],
                ['Travel Date:', ticket.travel_date ? formatDate(ticket.travel_date) : 'N/A'],
                ['Travelers:', ticket.travelers ? ticket.travelers.toString() : '1'],
                ['Total Amount:', ticket.total_amount ? `₹${ticket.total_amount}` : 'N/A'],
                ['Booking Ref:', ticket.booking_reference || `BK${ticket.booking_id}`],
            ];
            
            let y = 50;
            details.forEach(([label, value]) => {
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(label, 20, y);
                doc.setTextColor(0, 0, 0);
                doc.text(value.toString(), 60, y);
                y += 6;
            });
            
            if (qrDataUrl) {
                doc.addImage(qrDataUrl, 'PNG', 150, 45, 40, 40);
            }
            
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Please present this ticket at the entrance.', 105, 160, { align: 'center' });
            doc.text('Valid ID proof is required.', 105, 165, { align: 'center' });
            
            doc.save(`ticket-${ticket.ticket_number}.pdf`);
            
        } catch (error) {
            console.error('Error downloading ticket:', error);
            const content = `
KARNATAKA HERITAGE - ENTRY TICKET
=================================
Ticket Number: ${ticket.ticket_number}
Site: ${ticket.site_name || 'Heritage Site'}
Location: ${ticket.site_location || 'Karnataka'}
Issue Date: ${formatDate(ticket.issued_at)} ${formatTime(ticket.issued_at)}
Valid Until: ${formatDate(ticket.expires_at)}
Status: ${ticket.status}
Travel Date: ${ticket.travel_date ? formatDate(ticket.travel_date) : 'N/A'}
Travelers: ${ticket.travelers || 1}
Total Amount: ${ticket.total_amount ? `₹${ticket.total_amount}` : 'N/A'}
Booking Reference: ${ticket.booking_reference || `BK${ticket.booking_id}`}

Please present this ticket at the entrance.
Valid ID proof is required.
            `;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${ticket.ticket_number}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    const handleViewDetails = (ticket: ExtendedTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Viewing ticket:', ticket.ticket_number);
        localStorage.setItem('selectedTicket', JSON.stringify(ticket));
        router.push(`/dashboard/tickets/${ticket.ticket_number}`);
    };

    const stats = [
        { label: 'Total Tickets', value: tickets.length, icon: '🎫', color: 'from-purple-500 to-pink-500' },
        { label: 'Active', value: tickets.filter(t => t.status === 'active').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
        { label: 'Used', value: tickets.filter(t => t.status === 'used').length, icon: '✓', color: 'from-blue-500 to-indigo-500' },
        { label: 'Expired', value: tickets.filter(t => t.status === 'expired').length, icon: '⏰', color: 'from-orange-500 to-red-500' },
    ];

    if (isUserLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}>
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="mt-6 text-emerald-500 font-medium animate-pulse">Loading your tickets...</p>
                </div>
            </div>
        );
    }

    const userId = getUserIdFromToken();
    if (!userId) {
        return null;
    }

    return (
        <div className={`min-h-screen font-sans ${
            isDarkMode 
                ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
                : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
        }`}>
            
            {/* Animated Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
                />
            </div>

            <main className="p-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Enhanced Header with Glassmorphism */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mb-8 overflow-hidden rounded-2xl backdrop-blur-xl"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${
                            isDarkMode 
                                ? 'from-emerald-500/30 via-teal-500/30 to-blue-500/30' 
                                : 'from-emerald-500/20 via-teal-500/20 to-blue-500/20'
                        }`} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        
                        <div className="relative flex flex-col md:flex-row items-center justify-between p-8">
                            <div className="mb-4 md:mb-0">
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-5xl font-light mb-3"
                                >
                                    My <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Tickets</span>
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                >
                                    {tickets.length === 0 
                                        ? "You haven't booked any tickets yet" 
                                        : `You have ${tickets.length} amazing experience${tickets.length !== 1 ? 's' : ''} waiting for you!`}
                                </motion.p>
                            </div>
                            
                            <div className="flex gap-3">
                                {/* Refresh Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fetchTickets()}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                    title="Refresh Tickets"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/dashboard')}
                                    className={`px-8 py-3 rounded-xl transition-all flex items-center gap-2 backdrop-blur-xl ${
                                        isDarkMode 
                                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                                            : 'bg-black/5 hover:bg-black/10 text-gray-900 border border-black/10'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Explore More Sites
                                </motion.button>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group perspective"
                            >
                                <div className={`relative overflow-hidden rounded-2xl ${
                                    isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white/70 backdrop-blur-xl'
                                } shadow-xl border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'} transform-gpu preserve-3d transition-all duration-300 hover:rotate-x-5`}>
                                    
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                                    
                                    {/* Animated Shine Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        animate={{
                                            x: ['-100%', '200%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                        }}
                                    />
                                    
                                    <div className="relative p-5">
                                        <motion.div 
                                            className="text-4xl mb-3"
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                            }}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                        <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                            {stat.value}
                                        </div>
                                        <div className={`text-xs mt-2 font-medium uppercase tracking-wider ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            {stat.label}
                                        </div>
                                    </div>

                                    {/* Animated Bottom Border */}
                                    <motion.div 
                                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
                                        initial={{ scaleX: 0 }}
                                        whileHover={{ scaleX: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative mb-8"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${
                            isDarkMode 
                                ? 'from-emerald-500/20 via-teal-500/20 to-blue-500/20' 
                                : 'from-emerald-500/10 via-teal-500/10 to-blue-500/10'
                        } rounded-2xl blur-xl`} />
                        
                        <div className={`relative p-6 rounded-2xl ${
                            isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white/50 backdrop-blur-xl'
                        } border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Bar */}
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        placeholder="Search by site name or ticket number..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full px-5 py-4 pl-14 rounded-xl text-base border transition-all ${
                                            isDarkMode
                                                ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20'
                                                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                        } focus:outline-none`}
                                    />
                                    <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </span>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-200/50 rounded-full p-1 backdrop-blur-sm"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'site')}
                                        className={`px-4 py-4 rounded-xl text-sm ${
                                            isDarkMode
                                                ? 'bg-gray-900/50 border-gray-700 text-white'
                                                : 'bg-white/50 border-gray-200 text-gray-900'
                                        } border focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-xl`}
                                    >
                                        <option value="date">Latest First</option>
                                        <option value="status">Status</option>
                                        <option value="site">Site Name</option>
                                    </select>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    {['all', 'active', 'used', 'expired', 'cancelled'].map((filter) => (
                                        <motion.button
                                            key={filter}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`relative px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all overflow-hidden ${
                                                activeFilter === filter
                                                    ? 'text-white'
                                                    : isDarkMode
                                                        ? 'text-gray-400 hover:text-white'
                                                        : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {activeFilter === filter && (
                                                <motion.div
                                                    layoutId="activeFilter"
                                                    className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(filter)}`}
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center gap-2">
                                                {filter === 'all' ? '🎫 All' : `${getStatusIcon(filter)} ${filter}`}
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    activeFilter === filter
                                                        ? 'bg-white/20'
                                                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                                }`}>
                                                    {getStatusCount(filter)}
                                                </span>
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tickets Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="relative">
                                <motion.div 
                                    className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-500 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div 
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full opacity-20" />
                                </motion.div>
                            </div>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-center py-20 rounded-2xl ${
                                isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white/70 backdrop-blur-xl'
                            } shadow-xl border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'}`}
                        >
                            <motion.div 
                                className="text-8xl mb-6"
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                }}
                            >
                                🎫
                            </motion.div>
                            <h3 className="text-3xl font-light mb-3">No tickets found</h3>
                            <p className={`text-base mb-8 max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {searchQuery || activeFilter !== 'all' 
                                    ? 'Try adjusting your search or filters to find what you\'re looking for'
                                    : "You haven't booked any tickets yet. Start your heritage journey today!"}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/dashboard')}
                                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium"
                            >
                                Explore Heritage Sites
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTickets.map((ticket, index) => {
                                const gradientColors = [
                                    'from-emerald-500 to-teal-500',
                                    'from-blue-500 to-indigo-500',
                                    'from-purple-500 to-pink-500',
                                    'from-amber-500 to-orange-500',
                                    'from-rose-500 to-red-500',
                                    'from-cyan-500 to-blue-500',
                                ];
                                const gradientClass = gradientColors[index % gradientColors.length];
                                
                                return (
                                    <motion.div
                                        key={ticket.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -12, scale: 1.02 }}
                                        className="group cursor-pointer perspective"
                                        onClick={() => router.push(`/dashboard/tickets/${ticket.ticket_number}`)}
                                    >
                                        {/* Premium Ticket Design */}
                                        <div className={`relative rounded-2xl overflow-hidden ${
                                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                                        } shadow-2xl hover:shadow-3xl transition-all duration-500 transform-gpu preserve-3d hover:rotate-x-2`}>
                                            
                                            {/* Animated Gradient Border */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                                            
                                            {/* Top Perforated Edge */}
                                            <div className="absolute top-0 left-0 right-0 flex justify-between px-3 z-10">
                                                {[...Array(25)].map((_, i) => (
                                                    <motion.div 
                                                        key={i} 
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                                                        }`}
                                                        animate={{
                                                            scale: [1, 1.5, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: i * 0.05,
                                                        }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Header with Gradient Background */}
                                            <div className="relative h-48 overflow-hidden">
                                                <motion.div
                                                    className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                
                                                {/* Status Badge */}
                                                <motion.div 
                                                    className="absolute top-4 right-4"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border-2 ${getStatusBadgeColor(ticket.status)}`}>
                                                        {ticket.status.toUpperCase()}
                                                    </span>
                                                </motion.div>

                                                {/* Site Info */}
                                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                                    <motion.h3 
                                                        className="font-bold text-xl mb-1 truncate"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        {ticket.site_name || 'Heritage Site'}
                                                    </motion.h3>
                                                    <motion.p 
                                                        className="text-sm opacity-90 truncate flex items-center gap-1"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {ticket.site_location || 'Karnataka'}
                                                    </motion.p>
                                                </div>
                                            </div>

                                            {/* Ticket Body */}
                                            <div className="p-5">
                                                {/* Ticket Number and QR */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <motion.div 
                                                            className={`p-2 rounded-lg ${
                                                                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                            }`}
                                                            whileHover={{ rotate: 15 }}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                            </svg>
                                                        </motion.div>
                                                        <div>
                                                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Ticket Number</p>
                                                            <p className="font-mono text-sm font-medium">#{ticket.ticket_number.slice(-8)}</p>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: 15 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => handleViewQR(ticket, e)}
                                                        className={`p-2.5 rounded-lg transition-all ${
                                                            isDarkMode 
                                                                ? 'hover:bg-gray-700 text-gray-400 hover:text-emerald-400' 
                                                                : 'hover:bg-gray-100 text-gray-600'
                                                        }`}
                                                        title="View QR Code"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                        </svg>
                                                    </motion.button>
                                                </div>

                                                {/* Quick Info */}
                                                <div className="grid grid-cols-2 gap-2 mb-3">
                                                    {ticket.travel_date && (
                                                        <div className="text-xs">
                                                            <span className="opacity-60">Travel Date:</span>
                                                            <p className="font-medium">{formatDate(ticket.travel_date)}</p>
                                                        </div>
                                                    )}
                                                    {ticket.total_amount && (
                                                        <div className="text-xs">
                                                            <span className="opacity-60">Amount:</span>
                                                            <p className="font-medium text-emerald-500">₹{ticket.total_amount}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Booking Reference */}
                                                <div className={`mb-3 p-2 rounded-lg ${
                                                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                                                }`}>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking Reference</p>
                                                    <p className="font-mono text-sm font-medium">{ticket.booking_reference || `BK${ticket.booking_id}`}</p>
                                                </div>

                                                {/* Middle Perforated Line */}
                                                <div className="relative my-3">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className={`w-full border-t-2 border-dashed ${
                                                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                        }`} />
                                                    </div>
                                                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                        <motion.div 
                                                            className={`w-8 h-8 rounded-full ${
                                                                isDarkMode ? 'bg-gray-800' : 'bg-white'
                                                            } flex items-center justify-center border-2 ${
                                                                isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                            }`}
                                                            animate={{
                                                                rotate: [0, 360],
                                                            }}
                                                            transition={{
                                                                duration: 10,
                                                                repeat: Infinity,
                                                                ease: "linear",
                                                            }}
                                                        >
                                                            <span className="text-emerald-500 text-sm">🎫</span>
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={(e) => handleViewDetails(ticket, e)}
                                                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-medium hover:shadow-lg transition-all flex items-center justify-center gap-1 group"
                                                    >
                                                        <span>View Details</span>
                                                        <motion.svg 
                                                            className="w-3 h-3"
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                            animate={{
                                                                x: [0, 3, 0],
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                repeat: Infinity,
                                                            }}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </motion.svg>
                                                    </motion.button>
                                                    
                                                    {ticket.status === 'active' && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05, rotate: 5 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => handleDownloadTicket(ticket, e)}
                                                                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center ${
                                                                    isDarkMode
                                                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                }`}
                                                                title="Download Ticket"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </motion.button>
                                                            
                                                            {/* Check-in Button */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.05, rotate: 5 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => handleCheckInClick(ticket, e)}
                                                                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center ${
                                                                    isDarkMode
                                                                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                                                                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                                                }`}
                                                                title="Check In at Site"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </motion.button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom Perforated Edge */}
                                            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3">
                                                {[...Array(25)].map((_, i) => (
                                                    <motion.div 
                                                        key={i} 
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                                                        }`}
                                                        animate={{
                                                            scale: [1, 1.5, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: i * 0.05,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && selectedTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => setShowQRModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, rotateX: -15 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.9, y: 20, rotateX: -15 }}
                            className={`max-w-md w-full rounded-2xl ${
                                isDarkMode ? 'bg-gray-900' : 'bg-white'
                            } p-8 shadow-2xl relative overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                            
                            <div className="relative text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                        Your Ticket QR Code
                                    </h3>
                                </motion.div>
                                
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                    {selectedTicket.site_name || 'Heritage Site'}
                                </motion.p>
                                
                                {/* QR Code Container */}
                                <motion.div 
                                    className="relative w-56 h-56 mx-auto mb-6 p-4 bg-white rounded-2xl shadow-xl"
                                    initial={{ scale: 0, rotateY: 180 }}
                                    animate={{ scale: 1, rotateY: 0 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                >
                                    {qrCodeUrl ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2 animate-pulse">🎫</div>
                                                <span className="text-gray-500 text-sm">Generating QR...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Scanning Animation */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent"
                                        animate={{
                                            y: ['-100%', '100%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                </motion.div>

                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="font-mono text-sm mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                >
                                    {selectedTicket.ticket_number}
                                </motion.p>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex gap-3"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleDownloadTicket(selectedTicket, e)}
                                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowQRModal(false)}
                                        className={`flex-1 py-3 rounded-xl font-medium ${
                                            isDarkMode
                                                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                        }`}
                                    >
                                        Close
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check-in Modal */}
            <AnimatePresence>
                {showCheckIn && checkInTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCheckIn(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={`max-w-md w-full rounded-2xl ${
                                isDarkMode ? 'bg-gray-900' : 'bg-white'
                            } p-8 shadow-2xl relative overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                <h3 className="text-2xl font-bold mb-4 text-center">
                                    Check In at <span className="text-emerald-500">{checkInTicket.site_name}</span>
                                </h3>
                                
                                <TicketCheckIn 
                                    ticketNumber={checkInTicket.ticket_number}
                                    onCheckInSuccess={() => {
                                        fetchTickets(); // Refresh tickets after successful check-in
                                        setShowCheckIn(false);
                                    }}
                                />
                                
                                <button
                                    onClick={() => setShowCheckIn(false)}
                                    className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}