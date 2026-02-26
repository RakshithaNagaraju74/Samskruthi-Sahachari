const db = require('../config/database');
const crypto = require('crypto');

class Enterprise {
    // Generate unique enterprise ID
    static generateEnterpriseId() {
        const prefix = 'ENT';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(4).toString('HEX').toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Create a new enterprise
    static async create(enterpriseData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const {
                email,
                password,
                company_name,
                registration_number,
                gst_number,
                pan_number,
                business_type,
                description,
                established_year,
                employee_count,
                contact_person,
                contact_phone,
                address,
                city,
                state,
                country,
                pincode,
                website,
                logo_url,
                documents
            } = enterpriseData;

            // Generate unique enterprise ID
            const enterpriseId = this.generateEnterpriseId();

            // Hash password
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = `
                INSERT INTO enterprises (
                    enterprise_id,
                    email,
                    password,
                    company_name,
                    registration_number,
                    gst_number,
                    pan_number,
                    business_type,
                    description,
                    established_year,
                    employee_count,
                    contact_person,
                    contact_phone,
                    address,
                    city,
                    state,
                    country,
                    pincode,
                    website,
                    logo_url,
                    documents,
                    verification_status,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
                RETURNING id, enterprise_id, email, company_name, verification_status, created_at
            `;

            const values = [
                enterpriseId,
                email,
                hashedPassword,
                company_name,
                registration_number,
                gst_number || null,
                pan_number,
                business_type || null,
                description || null,
                established_year || null,
                employee_count || null,
                contact_person,
                contact_phone,
                address || null,
                city || null,
                state || null,
                country || 'India',
                pincode || null,
                website || null,
                logo_url || null,
                JSON.stringify(documents || {}),
                'pending'
            ];

            const result = await client.query(query, values);
            await client.query('COMMIT');
            
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating enterprise:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Find enterprise by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM enterprises WHERE email = $1';
            const result = await db.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding enterprise by email:', error);
            throw error;
        }
    }

    // Find enterprise by ID
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

    // Find enterprise by enterprise_id
    static async findByEnterpriseId(enterpriseId) {
        try {
            const query = 'SELECT * FROM enterprises WHERE enterprise_id = $1';
            const result = await db.query(query, [enterpriseId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding enterprise by enterprise_id:', error);
            throw error;
        }
    }

    // Get all pending enterprises
    static async getPending() {
        try {
            const query = `
                SELECT id, enterprise_id, email, company_name, contact_person, 
                       contact_phone, business_type, established_year, 
                       verification_status, created_at
                FROM enterprises 
                WHERE verification_status = 'pending'
                ORDER BY created_at ASC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting pending enterprises:', error);
            throw error;
        }
    }

    // Get all verified enterprises
    static async getVerified() {
        try {
            const query = `
                SELECT id, enterprise_id, company_name, business_type, 
                       description, logo_url, city, state, country,
                       rating, total_reviews
                FROM enterprises 
                WHERE verification_status = 'approved'
                ORDER BY rating DESC NULLS LAST
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting verified enterprises:', error);
            throw error;
        }
    }

    // Update enterprise verification status
    static async updateVerification(id, status, adminId = null, rejectionReason = null) {
        try {
            const query = `
                UPDATE enterprises 
                SET verification_status = $1,
                    verified_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
                    verified_by = $2,
                    rejection_reason = $3,
                    updated_at = NOW()
                WHERE id = $4
                RETURNING id, enterprise_id, email, company_name, verification_status
            `;
            const result = await db.query(query, [status, adminId, rejectionReason, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating enterprise verification:', error);
            throw error;
        }
    }

    // Update enterprise profile
    static async update(id, updateData) {
        try {
            const allowedFields = [
                'company_name', 'registration_number', 'gst_number', 'pan_number',
                'business_type', 'description', 'established_year', 'employee_count',
                'contact_person', 'contact_phone', 'address', 'city', 'state',
                'country', 'pincode', 'website', 'logo_url'
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

            if (updates.length === 0) {
                return null;
            }

            values.push(id);
            const query = `
                UPDATE enterprises 
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating enterprise:', error);
            throw error;
        }
    }

    // Login enterprise
    static async login(email, password) {
        try {
            const enterprise = await this.findByEmail(email);
            if (!enterprise) return null;

            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, enterprise.password);
            
            if (!isValid) return null;

            // Don't return password
            delete enterprise.password;
            return enterprise;
        } catch (error) {
            console.error('Error logging in enterprise:', error);
            throw error;
        }
    }

    // Get enterprise statistics
    static async getStats(enterpriseId) {
        try {
            const query = `
                SELECT 
                    COUNT(DISTINCT hs.id) as total_sites,
                    COALESCE(SUM(b.total_amount), 0) as total_revenue,
                    COUNT(DISTINCT b.id) as total_bookings,
                    COUNT(DISTINCT t.id) as total_tickets_sold,
                    COUNT(DISTINCT CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN b.id END) as bookings_last_30_days,
                    COALESCE(SUM(CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN b.total_amount ELSE 0 END), 0) as revenue_last_30_days,
                    COALESCE(AVG(r.rating), 0) as average_rating
                FROM enterprises e
                LEFT JOIN heritage_sites hs ON e.id = hs.enterprise_id
                LEFT JOIN bookings b ON hs.id = b.site_id
                LEFT JOIN tickets t ON b.id = t.booking_id
                LEFT JOIN reviews r ON hs.id = r.site_id
                WHERE e.id = $1
                GROUP BY e.id
            `;
            const result = await db.query(query, [enterpriseId]);
            return result.rows[0] || {
                total_sites: 0,
                total_revenue: 0,
                total_bookings: 0,
                total_tickets_sold: 0,
                bookings_last_30_days: 0,
                revenue_last_30_days: 0,
                average_rating: 0
            };
        } catch (error) {
            console.error('Error getting enterprise stats:', error);
            throw error;
        }
    }

    // Get enterprise sites
    static async getSites(enterpriseId) {
        try {
            const query = `
                SELECT hs.*, 
                       COUNT(DISTINCT b.id) as total_bookings,
                       COALESCE(AVG(r.rating), 0) as average_rating
                FROM heritage_sites hs
                LEFT JOIN bookings b ON hs.id = b.site_id
                LEFT JOIN reviews r ON hs.id = r.site_id
                WHERE hs.enterprise_id = $1
                GROUP BY hs.id
                ORDER BY hs.created_at DESC
            `;
            const result = await db.query(query, [enterpriseId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting enterprise sites:', error);
            throw error;
        }
    }

    // Add site to enterprise
    static async addSite(enterpriseId, siteData) {
        try {
            const {
                name, description, location, category, subcategory,
                entry_fee_indian, entry_fee_foreigner, opening_time, closing_time,
                best_time_to_visit, duration_required, main_image, gallery_images,
                tags, highlights, contact_phone, contact_email, website
            } = siteData;

            const query = `
                INSERT INTO heritage_sites (
                    enterprise_id, name, description, location, category,
                    subcategory, entry_fee_indian, entry_fee_foreigner,
                    opening_time, closing_time, best_time_to_visit, duration_required,
                    main_image, gallery_images, tags, highlights,
                    contact_phone, contact_email, website,
                    is_active, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
                RETURNING *
            `;

            const values = [
                enterpriseId, name, description, location, category,
                subcategory || null, entry_fee_indian || 0, entry_fee_foreigner || 0,
                opening_time || null, closing_time || null, best_time_to_visit || null,
                duration_required || null, main_image || null, gallery_images || [],
                tags || [], highlights || [], contact_phone || null,
                contact_email || null, website || null, false // Sites need approval
            ];

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error adding site:', error);
            throw error;
        }
    }

    // Update site
    static async updateSite(enterpriseId, siteId, siteData) {
        try {
            // First verify site belongs to enterprise
            const checkQuery = 'SELECT id FROM heritage_sites WHERE id = $1 AND enterprise_id = $2';
            const checkResult = await db.query(checkQuery, [siteId, enterpriseId]);
            
            if (checkResult.rows.length === 0) {
                throw new Error('Site not found or not owned by this enterprise');
            }

            const allowedFields = [
                'name', 'description', 'location', 'category', 'subcategory',
                'entry_fee_indian', 'entry_fee_foreigner', 'opening_time', 'closing_time',
                'best_time_to_visit', 'duration_required', 'main_image', 'gallery_images',
                'tags', 'highlights', 'contact_phone', 'contact_email', 'website', 'is_active'
            ];

            const updates = [];
            const values = [];
            let paramIndex = 1;

            Object.keys(siteData).forEach(key => {
                if (allowedFields.includes(key) && siteData[key] !== undefined) {
                    updates.push(`${key} = $${paramIndex}`);
                    values.push(siteData[key]);
                    paramIndex++;
                }
            });

            if (updates.length === 0) {
                return null;
            }

            values.push(siteId);
            const query = `
                UPDATE heritage_sites 
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating site:', error);
            throw error;
        }
    }

    // Delete site (soft delete)
    static async deleteSite(enterpriseId, siteId) {
        try {
            const query = `
                UPDATE heritage_sites 
                SET is_active = false, updated_at = NOW()
                WHERE id = $1 AND enterprise_id = $2
                RETURNING id
            `;
            const result = await db.query(query, [siteId, enterpriseId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting site:', error);
            throw error;
        }
    }

    // Update enterprise rating
    static async updateRating(enterpriseId) {
        try {
            const query = `
                UPDATE enterprises e
                SET rating = (
                    SELECT COALESCE(AVG(r.rating), 0)
                    FROM reviews r
                    JOIN heritage_sites hs ON r.site_id = hs.id
                    WHERE hs.enterprise_id = e.id
                ),
                total_reviews = (
                    SELECT COUNT(*)
                    FROM reviews r
                    JOIN heritage_sites hs ON r.site_id = hs.id
                    WHERE hs.enterprise_id = e.id
                )
                WHERE e.id = $1
                RETURNING rating, total_reviews
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