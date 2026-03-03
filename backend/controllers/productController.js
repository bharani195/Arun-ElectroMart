import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { logActivity } from '../controllers/adminController.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort, featured, bestseller, lowcost, page = 1, limit = 12 } = req.query;

        // Build query
        const query = { isActive: true };

        if (category) {
            // Check if it's a valid MongoDB ObjectId
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
            if (isObjectId) {
                query.category = category;
            } else {
                // Search by category name (case-insensitive)
                const matchingCategories = await Category.find({
                    name: { $regex: category, $options: 'i' }
                });
                if (matchingCategories.length > 0) {
                    query.category = { $in: matchingCategories.map(c => c._id) };
                } else {
                    // No matching category found, return empty
                    query.category = null;
                }
            }
        }

        // Filter by product type flags
        if (featured === 'true') {
            query.isFeatured = true;
        }
        if (bestseller === 'true') {
            query.isBestSeller = true;
        }
        if (lowcost === 'true') {
            // Low cost products are those priced below ₹500
            query.price = { $lt: 500 };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        // Only apply minPrice/maxPrice if lowcost filter is not active
        if ((minPrice || maxPrice) && lowcost !== 'true') {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Log the query for debugging
        console.log('Products query:', JSON.stringify(query));

        // Build sort
        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'name_asc') sortOption = { name: 1 };
        if (sort === 'name_desc') sortOption = { name: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
    try {
        const limit = 4;
        let products = await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .limit(limit)
            .sort({ createdAt: -1 });

        // If not enough featured products, backfill with recent products
        if (products.length < limit) {
            const featuredIds = products.map(p => p._id);
            const remaining = limit - products.length;
            const extraProducts = await Product.find({
                _id: { $nin: featuredIds },
                isActive: true
            })
                .populate('category', 'name slug')
                .limit(remaining)
                .sort({ createdAt: -1 });
            products = [...products, ...extraProducts];
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            originalPrice,
            discount,
            category,
            brand,
            images,
            stock,
            specifications,
            features,
            tags,
            isActive,
            isFeatured,
            isBestSeller,
            isLowCost,
        } = req.body;

        const product = await Product.create({
            name,
            description,
            shortDescription,
            price,
            originalPrice,
            discount,
            category,
            brand,
            images,
            stock,
            specifications,
            features,
            tags,
            isActive,
            isFeatured,
            isBestSeller,
            isLowCost,
        });

        // Log activity
        await logActivity(req, 'product_create', `Created product: ${product.name}`, { productId: product._id, name: product.name });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const {
                name,
                description,
                shortDescription,
                price,
                originalPrice,
                discount,
                category,
                brand,
                images,
                stock,
                specifications,
                features,
                tags,
                isActive,
                isFeatured,
                isBestSeller,
                isLowCost,
            } = req.body;

            product.name = name || product.name;
            product.description = description || product.description;
            product.shortDescription = shortDescription || product.shortDescription;
            product.price = price !== undefined ? price : product.price;
            product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
            product.discount = discount !== undefined ? discount : product.discount;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.images = images || product.images;
            product.stock = stock !== undefined ? stock : product.stock;
            product.specifications = specifications || product.specifications;
            product.features = features || product.features;
            product.tags = tags || product.tags;
            if (isActive !== undefined) product.isActive = isActive;
            if (isFeatured !== undefined) product.isFeatured = isFeatured;
            if (isBestSeller !== undefined) product.isBestSeller = isBestSeller;
            if (isLowCost !== undefined) product.isLowCost = isLowCost;

            const updatedProduct = await product.save();

            // Log activity
            await logActivity(req, 'product_update', `Updated product: ${updatedProduct.name}`, { productId: updatedProduct._id, name: updatedProduct.name });

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const productName = product.name;
            const productId = product._id;
            await product.deleteOne();

            // Log activity
            await logActivity(req, 'product_delete', `Deleted product: ${productName}`, { productId, name: productName });

            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
