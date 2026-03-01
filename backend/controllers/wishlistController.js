import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        // Filter out null products (in case referenced products were deleted)
        wishlist.products = wishlist.products.filter(product => product !== null);

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        // Check if product already exists
        if (wishlist.products.some(id => id.toString() === productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        // Populate to return full product details
        await wishlist.populate('products');

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        // Populate to return full product details
        await wishlist.populate('products');

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
