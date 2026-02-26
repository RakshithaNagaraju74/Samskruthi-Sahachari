// utils/notificationCron.js
const cron = require('node-cron');
const notificationService = require('../services/notificationService');

// Run every hour to check for expiring tickets
cron.schedule('0 * * * *', async () => {
    console.log('🔔 Running notification checks...');
    
    try {
        // Check for expiring tickets
        const expiringCount = await notificationService.checkExpiringTickets();
        if (expiringCount > 0) {
            console.log(`✅ Created ${expiringCount} expiring soon notifications`);
        }

        // Check for newly expired tickets
        const expiredCount = await notificationService.checkExpiredTickets();
        if (expiredCount > 0) {
            console.log(`✅ Marked ${expiredCount} tickets as expired`);
        }

    } catch (error) {
        console.error('❌ Error in notification cron:', error);
    }
});

// Run daily at 9 AM for summary notifications
cron.schedule('0 9 * * *', async () => {
    console.log('📊 Running daily summary check...');
    
    try {
        const db = require('../config/database');
        
        // Get users with expiring tickets
        const query = `
            SELECT DISTINCT user_id
            FROM tickets
            WHERE status = 'active'
              AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
        `;
        
        const result = await db.query(query);
        
        for (const row of result.rows) {
            await notificationService.createNotification(
                row.user_id,
                'daily_summary',
                '📋 Daily Summary',
                'Check your dashboard for expiring tickets and new recommendations.',
                {}
            );
        }
        
        console.log(`✅ Sent daily summary to ${result.rows.length} users`);
    } catch (error) {
        console.error('❌ Error in daily summary cron:', error);
    }
});

