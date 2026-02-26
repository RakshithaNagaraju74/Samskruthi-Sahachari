// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authMiddleware } = require('../middlewares/authMiddleware');
const db = require('../config/database');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

// Create order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receipt,
      notes: notes
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Verify payment and create booking
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingData
    } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
    // Create booking in database
    const booking = await Booking.create({
      user_id: bookingData.user_id,
      site_id: bookingData.site_id,
      enterprise_id: bookingData.enterprise_id || null,
      travel_date: bookingData.travel_date,
      travelers: bookingData.travelers,
      total_amount: bookingData.total_amount,
      special_requests: bookingData.special_requests,
      payment_status: 'paid',
      payment_method: 'razorpay',
      payment_id: razorpay_payment_id
    });
    
    // Get site details for ticket
    const siteQuery = await db.query(
      'SELECT name, location FROM heritage_sites WHERE id = $1',
      [bookingData.site_id]
    );
    const site = siteQuery.rows[0] || { name: 'Heritage Site', location: 'Karnataka' };
    
    // Create ticket
    const ticket = await Ticket.create({
      booking_id: booking.id,
      user_id: bookingData.user_id,
      site_id: bookingData.site_id,
      site_name: site.name,
      site_location: site.location
    });
    
    res.json({
      success: true,
      message: 'Payment verified and booking created',
      booking,
      ticket
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

module.exports = router;