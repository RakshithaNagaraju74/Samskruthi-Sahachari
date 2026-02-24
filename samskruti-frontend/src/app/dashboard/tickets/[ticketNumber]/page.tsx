"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { ticketService, Ticket } from '@/services/ticketService';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PageProps {
    params: {
        ticketNumber: string;
    };
}

export default function TicketDetailPage({ params }: PageProps) {
    const { isDarkMode } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/auth');
            return;
        }

        fetchTicket();
    }, [params.ticketNumber, user, router]);

    const fetchTicket = async () => {
        setLoading(true);
        try {
            const ticketData = await ticketService.getTicket(params.ticketNumber);
            if (ticketData) {
                setTicket(ticketData);
            } else {
                router.push('/dashboard/tickets');
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
            router.push('/dashboard/tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelTicket = async () => {
        if (!ticket || !user) return;
        
        setIsCancelling(true);
        try {
            const result = await ticketService.cancelTicket(
                ticket.ticket_number,
                user.id,
                cancelReason
            );
            
            if (result.success) {
                setShowCancelModal(false);
                fetchTicket(); // Refresh ticket data
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error cancelling ticket:', error);
            alert('Failed to cancel ticket. Please try again.');
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-500';
            case 'used': return 'text-blue-500';
            case 'expired': return 'text-orange-500';
            case 'cancelled': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className={`min-h-screen font-sans ${
            isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
        }`}>
            
            <main className="p-6">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className={`mb-6 px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        }`}
                    >
                        ← Back
                    </button>

                    {/* Ticket Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl overflow-hidden ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } shadow-2xl`}
                    >
                        {/* Header with Site Image */}
                        <div className="relative h-48 w-full">
                            <Image
                                src={!imageError ? (ticket.site_image || ticket.destination_image || '/images/placeholder.jpg') : '/images/placeholder.jpg'}
                                alt={ticket.site_name || ticket.destination_name || "Heritage Site"}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            
                            <div className="absolute bottom-4 left-6 text-white">
                                <h1 className="text-3xl font-light mb-1">{ticket.site_name || ticket.destination_name}</h1>
                                <p className="text-sm opacity-80">{ticket.site_location || 'Karnataka'}</p>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 ${
                                    getStatusColor(ticket.status)
                                }`}>
                                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Ticket Content */}
                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column - QR Code */}
                                <div className={`flex flex-col items-center justify-center p-6 md:border-r md:border-dashed ${
                                    isDarkMode ? 'md:border-gray-700' : 'md:border-gray-200'
                                }`}>
                                    {ticket.qr_code && (
                                        <>
                                            <div className="relative w-48 h-48 mb-4">
                                                <Image
                                                    src={ticket.qr_code}
                                                    alt="Ticket QR Code"
                                                    fill
                                                    className="object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <p className={`text-xs text-center ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                Scan this QR code at the entrance
                                            </p>
                                            <p className="text-xs font-mono text-emerald-500 mt-2">
                                                {ticket.ticket_number}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Right Column - Ticket Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className={`text-sm font-medium mb-3 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Ticket Details
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Travel Date</span>
                                                <span className="font-medium">
                                                    {formatDate(ticket.travel_date)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm">Number of Travelers</span>
                                                <span className="font-medium">
                                                    {ticket.travelers} {ticket.travelers === 1 ? 'Person' : 'Persons'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm">Total Price</span>
                                                <span className="font-medium text-emerald-500">
                                                    ₹{ticket.total_price?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm">Issued On</span>
                                                <span className="font-medium">
                                                    {formatDate(ticket.issued_at)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm">Valid Until</span>
                                                <span className="font-medium">
                                                    {formatDate(ticket.expires_at)}
                                                </span>
                                            </div>

                                            {ticket.used_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Used On</span>
                                                    <span className="font-medium">
                                                        {formatDateTime(ticket.used_at)}
                                                    </span>
                                                </div>
                                            )}

                                            {ticket.cancelled_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm">Cancelled On</span>
                                                    <span className="font-medium">
                                                        {formatDateTime(ticket.cancelled_at)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {ticket.status === 'active' && (
                                        <div className={`pt-4 border-t ${
                                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                        }`}>
                                            <button
                                                onClick={() => setShowCancelModal(true)}
                                                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                Cancel Ticket
                                            </button>
                                            <p className="text-xs text-center mt-2 text-orange-500">
                                                * Cancellations allowed up to 24 hours before travel
                                            </p>
                                        </div>
                                    )}

                                    {ticket.status === 'used' && ticket.used_at && (
                                        <div className={`p-4 rounded-lg ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                        }`}>
                                            <p className="text-sm text-center">
                                                ✓ Ticket was used on {formatDateTime(ticket.used_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <div className={`mt-8 p-6 rounded-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg`}>
                        <h3 className="font-medium mb-3">Important Instructions</h3>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500">•</span>
                                Present this QR code at the entrance for verification
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500">•</span>
                                Carry a valid ID proof matching the ticket holder name
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500">•</span>
                                Arrive at least 30 minutes before your scheduled time
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500">•</span>
                                Ticket is non-transferable after 24 hours of booking
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className={`max-w-md w-full rounded-xl ${
                            isDarkMode ? 'bg-gray-900' : 'bg-white'
                        } p-6 shadow-xl`}
                    >
                        <h2 className="text-xl font-bold mb-4">Cancel Ticket</h2>
                        <p className="mb-4">Are you sure you want to cancel this ticket?</p>
                        
                        <div className="mb-4">
                            <label className="block text-sm mb-2">Reason (Optional)</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Tell us why you're cancelling..."
                                rows={3}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                    isDarkMode
                                        ? 'bg-gray-800 border-gray-700 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className={`flex-1 py-2 rounded-lg transition-colors ${
                                    isDarkMode
                                        ? 'bg-gray-800 hover:bg-gray-700'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCancelTicket}
                                disabled={isCancelling}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}