// utils/cronJobs.js - Create this file
const cron = require('node-cron');
const Ticket = require('../models/Ticket');

// Run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running daily ticket processing job...');
    console.log('==========================================');
    
    try {
        // 1. Mark tickets as used after travel date
        console.log('\n📅 Processing travel dates...');
        const usedTickets = await Ticket.processTravelDates();
        console.log(`✅ Marked ${usedTickets.length} tickets as used (travel date passed)`);
        
        // 2. Mark expired tickets
        console.log('\n⏰ Processing expired tickets...');
        const expiredTickets = await Ticket.markExpiredTickets();
        console.log(`✅ Marked ${expiredTickets.length} tickets as expired`);
        
        console.log('\n==========================================');
        console.log('✅ Daily ticket processing completed!');
        console.log(`   - Used tickets: ${usedTickets.length}`);
        console.log(`   - Expired tickets: ${expiredTickets.length}`);
        console.log('==========================================\n');
        
    } catch (error) {
        console.error('❌ Error in daily ticket processing:', error);
    }
});

// Run every hour to catch any missed updates (optional)
cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running hourly ticket check...');
    
    try {
        // Quick check for travel dates that might have been missed
        const usedTickets = await Ticket.processTravelDates();
        if (usedTickets.length > 0) {
            console.log(`✅ Hourly check: Marked ${usedTickets.length} tickets as used`);
        }
        
        // Quick check for expired tickets
        const expiredTickets = await Ticket.markExpiredTickets();
        if (expiredTickets.length > 0) {
            console.log(`✅ Hourly check: Marked ${expiredTickets.length} tickets as expired`);
        }
        
    } catch (error) {
        console.error('❌ Error in hourly ticket check:', error);
    }
});

module.exports = cron;