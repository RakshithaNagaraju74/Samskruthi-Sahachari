// models/HeritageSite.js
const db = require('../config/database');

class HeritageSite {
    // Get all heritage sites
    static async getAll() {
        try {
            const query = `
                SELECT 
                    hs.*,
                    jsonb_build_object(
                        'id', e.id,
                        'company_name', e.company_name,
                        'logo', e.logo_url,
                        'verified', e.verified,
                        'rating', e.rating
                    ) as enterprise
                FROM heritage_sites hs
                LEFT JOIN enterprises e ON hs.enterprise_id = e.id
                WHERE hs.is_active = true
                ORDER BY hs.is_featured DESC, hs.rating DESC, hs.name
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting all heritage sites:', error);
            throw error;
        }
    }

    // Get heritage site by ID
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    hs.*,
                    jsonb_build_object(
                        'id', e.id,
                        'company_name', e.company_name,
                        'logo', e.logo_url,
                        'verified', e.verified,
                        'rating', e.rating,
                        'contact_email', e.contact_email,
                        'contact_phone', e.contact_phone
                    ) as enterprise
                FROM heritage_sites hs
                LEFT JOIN enterprises e ON hs.enterprise_id = e.id
                WHERE hs.id = $1 AND hs.is_active = true
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding heritage site by ID:', error);
            throw error;
        }
    }

    // Get sites by category
    static async getByCategory(category) {
        try {
            const query = `
                SELECT * FROM heritage_sites 
                WHERE category = $1 AND is_active = true
                ORDER BY rating DESC
            `;
            const result = await db.query(query, [category]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sites by category:', error);
            throw error;
        }
    }

    // Get UNESCO sites
    static async getUnesco() {
        try {
            const query = `
                SELECT * FROM heritage_sites 
                WHERE is_unesco = true AND is_active = true
                ORDER BY name
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting UNESCO sites:', error);
            throw error;
        }
    }

    // Get featured sites
    static async getFeatured() {
        try {
            const query = `
                SELECT * FROM heritage_sites 
                WHERE is_featured = true AND is_active = true
                ORDER BY rating DESC
                LIMIT 6
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting featured sites:', error);
            throw error;
        }
    }

    // Search sites
    static async search(searchTerm) {
        try {
            const query = `
                SELECT * FROM heritage_sites 
                WHERE is_active = true 
                AND (
                    name ILIKE $1 
                    OR description ILIKE $1 
                    OR location ILIKE $1 
                    OR district ILIKE $1
                    OR $2 = ANY(tags)
                )
                ORDER BY 
                    CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
                    rating DESC
            `;
            const result = await db.query(query, [`%${searchTerm}%`, searchTerm.toLowerCase()]);
            return result.rows;
        } catch (error) {
            console.error('Error searching sites:', error);
            throw error;
        }
    }

    // Get sites by district
    static async getByDistrict(district) {
        try {
            const query = `
                SELECT * FROM heritage_sites 
                WHERE district ILIKE $1 AND is_active = true
                ORDER BY rating DESC
            `;
            const result = await db.query(query, [`%${district}%`]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sites by district:', error);
            throw error;
        }
    }

    // Get sites with filters
    static async getFiltered(filters) {
        try {
            let query = 'SELECT * FROM heritage_sites WHERE is_active = true';
            const values = [];
            let paramCount = 1;

            if (filters.category) {
                query += ` AND category = $${paramCount}`;
                values.push(filters.category);
                paramCount++;
            }

            if (filters.district) {
                query += ` AND district ILIKE $${paramCount}`;
                values.push(`%${filters.district}%`);
                paramCount++;
            }

            if (filters.minRating) {
                query += ` AND rating >= $${paramCount}`;
                values.push(filters.minRating);
                paramCount++;
            }

            if (filters.isUnesco === 'true') {
                query += ` AND is_unesco = true`;
            }

            if (filters.isFeatured === 'true') {
                query += ` AND is_featured = true`;
            }

            query += ' ORDER BY rating DESC, name';

            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error getting filtered sites:', error);
            throw error;
        }
    }

    // Get nearby sites
    static async getNearby(lat, lng, radius = 50) {
        try {
            // Simple approximation: 1 degree ≈ 111 km
            const latDiff = radius / 111.0;
            const lngDiff = radius / (111.0 * Math.cos(lat * Math.PI / 180));
            
            const query = `
                SELECT * FROM heritage_sites 
                WHERE latitude BETWEEN $1 AND $2
                AND longitude BETWEEN $3 AND $4
                AND is_active = true
                ORDER BY 
                    ABS(latitude - $5) + ABS(longitude - $6),
                    rating DESC
            `;
            const result = await db.query(query, [
                lat - latDiff, 
                lat + latDiff,
                lng - lngDiff,
                lng + lngDiff,
                lat,
                lng
            ]);
            return result.rows;
        } catch (error) {
            console.error('Error getting nearby sites:', error);
            throw error;
        }
    }

    // Get all districts (for filters)
    static async getDistricts() {
        try {
            const query = `
                SELECT DISTINCT district 
                FROM heritage_sites 
                WHERE is_active = true AND district IS NOT NULL
                ORDER BY district
            `;
            const result = await db.query(query);
            return result.rows.map(r => r.district);
        } catch (error) {
            console.error('Error getting districts:', error);
            throw error;
        }
    }

    // Get all categories
    static async getCategories() {
        try {
            const query = `
                SELECT DISTINCT category 
                FROM heritage_sites 
                WHERE is_active = true
                ORDER BY category
            `;
            const result = await db.query(query);
            return result.rows.map(r => r.category);
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Increment view count
    static async incrementView(id) {
        try {
            const query = 'UPDATE heritage_sites SET views = COALESCE(views, 0) + 1 WHERE id = $1';
            await db.query(query, [id]);
        } catch (error) {
            console.error('Error incrementing view:', error);
            throw error;
        }
    }
}

module.exports = HeritageSite;