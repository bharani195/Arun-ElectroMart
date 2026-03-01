import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (cart) {
            res.json(cart);
        } else {
            res.json({ items: [], totalAmount: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if product already in cart
        const existingItem = cart.items.find((item) => item.product.toString() === productId);

        if (existingItem) {
            // Update quantity
            existingItem.quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
            });
        }

        await cart.save();
        await cart.populate('items.product');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update cart item
// @route   PUT /api/cart/update/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Check stock
        const product = await Product.findById(item.product);
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        item.quantity = quantity;

        await cart.save();
        await cart.populate('items.product');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

        await cart.save();
        await cart.populate('items.product');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
