// models/Ticket.js
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
        const hashString = `${data.ticketNumber}:${data.userId}:${data.siteId}:${data.travelDate}:${data.nonce}`;
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
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const {
                booking_id,
                user_id,
                site_id,
                site_name,
                site_location,
                travel_date,
                travelers,
                total_price
            } = ticketData;

            // Generate ticket data
            const ticketNumber = this.generateTicketNumber();
            const qrToken = this.generateQRToken();
            const nonce = crypto.randomBytes(16).toString('hex');
            
            const ticketHash = this.createTicketHash({
                ticketNumber,
                userId: user_id,
                siteId: site_id,
                travelDate: travel_date,
                nonce
            });

            // Set expiry (travel date + 1 day)
            const expiresAt = new Date(travel_date);
            expiresAt.setDate(expiresAt.getDate() + 1);

            // Generate QR code
            const qrCode = await this.generateQRCode({
                ticketNumber,
                qrToken
            });

            const query = `
                INSERT INTO tickets (
                    ticket_number, booking_id, user_id, site_id,
                    site_name, site_location, travel_date, travelers,
                    total_price, qr_code, qr_token, hash, nonce,
                    expires_at, status, issued_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', NOW())
                RETURNING *
            `;

            const values = [
                ticketNumber,
                booking_id,
                user_id,
                site_id,
                site_name,
                site_location,
                travel_date,
                travelers,
                total_price,
                qrCode,
                qrToken,
                ticketHash,
                nonce,
                expiresAt
            ];

            const result = await client.query(query, values);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating ticket:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Get ticket by ticket number
    static async findByTicketNumber(ticketNumber) {
        try {
            const query = `
                SELECT t.*, 
                       u.email as user_email, u.user_type,
                       hs.name as site_name, hs.location as site_location,
                       hs.main_image as site_image, hs.description
                FROM tickets t
                JOIN users u ON t.user_id = u.id
                JOIN heritage_sites hs ON t.site_id = hs.id
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
                SELECT t.*, hs.name as site_name, hs.location as site_location,
                       hs.main_image as site_image
                FROM tickets t
                JOIN heritage_sites hs ON t.site_id = hs.id
                WHERE t.user_id = $1
            `;
            
            if (!includeHistory) {
                query += ` AND t.status = 'active'`;
            }
            
            query += ` ORDER BY t.travel_date DESC`;

            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting user tickets:', error);
            throw error;
        }
    }

    // Get upcoming tickets
    static async getUpcomingTickets(userId) {
        try {
            const query = `
                SELECT t.*, hs.name as site_name, hs.location as site_location,
                       hs.main_image as site_image
                FROM tickets t
                JOIN heritage_sites hs ON t.site_id = hs.id
                WHERE t.user_id = $1 
                  AND t.status = 'active'
                  AND t.travel_date >= CURRENT_DATE
                ORDER BY t.travel_date
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
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Get ticket
            const ticket = await this.findByTicketNumber(ticketNumber);
            
            if (!ticket) {
                return { valid: false, message: 'Ticket not found' };
            }

            // Verify QR token
            if (ticket.qr_token !== qrToken) {
                await this.logVerification(client, ticket.id, ticketNumber, false, 'Invalid QR token');
                return { valid: false, message: 'Invalid ticket' };
            }

            // Check status
            if (ticket.status !== 'active') {
                await this.logVerification(client, ticket.id, ticketNumber, false, `Ticket is ${ticket.status}`);
                return { valid: false, message: `Ticket is ${ticket.status}` };
            }

            // Check expiry
            if (new Date(ticket.expires_at) < new Date()) {
                await this.updateStatus(ticket.id, 'expired');
                await this.logVerification(client, ticket.id, ticketNumber, false, 'Ticket expired');
                return { valid: false, message: 'Ticket has expired' };
            }

            // Check travel date
            const travelDate = new Date(ticket.travel_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const maxVerifyDate = new Date(travelDate);
            maxVerifyDate.setDate(maxVerifyDate.getDate() + 1);

            if (today > maxVerifyDate) {
                await this.updateStatus(ticket.id, 'expired');
                await this.logVerification(client, ticket.id, ticketNumber, false, 'Travel date passed');
                return { valid: false, message: 'Travel date has passed' };
            }

            // Mark as used
            await client.query(`
                UPDATE tickets 
                SET status = 'used', used_at = NOW(), 
                    verification_count = verification_count + 1,
                    last_verified_at = NOW()
                WHERE id = $1
            `, [ticket.id]);

            await this.logVerification(client, ticket.id, ticketNumber, true, 'Verified successfully');

            await client.query('COMMIT');

            return {
                valid: true,
                message: 'Ticket verified successfully',
                ticket: {
                    ticket_number: ticket.ticket_number,
                    site_name: ticket.site_name,
                    site_location: ticket.site_location,
                    user_name: ticket.full_name,
                    travel_date: ticket.travel_date,
                    travelers: ticket.travelers
                }
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error verifying ticket:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Log verification attempt
    static async logVerification(client, ticketId, ticketNumber, success, message) {
        try {
            await client.query(`
                INSERT INTO ticket_verifications 
                (ticket_id, ticket_number, verification_type, success, error_message)
                VALUES ($1, $2, 'scan', $3, $4)
            `, [ticketId, ticketNumber, success, message]);
        } catch (error) {
            console.error('Error logging verification:', error);
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
        const client = await db.connect();
        try {
            await client.query('BEGIN');

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

            // Check if travel date is at least 24 hours away
            const travelDate = new Date(ticket.travel_date);
            const now = new Date();
            const hoursDiff = (travelDate - now) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                return { success: false, message: 'Cannot cancel within 24 hours of travel' };
            }

            await client.query(`
                UPDATE tickets 
                SET status = 'cancelled', cancelled_at = NOW(),
                    cancellation_reason = $1
                WHERE id = $2
            `, [reason || null, ticket.id]);

            await client.query('COMMIT');
            return { success: true, message: 'Ticket cancelled successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error cancelling ticket:', error);
            throw error;
        } finally {
            client.release();
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