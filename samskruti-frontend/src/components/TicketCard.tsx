"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { Ticket } from '@/services/ticketService';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface TicketCardProps {
    ticket: Ticket;
    onView?: () => void;
    onDownload?: () => void;
}

export default function TicketCard({ ticket, onView, onDownload }: TicketCardProps) {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'used': return 'bg-blue-500';
            case 'expired': return 'bg-orange-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const handleViewTicket = () => {
        router.push(`/dashboard/tickets/${ticket.ticket_number}`);
        if (onView) onView();
    };

    const isExpiringSoon = () => {
        if (ticket.status !== 'active') return false;
        try {
            const travelDate = new Date(ticket.travel_date);
            const today = new Date();
            const diffDays = Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays > 0;
        } catch (e) {
            return false;
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative rounded-xl overflow-hidden transition-all duration-500 cursor-pointer ${
                isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-750' 
                    : 'bg-white hover:shadow-xl'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleViewTicket}
        >
            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
                {isExpiringSoon() && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                        Expiring Soon
                    </span>
                )}
                <span className={`px-2 py-0.5 ${getStatusColor(ticket.status)} text-white text-[10px] rounded-full`}>
                    {getStatusText(ticket.status)}
                </span>
            </div>

            {/* Ticket Header with Site Image */}
            <div className="relative h-32 w-full">
                <Image
                    src={!imageError ? (ticket.site_image || '/images/placeholder.jpg') : '/images/placeholder.jpg'}
                    alt={ticket.site_name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                
                {/* Site Name Overlay */}
                <div className="absolute bottom-2 left-3 text-white">
                    <h3 className="font-bold text-sm">{ticket.site_name}</h3>
                    <p className="text-[10px] opacity-80">{ticket.site_location || 'Karnataka'}</p>
                </div>
            </div>

            {/* Ticket Details */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-xs text-emerald-500 font-mono">
                            {ticket.ticket_number}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            Issued: {formatDate(ticket.issued_at)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Travel Date
                        </p>
                        <p className="text-xs font-medium">
                            {formatDate(ticket.travel_date)}
                        </p>
                    </div>
                    <div>
                        <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Travelers
                        </p>
                        <p className="text-xs font-medium">
                            {ticket.travelers} {ticket.travelers === 1 ? 'Person' : 'Persons'}
                        </p>
                    </div>
                </div>

                {/* QR Code Preview */}
                {ticket.qr_code && (
                    <div className="relative w-16 h-16 mx-auto mb-3">
                        <Image
                            src={ticket.qr_code}
                            alt="QR Code"
                            fill
                            className="object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewTicket();
                        }}
                        className="flex-1 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        View Ticket
                    </button>
                    {ticket.status === 'active' && onDownload && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload();
                            }}
                            className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                                isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            📥
                        </button>
                    )}
                </div>
            </div>

            {/* Animated Border on Hover */}
            {isHovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none"
                />
            )}
        </motion.div>
    );
}