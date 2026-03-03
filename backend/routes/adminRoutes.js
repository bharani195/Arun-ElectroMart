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
        const notifications = await Notification.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        const { title, message, type, targetAudience } = req.body;
        const notification = await Notification.create({
            title, message, type, targetAudience,
            createdBy: req.user._id,
        });
        res.status(201).json(notification);
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
