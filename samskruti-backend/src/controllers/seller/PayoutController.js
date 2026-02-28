const db = require('../../config/database');

class PayoutController {
  // Get payout history
  static async getPayouts(req, res) {
    try {
      const sellerId = req.sellerId;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM seller_payouts WHERE seller_id = $1';
      const params = [sellerId];
      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ' ORDER BY requested_date DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      params.push(limit, offset);

      const payouts = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM seller_payouts WHERE seller_id = $1';
      const countParams = [sellerId];

      if (status) {
        countQuery += ' AND status = $2';
        countParams.push(status);
      }

      const total = await db.query(countQuery, countParams);

      // Get earnings summary
      const earnings = await PayoutController.getEarningsSummary(sellerId);

      res.json({
        success: true,
        data: payouts.rows,
        summary: earnings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.rows[0].count),
          pages: Math.ceil(total.rows[0].count / limit)
        }
      });
    } catch (error) {
      console.error('Get payouts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load payouts'
      });
    }
  }

  // Get earnings summary
  static async getEarningsSummary(sellerId) {
    try {
      const result = await db.query(`
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_earnings,
          COALESCE(SUM(commission_amount), 0) as total_commission,
          COALESCE(SUM(net_amount), 0) as net_earnings,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN net_amount ELSE 0 END), 0) as paid_earnings,
          COALESCE(SUM(CASE WHEN payment_status != 'paid' THEN net_amount ELSE 0 END), 0) as pending_earnings
        FROM seller_orders 
        WHERE seller_id = $1
      `, [sellerId]);

      // Get next estimated payout
      const nextPayout = await db.query(`
        SELECT 
          COALESCE(SUM(net_amount), 0) as amount,
          MIN(CASE 
            WHEN EXTRACT(DOW FROM NOW()) < 5 THEN DATE_TRUNC('week', NOW()) + INTERVAL '5 days'
            ELSE DATE_TRUNC('week', NOW()) + INTERVAL '12 days'
          END) as estimated_date
        FROM seller_orders 
        WHERE seller_id = $1 
          AND payment_status != 'paid'
          AND created_at >= DATE_TRUNC('week', NOW())
      `, [sellerId]);

      return {
        ...result.rows[0],
        next_payout: parseFloat(nextPayout.rows[0].amount),
        estimated_date: nextPayout.rows[0].estimated_date
      };
    } catch (error) {
      console.error('Get earnings summary error:', error);
      throw error;
    }
  }

  // Request payout - MINIMAL VERSION
  static async requestPayout(req, res) {
    try {
      const sellerId = req.sellerId;
      const { amount } = req.body;

      // Get seller's bank details
      const seller = await db.query(
        'SELECT bank_account_number, bank_ifsc_code, bank_name FROM sellers WHERE id = $1',
        [sellerId]
      );

      if (!seller.rows[0]?.bank_account_number) {
        return res.status(400).json({
          success: false,
          message: 'Please add bank account details first'
        });
      }

      // Check available balance
      const earnings = await PayoutController.getEarningsSummary(sellerId);
      if (amount > earnings.pending_earnings) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Create payout request - ONLY essential columns
      const payout = await db.query(`
        INSERT INTO seller_payouts (
          seller_id, 
          payout_id, 
          amount, 
          status,
          requested_date
        ) VALUES (
          $1, 
          'PO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('payout_seq')::text, 6, '0'),
          $2,
          'pending',
          NOW()
        ) RETURNING *
      `, [
        sellerId,
        amount
      ]);

      res.json({
        success: true,
        message: 'Payout requested successfully',
        data: payout.rows[0]
      });
    } catch (error) {
      console.error('Request payout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request payout'
      });
    }
  }

  // Get payout details
  static async getPayout(req, res) {
    try {
      const sellerId = req.sellerId;
      const payoutId = req.params.id;

      const payout = await db.query(
        'SELECT * FROM seller_payouts WHERE id = $1 AND seller_id = $2',
        [payoutId, sellerId]
      );

      if (payout.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payout not found'
        });
      }

      res.json({
        success: true,
        data: payout.rows[0]
      });
    } catch (error) {
      console.error('Get payout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load payout'
      });
    }
  }
}

module.exports = PayoutController;