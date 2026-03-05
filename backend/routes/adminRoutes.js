import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';
import {
    getActivities,
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getReportData
} from '../controllers/adminController.js';
import Notification from '../models/Notification.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Reports
router.get('/reports', getReportData);

// Activities
router.get('/activities', getActivities);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// --- Notifications ---
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name')
            .populate('product', 'name images price originalPrice discount slug brand')
            .populate('targetCategory', 'name');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        const {
            title, message, type, targetAudience,
            product: productId, targetCategory,
            discountCode, discountPercent, offerExpiry,
            sendEmail
        } = req.body;

        // Create notification
        const notification = await Notification.create({
            title, message, type, targetAudience,
            product: productId || undefined,
            targetCategory: targetCategory || undefined,
            discountCode, discountPercent, offerExpiry,
            sendEmail: !!sendEmail,
            emailStatus: sendEmail ? 'pending' : undefined,
            createdBy: req.user._id,
        });

        // Respond immediately (email sending is async)
        res.status(201).json(notification);

        // Send emails asynchronously if requested
        if (sendEmail && productId) {
            // Dynamic imports to avoid circular deps
            const { sendProductSpotlightEmail, sendDiscountOfferEmail, sendBulkEmails } = await import('../utils/emailService.js');
            const Product = (await import('../models/Product.js')).default;
            const User = (await import('../models/User.js')).default;
            const Order = (await import('../models/Order.js')).default;

            try {
                // Update status to sending
                await Notification.findByIdAndUpdate(notification._id, { emailStatus: 'sending' });

                // Fetch the product
                const product = await Product.findById(productId);
                if (!product) throw new Error('Product not found');

                // Build recipient list based on targetAudience
                let recipients = [];
                if (targetAudience === 'category_buyers' && targetCategory) {
                    // Find products in the target category
                    const categoryProducts = await Product.find({ category: targetCategory }).select('_id');
                    const productIds = categoryProducts.map(p => p._id);

                    // Find users who ordered those products
                    const orders = await Order.find({ 'items.product': { $in: productIds } })
                        .populate('user', 'name email')
                        .select('user');

                    // Deduplicate by user email
                    const seen = new Set();
                    orders.forEach(o => {
                        if (o.user?.email && !seen.has(o.user.email)) {
                            seen.add(o.user.email);
                            recipients.push({ email: o.user.email, name: o.user.name || 'Customer' });
                        }
                    });
                } else if (targetAudience === 'customers') {
                    const users = await User.find({ role: 'user' }).select('name email');
                    recipients = users.filter(u => u.email).map(u => ({ email: u.email, name: u.name || 'Customer' }));
                } else {
                    // all
                    const users = await User.find({}).select('name email');
                    recipients = users.filter(u => u.email).map(u => ({ email: u.email, name: u.name || 'Customer' }));
                }

                if (recipients.length === 0) {
                    await Notification.findByIdAndUpdate(notification._id, { emailStatus: 'sent', emailsSent: 0 });
                    return;
                }

                // Send based on type
                let sentCount = 0;
                if (type === 'discount_offer') {
                    const discountInfo = { discountCode, discountPercent, offerExpiry };
                    sentCount = await sendBulkEmails(sendDiscountOfferEmail, recipients, product, discountInfo, message);
                } else {
                    sentCount = await sendBulkEmails(sendProductSpotlightEmail, recipients, product, message);
                }

                await Notification.findByIdAndUpdate(notification._id, {
                    emailStatus: 'sent',
                    emailsSent: sentCount,
                });
                console.log(`✅ Notification emails sent: ${sentCount}/${recipients.length}`);

            } catch (emailErr) {
                console.error('❌ Failed to send notification emails:', emailErr.message);
                await Notification.findByIdAndUpdate(notification._id, { emailStatus: 'failed' });
            }
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/notifications/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Support Tickets ---
router.get('/support', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { subject: { $regex: search, $options: 'i' } },
                ]
            };
        }
        let tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).populate('user', 'name email');
        // Also filter by customer name if search provided
        if (search) {
            tickets = tickets.filter(t =>
                t.subject.toLowerCase().includes(search.toLowerCase()) ||
                t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                t.user?.email?.toLowerCase().includes(search.toLowerCase())
            );
        }
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/support/:id', async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        if (status) ticket.status = status;
        if (adminReply?.trim()) {
            // Push to replies array
            ticket.replies.push({ sender: 'admin', message: adminReply.trim() });
            // Also update legacy field
            ticket.adminReply = adminReply.trim();
            ticket.repliedAt = new Date();
            // Auto-set status to In Progress if still Open
            if (ticket.status === 'Open') ticket.status = 'In Progress';
        }
        await ticket.save();

        const updated = await SupportTicket.findById(ticket._id).populate('user', 'name email');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Chatbot Logs ---
router.get('/chatlogs', async (req, res) => {
    try {
        const ChatLog = (await import('../models/ChatLog.js')).default;
        const logs = await ChatLog.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
