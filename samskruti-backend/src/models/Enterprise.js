// models/Enterprise.js
const db = require('../config/database');

class Enterprise {
    // Create enterprise profile
    static async create(profileData) {
        const {
            user_id,
            company_name,
            registration_number,
            gst_number,
            contact_person,
            contact_email,
            contact_phone,
            address,
            city,
            state,
            pincode,
            website,
            description,
            logo_url
        } = profileData;

        const query = `
            INSERT INTO enterprises (
                user_id, company_name, registration_number, gst_number,
                contact_person, contact_email, contact_phone, address,
                city, state, pincode, website, description, logo_url,
                verified, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            user_id,
            company_name,
            registration_number,
            gst_number || null,
            contact_person,
            contact_email,
            contact_phone,
            address || null,
            city || null,
            state || null,
            pincode || null,
            website || null,
            description || null,
            logo_url || null
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Find by user ID
    static async findByUserId(userId) {
        try {
            const query = 'SELECT * FROM enterprises WHERE user_id = $1';
            const result = await db.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding enterprise by user ID:', error);
            throw error;
        }
    }

    // Find by ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM enterprises WHERE id = $1';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding enterprise by ID:', error);
            throw error;
        }
    }

    // Update enterprise
    static async update(userId, updateData) {
        const allowedFields = [
            'company_name', 'gst_number', 'contact_person', 'contact_email',
            'contact_phone', 'address', 'city', 'state', 'pincode',
            'website', 'description', 'logo_url'
        ];

        const updates = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updates.push(`${key} = $${paramIndex}`);
                values.push(updateData[key]);
                paramIndex++;
            }
        });

        if (updates.length === 0) return null;

        values.push(userId);
        const query = `
            UPDATE enterprises 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE user_id = $${paramIndex}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Get all verified enterprises
    static async getAllVerified() {
        try {
            const query = 'SELECT * FROM enterprises WHERE verified = true ORDER BY rating DESC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting verified enterprises:', error);
            throw error;
        }
    }

    // Get enterprise's heritage sites
    static async getHeritageSites(enterpriseId) {
        try {
            const query = `
                SELECT * FROM heritage_sites 
                WHERE enterprise_id = $1 AND is_active = true
                ORDER BY name
            `;
            const result = await db.query(query, [enterpriseId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting enterprise heritage sites:', error);
            throw error;
        }
    }

    // Verify enterprise
    static async verify(id) {
        try {
            const query = `
                UPDATE enterprises 
                SET verified = true, updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error verifying enterprise:', error);
            throw error;
        }
    }

    // Update rating
    static async updateRating(enterpriseId) {
        try {
            const query = `
                UPDATE enterprises e
                SET 
                    rating = (
                        SELECT COALESCE(AVG(r.rating), 0) 
                        FROM reviews r 
                        JOIN heritage_sites s ON r.site_id = s.id 
                        WHERE s.enterprise_id = e.id
                    ),
                    total_reviews = (
                        SELECT COUNT(*) 
                        FROM reviews r 
                        JOIN heritage_sites s ON r.site_id = s.id 
                        WHERE s.enterprise_id = e.id
                    )
                WHERE e.id = $1
                RETURNING *
            `;
            const result = await db.query(query, [enterpriseId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating enterprise rating:', error);
            throw error;
        }
    }
}

module.exports = Enterprise;