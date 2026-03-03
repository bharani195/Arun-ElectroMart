import crypto from 'crypto';
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Order from '../models/Order.js';
import { sendInvoiceEmail } from '../utils/emailService.js';

const router = express.Router();

// Lazy-init Razorpay (env vars loaded by dotenv in server.js before routes are hit)
let razorpay = null;
const getRazorpay = async () => {
    if (!razorpay) {
        const RazorpayModule = await import('razorpay');
        const Razorpay = RazorpayModule.default;
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const rzp = await getRazorpay();

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: 'INR',
            receipt: orderId || `receipt_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
            },
        };

        const razorpayOrder = await rzp.orders.create(options);

        res.json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: 'Error creating payment order' });
    }
});

// @desc    Verify payment and update order
// @route   POST /api/payment/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Payment verification failed
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'Failed',
                });
            }
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Payment verified — update order
        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'Paid',
                paymentId: razorpay_payment_id,
                orderStatus: 'Confirmed',
            });

            // Send invoice email asynchronously (non-blocking)
            const fullOrder = await Order.findById(orderId).populate('user', 'name email phone');
            if (fullOrder) {
                sendInvoiceEmail(fullOrder).catch(err => console.error('Email send error:', err.message));
            }
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id,
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// @desc    Get Razorpay key (for frontend)
// @route   GET /api/payment/key
// @access  Public
router.get('/key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

export default router;
