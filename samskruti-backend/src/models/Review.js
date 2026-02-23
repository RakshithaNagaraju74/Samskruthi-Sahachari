// models/Review.js
const db = require('../config/database');

class Review {
    // Create a new review
    static async create(reviewData) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const {
                user_id,
                site_id,
                rating,
                title,
                comment,
                visit_date
            } = reviewData;

            const query = `
                INSERT INTO reviews (
                    user_id, site_id, rating, title, comment,
                    visit_date, is_verified, helpful_count, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, false, 0, NOW())
                RETURNING *
            `;

            const values = [
                user_id,
                site_id,
                rating,
                title || null,
                comment,
                visit_date || null
            ];

            const result = await client.query(query, values);

            // Update site rating (trigger will handle this, but we can also do it manually)
            await client.query(`
                UPDATE heritage_sites 
                SET rating = (
                    SELECT COALESCE(AVG(rating), 0) 
                    FROM reviews 
                    WHERE site_id = $1
                ),
                total_reviews = (
                    SELECT COUNT(*) 
                    FROM reviews 
                    WHERE site_id = $1
                )
                WHERE id = $1
            `, [site_id]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating review:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Get reviews by site ID
    static async getBySiteId(siteId) {
        try {
            const query = `
                SELECT r.*, 
                       u.email as user_email,
                       up.full_name, up.profile_image
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE r.site_id = $1
                ORDER BY r.helpful_count DESC, r.created_at DESC
            `;
            const result = await db.query(query, [siteId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting reviews by site ID:', error);
            throw error;
        }
    }

    // Get reviews by user ID
    static async getByUserId(userId) {
        try {
            const query = `
                SELECT r.*, hs.name as site_name, hs.main_image as site_image
                FROM reviews r
                JOIN heritage_sites hs ON r.site_id = hs.id
                WHERE r.user_id = $1
                ORDER BY r.created_at DESC
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting reviews by user ID:', error);
            throw error;
        }
    }

    // Update review
    static async update(id, userId, updateData) {
        try {
            const { rating, title, comment } = updateData;

            const query = `
                UPDATE reviews 
                SET rating = COALESCE($1, rating),
                    title = COALESCE($2, title),
                    comment = COALESCE($3, comment),
                    updated_at = NOW()
                WHERE id = $4 AND user_id = $5
                RETURNING *
            `;

            const result = await db.query(query, [rating, title, comment, id, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    }

    // Delete review
    static async delete(id, userId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Get site_id before deleting
            const siteResult = await client.query(
                'SELECT site_id FROM reviews WHERE id = $1',
                [id]
            );

            if (siteResult.rows.length === 0) {
                return null;
            }

            const siteId = siteResult.rows[0].site_id;

            // Delete review
            const query = 'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *';
            const result = await client.query(query, [id, userId]);

            // Update site rating
            await client.query(`
                UPDATE heritage_sites 
                SET rating = (
                    SELECT COALESCE(AVG(rating), 0) 
                    FROM reviews 
                    WHERE site_id = $1
                ),
                total_reviews = (
                    SELECT COUNT(*) 
                    FROM reviews 
                    WHERE site_id = $1
                )
                WHERE id = $1
            `, [siteId]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting review:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Mark review as helpful
    static async markHelpful(id) {
        try {
            const query = 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error marking review as helpful:', error);
            throw error;
        }
    }

    // Get review statistics for a site
    static async getStats(siteId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_reviews,
                    COALESCE(AVG(rating), 0) as average_rating,
                    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
                FROM reviews
                WHERE site_id = $1
            `;
            const result = await db.query(query, [siteId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting review stats:', error);
            throw error;
        }
    }
}

module.exports = Review;