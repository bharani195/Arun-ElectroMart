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
        const tickets = await SupportTicket.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/support/:id', async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const update = {};
        if (status) update.status = status;
        if (adminReply !== undefined) {
            update.adminReply = adminReply;
            update.repliedAt = new Date();
        }
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user', 'name email');
        res.json(ticket);
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
