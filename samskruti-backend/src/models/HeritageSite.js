const db = require('../config/database');

class HeritageSite {
    // Get all heritage sites
    static async getAll() {
        try {
            const query = `
                SELECT 
                    id,
                    name,
                    description,
                    short_description,
                    location,
                    district,
                    state,
                    latitude,
                    longitude,
                    category,
                    subcategory,
                    site_type,
                    main_image,
                    gallery_images,
                    built_in,
                    built_by,
                    architectural_style,
                    significance,
                    entry_fee_indian,
                    entry_fee_foreigner,
                    opening_time,
                    closing_time,
                    best_time_to_visit,
                    duration_required,
                    contact_phone,
                    contact_email,
                    website,
                    enterprise_id,
                    is_unesco,
                    is_featured,
                    is_active,
                    rating,
                    total_reviews,
                    tags,
                    highlights,
                    pickup_points,
                    views,
                    created_at,
                    updated_at
                FROM heritage_sites
                WHERE is_active = true
                ORDER BY is_featured DESC, rating DESC NULLS LAST, name ASC
            `;
            
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting heritage sites:', error);
            throw error;
        }
    }

    // Get heritage site by ID
    static async findById(id) {
        try {
            const query = `
                SELECT 
                    id,
                    name,
                    description,
                    short_description,
                    location,
                    district,
                    state,
                    latitude,
                    longitude,
                    category,
                    subcategory,
                    site_type,
                    main_image,
                    gallery_images,
                    built_in,
                    built_by,
                    architectural_style,
                    significance,
                    entry_fee_indian,
                    entry_fee_foreigner,
                    opening_time,
                    closing_time,
                    best_time_to_visit,
                    duration_required,
                    contact_phone,
                    contact_email,
                    website,
                    enterprise_id,
                    is_unesco,
                    is_featured,
                    is_active,
                    rating,
                    total_reviews,
                    tags,
                    highlights,
                    pickup_points,
                    views,
                    created_at,
                    updated_at
                FROM heritage_sites
                WHERE id = $1 AND is_active = true
            `;
            
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding heritage site by ID:', error);
            throw error;
        }
    }

    // Get products associated with a site
    static async getProducts(siteId) {
        try {
            const query = `
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.thumbnail,
                    s.shop_name as seller_shop_name
                FROM products p
                JOIN site_products sp ON p.id = sp.product_id
                JOIN sellers s ON p.seller_id = s.id
                WHERE sp.site_id = $1 AND p.status = 'published'
                ORDER BY p.name
            `;
            const result = await db.query(query, [siteId]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching site products:', error);
            throw error;
        }
    }

    // Get sites by category
    static async getByCategory(category) {
        try {
            const query = `
                SELECT * FROM heritage_sites
                WHERE LOWER(category) = LOWER($1) AND is_active = true
                ORDER BY is_featured DESC, rating DESC NULLS LAST, name ASC
            `;
            
            const result = await db.query(query, [category]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sites by category:', error);
            throw error;
        }
    }

    // Get sites by site_type
    static async getBySiteType(siteType) {
        try {
            const query = `
                SELECT * FROM heritage_sites
                WHERE LOWER(site_type) = LOWER($1) AND is_active = true
                ORDER BY is_featured DESC, rating DESC NULLS LAST, name ASC
            `;
            
            const result = await db.query(query, [siteType]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sites by site type:', error);
            throw error;
        }
    }

    // Get UNESCO sites
    static async getUnesco() {
        try {
            const query = `
                SELECT * FROM heritage_sites
                WHERE is_unesco = true AND is_active = true
                ORDER BY rating DESC NULLS LAST, name ASC
            `;
            
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting UNESCO sites:', error);
            throw error;
        }
    }

    // Get featured sites
    static async getFeatured(limit = 6) {
        try {
            const query = `
                SELECT * FROM heritage_sites
                WHERE is_featured = true AND is_active = true
                ORDER BY rating DESC NULLS LAST, name ASC
                LIMIT $1
            `;
            
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Error getting featured sites:', error);
            throw error;
        }
    }

    // Search sites
    static async search(searchTerm) {
        try {
            const term = `%${searchTerm.toLowerCase()}%`;
            const query = `
                SELECT * FROM heritage_sites
                WHERE is_active = true AND (
                    LOWER(name) LIKE $1 OR
                    LOWER(description) LIKE $1 OR
                    LOWER(short_description) LIKE $1 OR
                    LOWER(location) LIKE $1 OR
                    LOWER(district) LIKE $1 OR
                    LOWER(category) LIKE $1 OR
                    LOWER(site_type) LIKE $1 OR
                    EXISTS (
                        SELECT 1 FROM unnest(tags) tag
                        WHERE LOWER(tag) LIKE $1
                    )
                )
                ORDER BY 
                    CASE WHEN LOWER(name) LIKE $1 THEN 1 ELSE 2 END,
                    rating DESC NULLS LAST,
                    name ASC
            `;
            
            const result = await db.query(query, [term]);
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
                WHERE LOWER(district) = LOWER($1) AND is_active = true
                ORDER BY rating DESC NULLS LAST, name ASC
            `;
            
            const result = await db.query(query, [district]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sites by district:', error);
            throw error;
        }
    }

    // Get sites by enterprise
    static async getByEnterpriseId(enterpriseId) {
        try {
            const query = `
                SELECT * FROM heritage_sites
                WHERE enterprise_id = $1 AND is_active = true
                ORDER BY is_featured DESC, rating DESC NULLS LAST, name ASC
            `;
            
            const result = await db.query(query, [enterpriseId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting sites by enterprise:', error);
            throw error;
        }
    }

    // Get sites with filters
    static async getFiltered(filters) {
        try {
            let query = 'SELECT * FROM heritage_sites WHERE is_active = true';
            const values = [];
            let paramIndex = 1;

            if (filters.category) {
                query += ` AND LOWER(category) = LOWER($${paramIndex})`;
                values.push(filters.category);
                paramIndex++;
            }

            if (filters.site_type) {
                query += ` AND LOWER(site_type) = LOWER($${paramIndex})`;
                values.push(filters.site_type);
                paramIndex++;
            }

            if (filters.district) {
                query += ` AND LOWER(district) = LOWER($${paramIndex})`;
                values.push(filters.district);
                paramIndex++;
            }

            if (filters.minRating) {
                query += ` AND rating >= $${paramIndex}`;
                values.push(parseFloat(filters.minRating));
                paramIndex++;
            }

            if (filters.isUnesco === 'true') {
                query += ` AND is_unesco = true`;
            }

            if (filters.isFeatured === 'true') {
                query += ` AND is_featured = true`;
            }

            if (filters.enterprise_id) {
                query += ` AND enterprise_id = $${paramIndex}`;
                values.push(parseInt(filters.enterprise_id));
                paramIndex++;
            }

            query += ' ORDER BY is_featured DESC, rating DESC NULLS LAST, name ASC';

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
            const query = `
                SELECT * FROM heritage_sites
                WHERE is_active = true 
                AND latitude IS NOT NULL 
                AND longitude IS NOT NULL
            `;
            
            const result = await db.query(query);
            
            // Haversine distance calculation
            const toRad = (value) => (value * Math.PI) / 180;
            const sitesWithDistance = result.rows.map(site => {
                const dLat = toRad(site.latitude - lat);
                const dLon = toRad(site.longitude - lng);
                const a = 
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat)) * Math.cos(toRad(site.latitude)) * 
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = 6371 * c; // km
                return { ...site, distance };
            });
            
            return sitesWithDistance
                .filter(site => site.distance <= radius)
                .sort((a, b) => a.distance - b.distance);
        } catch (error) {
            console.error('Error getting nearby sites:', error);
            throw error;
        }
    }

    // Get all districts
    static async getDistricts() {
        try {
            const query = `
                SELECT DISTINCT district 
                FROM heritage_sites 
                WHERE district IS NOT NULL AND district != '' AND is_active = true
                ORDER BY district ASC
            `;
            const result = await db.query(query);
            return result.rows.map(row => row.district);
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
                WHERE category IS NOT NULL AND category != '' AND is_active = true
                ORDER BY category ASC
            `;
            const result = await db.query(query);
            return result.rows.map(row => row.category);
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Get all site types
    static async getSiteTypes() {
        try {
            const query = `
                SELECT DISTINCT site_type 
                FROM heritage_sites 
                WHERE site_type IS NOT NULL AND site_type != '' AND is_active = true
                ORDER BY site_type ASC
            `;
            const result = await db.query(query);
            return result.rows.map(row => row.site_type);
        } catch (error) {
            console.error('Error getting site types:', error);
            throw error;
        }
    }

    // Increment view count
    static async incrementView(id) {
        try {
            await db.query(
                'UPDATE heritage_sites SET views = COALESCE(views, 0) + 1 WHERE id = $1',
                [id]
            );
        } catch (error) {
            console.error('Error incrementing view:', error);
            throw error;
        }
    }

    // Create a new heritage site (with product associations)
    static async create(siteData) {
        const client = await db.pool.connect(); // use a transaction
        try {
            await client.query('BEGIN');

            const {
                enterprise_id,
                name,
                location,
                district,
                state,
                description,
                short_description,
                category,
                subcategory,
                site_type,
                main_image,
                gallery_images,
                built_in,
                built_by,
                architectural_style,
                significance,
                entry_fee_indian,
                entry_fee_foreigner,
                opening_time,
                closing_time,
                best_time_to_visit,
                duration_required,
                contact_phone,
                contact_email,
                website,
                is_unesco,
                is_featured,
                is_active,
                tags,
                highlights,
                pickup_points,
                product_ids,          // array of product IDs to associate
                rating,
                total_reviews,
                views
            } = siteData;

            const insertQuery = `
                INSERT INTO heritage_sites (
                    enterprise_id, name, location, district, state,
                    description, short_description, category, subcategory, site_type,
                    main_image, gallery_images, built_in, built_by, architectural_style,
                    significance, entry_fee_indian, entry_fee_foreigner,
                    opening_time, closing_time, best_time_to_visit, duration_required,
                    contact_phone, contact_email, website,
                    is_unesco, is_featured, is_active,
                    tags, highlights, pickup_points,
                    rating, total_reviews, views,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18,
                    $19, $20, $21, $22, $23, $24, $25,
                    $26, $27, $28,
                    $29::text[], $30::text[], $31::text[],
                    $32, $33, $34,
                    NOW(), NOW()
                ) RETURNING *
            `;

            const values = [
                enterprise_id,
                name,
                location,
                district,
                state,
                description,
                short_description,
                category,
                subcategory,
                site_type,
                main_image,
                gallery_images || [],
                built_in,
                built_by,
                architectural_style,
                significance,
                entry_fee_indian,
                entry_fee_foreigner,
                opening_time,
                closing_time,
                best_time_to_visit,
                duration_required,
                contact_phone,
                contact_email,
                website,
                is_unesco || false,
                is_featured || false,
                is_active !== false,
                tags || [],
                highlights || [],
                pickup_points || [],
                rating || 0,
                total_reviews || 0,
                views || 0
            ];

            const result = await client.query(insertQuery, values);
            const newSite = result.rows[0];

            // Insert product associations if any
            if (product_ids && product_ids.length > 0) {
                for (const productId of product_ids) {
                    await client.query(
                        'INSERT INTO site_products (site_id, product_id) VALUES ($1, $2)',
                        [newSite.id, productId]
                    );
                }
            }

            await client.query('COMMIT');
            return newSite;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating heritage site:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Update a heritage site
    static async update(id, siteData) {
        try {
            const setClause = [];
            const values = [];
            let paramIndex = 1;

            const fields = [
                'name', 'location', 'district', 'state',
                'description', 'short_description', 'category', 'subcategory', 'site_type',
                'main_image', 'gallery_images', 'built_in', 'built_by', 'architectural_style',
                'significance', 'entry_fee_indian', 'entry_fee_foreigner',
                'opening_time', 'closing_time', 'best_time_to_visit', 'duration_required',
                'contact_phone', 'contact_email', 'website',
                'is_unesco', 'is_featured', 'is_active',
                'tags', 'highlights', 'pickup_points',
                'rating', 'total_reviews', 'views'
            ];

            fields.forEach(field => {
                if (siteData[field] !== undefined) {
                    setClause.push(`${field} = $${paramIndex}`);
                    values.push(siteData[field]);
                    paramIndex++;
                }
            });

            setClause.push(`updated_at = NOW()`);
            values.push(id);

            const query = `
                UPDATE heritage_sites
                SET ${setClause.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating heritage site:', error);
            throw error;
        }
    }

    // Delete (soft delete) a heritage site
    static async delete(id) {
        try {
            const query = `
                UPDATE heritage_sites
                SET is_active = false, updated_at = NOW()
                WHERE id = $1
                RETURNING id
            `;
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting heritage site:', error);
            throw error;
        }
    }

    // Get site statistics
    static async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_sites,
                    COUNT(CASE WHEN is_unesco THEN 1 END) as unesco_sites,
                    COUNT(CASE WHEN is_featured THEN 1 END) as featured_sites,
                    COUNT(DISTINCT category) as total_categories,
                    COUNT(DISTINCT district) as total_districts,
                    AVG(rating) as avg_rating,
                    SUM(views) as total_views
                FROM heritage_sites
                WHERE is_active = true
            `;
            const result = await db.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting site stats:', error);
            throw error;
        }
    }
}

module.exports = HeritageSite;