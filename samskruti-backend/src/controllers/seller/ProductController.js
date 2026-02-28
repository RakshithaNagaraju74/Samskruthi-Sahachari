const ProductModel = require('../../models/seller/ProductModel');

class ProductController {
    // Get all products
    static async getProducts(req, res) {
        try {
            const sellerId = req.sellerId;
            const { page, limit, status, search } = req.query;
            
            const result = await ProductModel.findAll(sellerId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                status,
                search
            });

            res.json({
                success: true,
                data: result.products,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load products' 
            });
        }
    }

    // Get single product
    static async getProduct(req, res) {
        try {
            const sellerId = req.sellerId;
            const productId = req.params.id;

            const product = await ProductModel.findById(productId, sellerId);

            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Product not found' 
                });
            }

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load product' 
            });
        }
    }

    // Create product - USING THE MODEL
    static async createProduct(req, res) {
        console.log('\n========== CREATE PRODUCT DEBUG ==========');
        
        try {
            // Check authentication
            if (!req.sellerId) {
                console.log('❌ No seller ID in request');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Seller not authenticated' 
                });
            }

            // Get fields from frontend form
            const { name, price, quantity } = req.body;
            
            // Validate required fields
            if (!name || !price || !quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name, price, and quantity are required' 
                });
            }

            // Process images
            // In your createProduct function, when processing images:
        const images = req.files ? req.files.map(f => {
                // Store with forward slashes for web compatibility
            return f.path.replace(/\\/g, '/');
            }) : [];
            console.log('Images:', images.length);

            // USE THE MODEL TO CREATE PRODUCT
            const product = await ProductModel.create(req.sellerId, req.body, images);

            console.log('✅ Product created successfully:', product.id);
            
            res.json({
                success: true,
                message: 'Product created successfully',
                data: product
            });

        } catch (error) {
            console.error('❌ ERROR:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Internal server error'
            });
        }
    }

    // Update product
    static async updateProduct(req, res) {
        try {
            const sellerId = req.sellerId;
            const productId = req.params.id;
            const files = req.files;

            // Check if product exists
            const existingProduct = await ProductModel.findById(productId, sellerId);
            if (!existingProduct) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Product not found' 
                });
            }

            // Process new images
            const newImages = files ? files.map(file => file.path) : [];
            
            const updatedProduct = await ProductModel.update(
                productId, 
                sellerId, 
                req.body, 
                newImages
            );

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: updatedProduct
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to update product' 
            });
        }
    }

    // Delete product
    static async deleteProduct(req, res) {
        try {
            const sellerId = req.sellerId;
            const productId = req.params.id;

            const deleted = await ProductModel.delete(productId, sellerId);

            if (!deleted) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Product not found' 
                });
            }

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to delete product' 
            });
        }
    }

    // Update product status
    static async updateStatus(req, res) {
        try {
            const sellerId = req.sellerId;
            const productId = req.params.id;
            const { status } = req.body;

            const product = await ProductModel.updateStatus(productId, sellerId, status);

            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Product not found' 
                });
            }

            res.json({
                success: true,
                message: `Product ${status} successfully`,
                data: product
            });
        } catch (error) {
            console.error('Update product status error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to update product status' 
            });
        }
    }

    // Update product quantity
    static async updateQuantity(req, res) {
        try {
            const sellerId = req.sellerId;
            const productId = req.params.id;
            const { quantity, reason } = req.body;

            const product = await ProductModel.updateQuantity(
                productId, 
                sellerId, 
                quantity, 
                reason
            );

            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Product not found' 
                });
            }

            res.json({
                success: true,
                message: 'Quantity updated successfully',
                data: product
            });
        } catch (error) {
            console.error('Update quantity error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to update quantity' 
            });
        }
    }

    // Get low stock products
    static async getLowStock(req, res) {
        try {
            const sellerId = req.sellerId;
            const products = await ProductModel.getLowStock(sellerId);

            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Get low stock error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to load low stock products' 
            });
        }
    }
}

module.exports = ProductController;