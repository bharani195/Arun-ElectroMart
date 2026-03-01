import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.middleware.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// Address routes
router.post('/address', addAddress);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);

// Support tickets (user-facing)
router.post('/support', async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user._id,
            subject, message,
            priority: priority || 'Medium',
        });
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/support', async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
