import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update/:itemId', protect, updateCartItem);
router.delete('/remove/:itemId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

export default router;
