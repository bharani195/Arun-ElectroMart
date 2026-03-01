import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/create', protect, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);

export default router;
