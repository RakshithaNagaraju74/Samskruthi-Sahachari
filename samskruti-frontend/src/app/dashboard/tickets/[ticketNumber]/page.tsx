// app/dashboard/tickets/[ticketNumber]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { bookingService, ExtendedTicket } from '@/services/bookingService';
import Image from 'next/image';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface PageProps {
    params: Promise<{
        ticketNumber: string;
    }>;
}

export default function TicketDetailPage({ params }: PageProps) {
    const { isDarkMode } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const [ticket, setTicket] = useState<ExtendedTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const { ticketNumber } = await params;
                console.log('Loading ticket:', ticketNumber);
                
                if (!ticketNumber || ticketNumber === 'undefined') {
                    setError('Invalid ticket number');
                    return;
                }

                // Try to get from localStorage first
                const storedTicket = localStorage.getItem('selectedTicket');
                if (storedTicket) {
                    try {
                        const parsedTicket = JSON.parse(storedTicket);
                        if (parsedTicket.ticket_number === ticketNumber) {
                            console.log('Found ticket in localStorage');
                            setTicket(parsedTicket);
                            await generateQRCode(parsedTicket.ticket_number);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.error('Error parsing stored ticket:', e);
                    }
                }

                // If not in localStorage, fetch from API
                await fetchTicket(ticketNumber);
            } catch (error) {
                console.error('Error loading ticket:', error);
                setError('Failed to load ticket');
            }
        };

        loadTicket();
    }, [params]);

    const fetchTicket = async (ticketNumber: string) => {
        try {
            console.log('Fetching ticket from API:', ticketNumber);
            const ticketData = await bookingService.getTicketByNumber(ticketNumber);
            
            if (ticketData) {
                console.log('Ticket fetched:', ticketData);
                setTicket(ticketData);
                await generateQRCode(ticketData.ticket_number);
            } else {
                setError('Ticket not found');
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
            setError('Failed to fetch ticket');
        } finally {
            setLoading(false);
        }
    };

    const generateQRCode = async (ticketNumber: string) => {
        try {
            const url = await QRCode.toDataURL(ticketNumber);
            setQrCodeUrl(url);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handleDownloadTicket = async () => {
        if (!ticket) return;

        try {
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(22);
            doc.setTextColor(16, 185, 129);
            doc.text('KARNATAKA HERITAGE', 105, 20, { align: 'center' });
            
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('ENTRY TICKET', 105, 30, { align: 'center' });
            
            // Add decorative line
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.5);
            doc.line(20, 35, 190, 35);
            
            // Generate QR code for this ticket
            const qrDataUrl = await QRCode.toDataURL(ticket.ticket_number);
            
            const details = [
                ['Ticket Number:', ticket.ticket_number],
                ['Site Name:', ticket.site_name || 'Heritage Site'],
                ['Location:', ticket.site_location || 'Karnataka'],
                ['Issue Date:', new Date(ticket.issued_at).toLocaleDateString()],
                ['Valid Until:', new Date(ticket.expires_at).toLocaleDateString()],
                ['Status:', ticket.status.toUpperCase()],
                ['Travel Date:', ticket.travel_date ? new Date(ticket.travel_date).toLocaleDateString() : 'N/A'],
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
            
            // Add QR Code
            if (qrDataUrl) {
                doc.addImage(qrDataUrl, 'PNG', 150, 45, 40, 40);
            }
            
            // Add footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Please present this ticket at the entrance.', 105, 160, { align: 'center' });
            doc.text('Valid ID proof is required.', 105, 165, { align: 'center' });
            
            // Save the PDF
            doc.save(`ticket-${ticket.ticket_number}.pdf`);
            
        } catch (error) {
            console.error('Error downloading ticket:', error);
            // Fallback to text file
            const content = `
KARNATAKA HERITAGE - ENTRY TICKET
=================================
Ticket Number: ${ticket.ticket_number}
Site: ${ticket.site_name || 'Heritage Site'}
Location: ${ticket.site_location || 'Karnataka'}
Issue Date: ${new Date(ticket.issued_at).toLocaleDateString()}
Valid Until: ${new Date(ticket.expires_at).toLocaleDateString()}
Status: ${ticket.status}
Travel Date: ${ticket.travel_date ? new Date(ticket.travel_date).toLocaleDateString() : 'N/A'}
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

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'used': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'expired': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="mt-4 text-emerald-500">Loading ticket details...</p>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl mb-2">{error || 'Ticket not found'}</h2>
                    <button
                        onClick={() => router.push('/dashboard/tickets')}
                        className="text-emerald-500 hover:underline"
                    >
                        Back to Tickets
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto p-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className={`mb-6 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
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
                    {/* Header */}
                    <div className={`h-32 bg-gradient-to-r ${
                        ticket.status === 'active' ? 'from-green-500 to-emerald-500' :
                        ticket.status === 'used' ? 'from-blue-500 to-indigo-500' :
                        ticket.status === 'expired' ? 'from-orange-500 to-red-500' :
                        'from-gray-500 to-gray-600'
                    }`} />

                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* QR Code Section */}
                            <div className={`flex flex-col items-center justify-center p-6 md:border-r md:border-dashed ${
                                isDarkMode ? 'md:border-gray-700' : 'md:border-gray-200'
                            }`}>
                                {qrCodeUrl ? (
                                    <>
                                        <div className="relative w-48 h-48 mb-4">
                                            <Image
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <p className={`text-xs text-center ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            Scan this QR code at the entrance
                                        </p>
                                    </>
                                ) : (
                                    <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                                        <span className="text-4xl animate-pulse">🎫</span>
                                    </div>
                                )}
                                <p className="text-xs font-mono text-emerald-500 mt-2">
                                    {ticket.ticket_number}
                                </p>
                            </div>

                            {/* Ticket Details */}
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold">{ticket.site_name}</h3>
                                        <p className={`text-sm mt-1 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            📍 {ticket.site_location || 'Karnataka'}
                                        </p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 ${getStatusBadgeColor(ticket.status)}`}>
                                        {ticket.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking Ref</p>
                                        <p className="font-mono text-sm font-medium">{ticket.booking_reference || `BK${ticket.booking_id}`}</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Issue Date</p>
                                        <p className="font-medium">{formatDate(ticket.issued_at)}</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Valid Until</p>
                                        <p className={`font-medium ${
                                            new Date(ticket.expires_at) < new Date() ? 'text-red-500' : 'text-green-500'
                                        }`}>
                                            {formatDate(ticket.expires_at)}
                                        </p>
                                    </div>
                                    {ticket.travel_date && (
                                        <div>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Travel Date</p>
                                            <p className="font-medium">{formatDate(ticket.travel_date)}</p>
                                        </div>
                                    )}
                                </div>

                                {ticket.total_amount && (
                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                                    }`}>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</p>
                                        <p className="text-2xl font-bold text-emerald-500">₹{ticket.total_amount}</p>
                                    </div>
                                )}

                                {/* Download Button */}
                                <button
                                    onClick={handleDownloadTicket}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}