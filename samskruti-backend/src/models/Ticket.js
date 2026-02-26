// models/Ticket.js - Complete updated version
const db = require('../config/database');
const crypto = require('crypto');
const QRCode = require('qrcode');

class Ticket {
    // Generate unique ticket number
    static generateTicketNumber() {
        const prefix = 'TKT';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(4).toString('HEX').toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Generate secure QR token
    static generateQRToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Create ticket hash for verification
    static createTicketHash(data) {
        const hashString = `${data.ticketNumber}:${data.userId}:${data.siteId}:${data.nonce}`;
        return crypto.createHash('sha256').update(hashString).digest('hex');
    }

    // Generate QR code
    static async generateQRCode(ticketData) {
        const qrData = JSON.stringify({
            tn: ticketData.ticketNumber,
            qt: ticketData.qrToken,
            ts: Date.now()
        });
        
        try {
            return await QRCode.toDataURL(qrData);
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    }

    // Create a new ticket
    static async create(ticketData) {
        try {
            const {
                booking_id,
                user_id,
                site_id,
                site_name,
                site_location,
                travel_date // Add travel_date to ticket creation
            } = ticketData;

            // Generate ticket data
            const ticketNumber = this.generateTicketNumber();
            const qrToken = this.generateQRToken();
            
            const nonce = crypto.randomBytes(16).toString('hex');
            const ticketHash = this.createTicketHash({
                ticketNumber,
                userId: user_id,
                siteId: site_id,
                nonce
            });

            // Set expiry (7 days from now by default, or based on travel date)
            const expiresAt = new Date();
            if (travel_date) {
                // If travel date is provided, set expiry to 7 days after travel date
                expiresAt.setDate(new Date(travel_date).getDate() + 7);
            } else {
                expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days from issue
            }

            // Generate QR code
            const qrCode = await this.generateQRCode({
                ticketNumber,
                qrToken
            });

            const query = `
                INSERT INTO tickets (
                    ticket_number,
                    booking_id,
                    user_id,
                    site_id,
                    site_name,
                    site_location,
                    travel_date,
                    qr_code,
                    status,
                    issued_at,
                    expires_at,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;

            const now = new Date();
            const values = [
                ticketNumber,
                booking_id,
                user_id,
                site_id,
                site_name || '',
                site_location || '',
                travel_date || null, // Store travel date
                qrCode,
                'active',
                now,
                expiresAt,
                now,
                now
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }

    // Get ticket by ticket number
    static async findByTicketNumber(ticketNumber) {
        try {
            const query = `
                SELECT t.*, 
                       u.email as user_email
                FROM tickets t
                JOIN users u ON t.user_id = u.id
                WHERE t.ticket_number = $1
            `;
            const result = await db.query(query, [ticketNumber]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding ticket by number:', error);
            throw error;
        }
    }

    // Get user's tickets
    static async getUserTickets(userId, includeHistory = false) {
        try {
            let query = `
                SELECT t.*
                FROM tickets t
                WHERE t.user_id = $1
            `;
            
            if (!includeHistory) {
                query += ` AND t.status = 'active'`;
            }
            
            query += ` ORDER BY t.issued_at DESC`;

            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting user tickets:', error);
            throw error;
        }
    }

    // ============= MARK TICKET AS USED AFTER TRAVEL DATE =============
    static async markAsUsedAfterTravelDate(ticketId) {
        try {
            const query = `
                UPDATE tickets 
                SET status = 'used', 
                    used_at = NOW(), 
                    updated_at = NOW(),
                    usage_method = 'auto_after_travel'
                WHERE id = $1 AND status = 'active'
                RETURNING *
            `;
            
            const result = await db.query(query, [ticketId]);
            
            if (result.rows.length > 0) {
                console.log(`✅ Ticket ${result.rows[0].ticket_number} marked as used (after travel date)`);
                return result.rows[0];
            }
            return null;
        } catch (error) {
            console.error('Error marking ticket as used after travel date:', error);
            throw error;
        }
    }

    // ============= MARK TICKET AS USED (QR SCAN / CHECK-IN) =============
    static async markAsUsed(ticketNumber, method = 'qr_scan', location = null) {
        try {
            const ticket = await this.findByTicketNumber(ticketNumber);
            
            if (!ticket) {
                return { success: false, message: 'Ticket not found' };
            }
            
            if (ticket.status !== 'active') {
                return { success: false, message: `Ticket cannot be used. Current status: ${ticket.status}` };
            }
            
            // Check if ticket is expired
            if (new Date(ticket.expires_at) < new Date()) {
                await this.updateStatus(ticket.id, 'expired');
                return { success: false, message: 'Ticket has expired' };
            }
            
            const query = `
                UPDATE tickets 
                SET status = 'used', 
                    used_at = NOW(), 
                    updated_at = NOW(),
                    usage_method = $1,
                    usage_location = $2
                WHERE id = $3
                RETURNING *
            `;
            
            const result = await db.query(query, [method, location, ticket.id]);
            
            return { 
                success: true, 
                message: 'Ticket marked as used successfully',
                ticket: result.rows[0]
            };
        } catch (error) {
            console.error('Error marking ticket as used:', error);
            throw error;
        }
    }

    // ============= MARK EXPIRED TICKETS =============
    static async markExpiredTickets() {
        try {
            const query = `
                UPDATE tickets 
                SET status = 'expired', 
                    updated_at = NOW()
                WHERE status = 'active' 
                  AND expires_at < NOW()
                RETURNING id, ticket_number, site_name, user_id
            `;
            
            const result = await db.query(query);
            
            console.log(`✅ Marked ${result.rows.length} tickets as expired`);
            
            // Log each expired ticket
            result.rows.forEach(ticket => {
                console.log(`   - Ticket ${ticket.ticket_number} for ${ticket.site_name} expired`);
            });
            
            return result.rows;
        } catch (error) {
            console.error('Error marking expired tickets:', error);
            throw error;
        }
    }

    // ============= PROCESS TRAVEL DATES =============
    static async processTravelDates() {
        try {
            // Get today's date at midnight
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Find tickets where travel date was yesterday or earlier and still active
            const query = `
                UPDATE tickets 
                SET status = 'used', 
                    used_at = NOW(), 
                    updated_at = NOW(),
                    usage_method = 'auto_after_travel'
                WHERE status = 'active' 
                  AND travel_date IS NOT NULL 
                  AND travel_date < $1
                RETURNING id, ticket_number, site_name, user_id, travel_date
            `;
            
            const result = await db.query(query, [today]);
            
            console.log(`✅ Marked ${result.rows.length} tickets as used (travel date passed)`);
            
            // Log each ticket
            result.rows.forEach(ticket => {
                console.log(`   - Ticket ${ticket.ticket_number} for ${ticket.site_name} marked as used (travel date: ${ticket.travel_date})`);
            });
            
            return result.rows;
        } catch (error) {
            console.error('Error processing travel dates:', error);
            throw error;
        }
    }

    // Get upcoming tickets
    static async getUpcomingTickets(userId) {
        try {
            const query = `
                SELECT t.*
                FROM tickets t
                WHERE t.user_id = $1 
                  AND t.status = 'active'
                  AND t.expires_at >= CURRENT_DATE
                ORDER BY t.expires_at
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting upcoming tickets:', error);
            throw error;
        }
    }

    // Verify ticket
    static async verify(ticketNumber, qrToken) {
        try {
            const ticket = await this.findByTicketNumber(ticketNumber);
            
            if (!ticket) {
                return { valid: false, message: 'Ticket not found' };
            }

            if (ticket.status !== 'active') {
                return { valid: false, message: `Ticket is ${ticket.status}` };
            }

            if (new Date(ticket.expires_at) < new Date()) {
                await this.updateStatus(ticket.id, 'expired');
                return { valid: false, message: 'Ticket has expired' };
            }

            // Mark as used
            await db.query(`
                UPDATE tickets 
                SET status = 'used', used_at = NOW(), updated_at = NOW()
                WHERE id = $1
            `, [ticket.id]);

            return {
                valid: true,
                message: 'Ticket verified successfully',
                ticket: {
                    ticket_number: ticket.ticket_number,
                    site_name: ticket.site_name,
                    site_location: ticket.site_location,
                    status: ticket.status
                }
            };
        } catch (error) {
            console.error('Error verifying ticket:', error);
            throw error;
        }
    }

    // Update ticket status
    static async updateStatus(id, status) {
        try {
            const query = `
                UPDATE tickets 
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            const result = await db.query(query, [status, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating ticket status:', error);
            throw error;
        }
    }

    // Cancel ticket
    static async cancel(ticketNumber, userId, reason) {
        try {
            const ticket = await this.findByTicketNumber(ticketNumber);
            
            if (!ticket) {
                return { success: false, message: 'Ticket not found' };
            }

            if (ticket.user_id !== userId) {
                return { success: false, message: 'Unauthorized' };
            }

            if (ticket.status !== 'active') {
                return { success: false, message: `Cannot cancel ticket with status: ${ticket.status}` };
            }

            await db.query(`
                UPDATE tickets 
                SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW(),
                    cancellation_reason = $1
                WHERE id = $2
            `, [reason || null, ticket.id]);

            return { success: true, message: 'Ticket cancelled successfully' };
        } catch (error) {
            console.error('Error cancelling ticket:', error);
            throw error;
        }
    }

    // Get ticket statistics
    static async getStats(userId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tickets,
                    COUNT(CASE WHEN status = 'used' THEN 1 END) as used_tickets,
                    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_tickets,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tickets
                FROM tickets
                WHERE user_id = $1
            `;
            const result = await db.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting ticket stats:', error);
            throw error;
        }
    }
}

module.exports = Ticket;