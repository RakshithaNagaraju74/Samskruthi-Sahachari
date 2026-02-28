// services/groqService.js
const Groq = require('groq-sdk');

class GroqService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        this.context = [
            {
                role: 'system',
                content: `You are a helpful heritage site assistant for Karnataka, India. You have access to real-time data about heritage sites and user tickets.

Key Information:
- You can provide information about heritage sites (temples, forts, UNESCO sites, nature spots)
- You can check ticket status and alert about expiring tickets
- You can recommend sites based on interests
- You can answer questions about Karnataka heritage
- You can create itineraries based on duration and location

Be friendly, informative, and concise. Use emojis occasionally.`
            }
        ];
    }

    async chat(message, userContext = {}) {
        try {
            // Build context with user's data
            const userDataPrompt = await this.buildUserContextPrompt(userContext);
            
            const messages = [
                ...this.context,
                { role: 'system', content: userDataPrompt },
                { role: 'user', content: message }
            ];

            const completion = await this.groq.chat.completions.create({
                messages: messages,
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 1024
            });

            return {
                success: true,
                message: completion.choices[0]?.message?.content || 'I apologize, I could not process that request.'
            };
        } catch (error) {
            console.error('Groq API Error:', error);
            return {
                success: false,
                message: 'Sorry, I encountered an error. Please try again.'
            };
        }
    }

    async buildUserContextPrompt(userContext) {
        const { userId, message } = userContext;
        const db = require('../config/database');

        // Fetch user's tickets
        const ticketsResult = await db.query(
            `SELECT t.*, hs.name as site_name, hs.location 
             FROM tickets t
             JOIN heritage_sites hs ON t.site_id = hs.id
             WHERE t.user_id = $1
             ORDER BY t.created_at DESC`,
            [userId]
        );
        const tickets = ticketsResult.rows;

        // Fetch all active heritage sites (for reference)
        const sitesResult = await db.query(
            `SELECT id, name, location, district, category, site_type, 
                    entry_fee_indian, rating, description, best_time_to_visit,
                    duration_required, opening_time, closing_time
             FROM heritage_sites
             WHERE is_active = true
             ORDER BY rating DESC NULLS LAST`
        );
        const sites = sitesResult.rows;

        // Attempt to extract location and duration from the user's message (simple keyword matching)
        const locationMatch = message.match(/\b(mysore|mysuru|bangalore|bengaluru|hampi|coorg|madikeri|gokarna|kabini|badami|aihole|pattadakal|belur|halebidu|srirangapatna)\b/i);
        const location = locationMatch ? locationMatch[0] : null;

        const durationMatch = message.match(/(\d+)\s*(day|days?)/i);
        const duration = durationMatch ? parseInt(durationMatch[1]) : null;

        let prompt = 'CURRENT USER DATA:\n';
        
        if (sites.length > 0) {
            prompt += `\nAvailable Heritage Sites (${sites.length} total):\n`;
            // If location is mentioned, show sites in that location first
            let filteredSites = sites;
            if (location) {
                filteredSites = sites.filter(s => 
                    s.location && s.location.toLowerCase().includes(location.toLowerCase())
                );
                if (filteredSites.length > 0) {
                    prompt += `\nSites in ${location} (${filteredSites.length}):\n`;
                    filteredSites.slice(0, 15).forEach(site => {
                        prompt += `- ${site.name} (${site.category || 'heritage'}): ${site.location}, Fee: ₹${site.entry_fee_indian || 'Free'}, Rating: ${site.rating || 'N/A'}, Duration: ${site.duration_required || 'varies'}\n`;
                    });
                }
            }
            // Show top rated sites overall if no location match or after location list
            if (!location || filteredSites.length === 0) {
                prompt += `\nTop Rated Sites:\n`;
                sites.slice(0, 20).forEach(site => {
                    prompt += `- ${site.name} (${site.category || 'heritage'}): ${site.location}, Fee: ₹${site.entry_fee_indian || 'Free'}, Rating: ${site.rating || 'N/A'}, Duration: ${site.duration_required || 'varies'}\n`;
                });
            }
        }

        if (tickets.length > 0) {
            const activeTickets = tickets.filter(t => t.status === 'active');
            const expiringSoon = tickets.filter(t => {
                if (t.status !== 'active') return false;
                const daysLeft = Math.ceil((new Date(t.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 3 && daysLeft > 0;
            });

            prompt += `\nYour Tickets:\n`;
            prompt += `- Total Tickets: ${tickets.length}\n`;
            prompt += `- Active Tickets: ${activeTickets.length}\n`;
            prompt += `- Expiring Soon (≤3 days): ${expiringSoon.length}\n`;
            
            if (expiringSoon.length > 0) {
                prompt += `\n⚠️ EXPIRING SOON ALERTS:\n`;
                expiringSoon.forEach(t => {
                    const daysLeft = Math.ceil((new Date(t.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                    prompt += `- Ticket ${t.ticket_number} for ${t.site_name} expires in ${daysLeft} days\n`;
                });
            }
        }

        // If location and duration provided, suggest an itinerary
        if (location && duration) {
            prompt += `\nBased on your interest in ${location} for ${duration} days, consider this sample itinerary:\n`;
            // Fetch sites in that location sorted by rating
            const localSites = sites.filter(s => 
                s.location && s.location.toLowerCase().includes(location.toLowerCase())
            ).sort((a,b) => (b.rating || 0) - (a.rating || 0));

            if (localSites.length > 0) {
                for (let i = 0; i < Math.min(duration, localSites.length); i++) {
                    prompt += `Day ${i+1}: ${localSites[i].name}`;
                    if (localSites[i].duration_required) {
                        prompt += ` (approx ${localSites[i].duration_required})`;
                    }
                    prompt += `\n`;
                }
                if (localSites.length > duration) {
                    prompt += `You could also visit: ${localSites.slice(duration, duration+3).map(s => s.name).join(', ')}\n`;
                }
            } else {
                prompt += `No specific sites found in ${location}. Consider exploring nearby districts or top‑rated sites.\n`;
            }
        }

        prompt += `\nPlease help the user with their query based on this data.`;
        
        return prompt;
    }

    async getSiteRecommendations(userId, preferences = {}) {
        try {
            const db = require('../config/database');
            
            let query = `
                SELECT hs.*, 
                       COUNT(t.id) as total_tickets,
                       SUM(CASE WHEN t.status = 'active' THEN 1 ELSE 0 END) as active_tickets
                FROM heritage_sites hs
                LEFT JOIN tickets t ON hs.id = t.site_id AND t.user_id = $1
                WHERE hs.is_active = true
                GROUP BY hs.id
            `;

            if (preferences.category) {
                query += ` HAVING hs.category = '${preferences.category}'`;
            }

            query += ` ORDER BY hs.rating DESC NULLS LAST LIMIT 10`;

            const result = await db.query(query, [userId]);
            
            return {
                success: true,
                recommendations: result.rows
            };
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return {
                success: false,
                recommendations: []
            };
        }
    }
}

module.exports = new GroqService();