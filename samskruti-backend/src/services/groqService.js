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

Be friendly, informative, and concise. Use emojis occasionally.`
            }
        ];
    }

    async chat(message, userContext = {}) {
        try {
            // Build context with user's data
            const userDataPrompt = this.buildUserContextPrompt(userContext);
            
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

    buildUserContextPrompt(userContext) {
        const { sites = [], tickets = [], stats = {} } = userContext;
        
        let prompt = 'CURRENT USER DATA:\n';
        
        if (sites.length > 0) {
            prompt += `\nAvailable Heritage Sites (${sites.length}):\n`;
            sites.slice(0, 10).forEach(site => {
                prompt += `- ${site.name} (${site.category}): ${site.location}, Fee: ₹${site.entry_fee_indian || 'Free'}, Rating: ${site.rating || 'N/A'}\n`;
            });
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

        prompt += `\nPlease help the user with their query based on this data.`;
        
        return prompt;
    }

    async getSiteRecommendations(userId, preferences = {}) {
        try {
            // This would typically query your database
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