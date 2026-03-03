import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import generateOrderNumber from '../utils/generateOrderNumber.js';

// @desc    Create new order
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, shippingCharge = 0 } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Validate and prepare order items
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images[0] || '',
                quantity: item.quantity,
                price: product.price,
                subtotal: itemSubtotal,
            });

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const totalAmount = subtotal + shippingCharge;

        // Create order
        const order = await Order.create({
            user: req.user._id,
            orderNumber: generateOrderNumber(),
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingCharge,
            totalAmount,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
            orderStatus: 'Pending',
        });

        // Clear user cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/user
// @access  Private
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order belongs to user (or user is admin)
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) {
            query.orderStatus = status;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (orderStatus) {
            order.orderStatus = orderStatus;

            // Auto-sync payment status based on order status
            if (orderStatus === 'Confirmed' && order.paymentMethod !== 'COD') {
                // Online payment orders: mark as Paid when confirmed
                order.paymentStatus = 'Paid';
            }

            if (orderStatus === 'Delivered') {
                // All orders (including COD): mark as Paid on delivery
                order.paymentStatus = 'Paid';
            }

            if (orderStatus === 'Cancelled' && order.paymentStatus !== 'Paid') {
                order.paymentStatus = 'Cancelled';
            }
        }

        // Allow manual override of payment status
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
