"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';
import { ticketService, Ticket } from '@/services/ticketService';
import TicketCard from '@/components/TicketCard';

export default function TicketsPage() {
    const { isDarkMode } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/auth');
            return;
        }
        
        fetchTickets();
    }, [user, router]);

    useEffect(() => {
        filterTickets();
    }, [tickets, activeFilter, searchQuery]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            if (user) {
                const userTickets = await ticketService.getUserTickets(user.id, true);
                setTickets(userTickets);
                setFilteredTickets(userTickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let filtered = [...tickets];
        
        // Filter by status
        if (activeFilter !== 'all') {
            filtered = filtered.filter(t => t.status === activeFilter);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                (t.site_name?.toLowerCase().includes(query) || false) ||
                (t.destination_name?.toLowerCase().includes(query) || false) ||
                (t.ticket_number?.toLowerCase().includes(query) || false) ||
                (t.site_location?.toLowerCase().includes(query) || false)
            );
        }
        
        setFilteredTickets(filtered);
    };

    const getStatusCount = (status: string) => {
        if (status === 'all') return tickets.length;
        return tickets.filter(t => t.status === status).length;
    };

    const stats = [
        { label: 'Total Tickets', value: tickets.length, icon: '🎫' },
        { label: 'Active', value: tickets.filter(t => t.status === 'active').length, icon: '✅' },
        { label: 'Used', value: tickets.filter(t => t.status === 'used').length, icon: '✓' },
        { label: 'Expired', value: tickets.filter(t => t.status === 'expired').length, icon: '⏰' },
    ];

    if (!user) return null;

    return (
        <div className={`min-h-screen font-sans ${
            isDarkMode 
                ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white" 
                : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
        }`}>
            
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-light mb-2">My Tickets</h1>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Manage your heritage site tickets
                            </p>
                        </div>
                        
                        <button
                            onClick={() => router.push('/dashboard')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                            }`}
                        >
                            ← Back
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-xl ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                                } shadow-lg`}
                            >
                                <div className="text-2xl mb-2">{stat.icon}</div>
                                <div className="text-2xl font-light text-emerald-500">
                                    {stat.value}
                                </div>
                                <div className={`text-xs mt-1 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search by site name or ticket number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full px-4 py-2 pl-10 rounded-lg text-sm border ${
                                    isDarkMode
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </span>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'active', 'used', 'expired', 'cancelled'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                                        activeFilter === filter
                                            ? 'bg-emerald-500 text-white'
                                            : isDarkMode
                                                ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {filter} ({getStatusCount(filter)})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tickets Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p className="text-lg mb-4">No tickets found</p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Explore Heritage Sites
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTickets.map((ticket, index) => (
                                <motion.div
                                    key={ticket.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <TicketCard 
                                        ticket={ticket}
                                        onDownload={() => ticketService.downloadTicket(ticket.ticket_number)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}