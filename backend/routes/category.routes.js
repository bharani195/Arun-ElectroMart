import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
