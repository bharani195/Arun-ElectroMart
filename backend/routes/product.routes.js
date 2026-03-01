import express from 'express';
import {
    getProducts,
    getFeaturedProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Image upload route
router.post('/upload', protect, admin, upload.array('images', 5), (req, res) => {
    try {
        const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
        res.json({ images: filePaths });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
