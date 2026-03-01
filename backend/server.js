import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import userRoutes from './routes/user.routes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);

// Chatbot log endpoint (public — works for logged-in and guest users)
app.post('/api/chatlog', async (req, res) => {
    try {
        const ChatLog = (await import('./models/ChatLog.js')).default;
        const jwt = await import('jsonwebtoken');
        const { messages, sessionId } = req.body;
        if (!messages || !sessionId) return res.status(400).json({ message: 'messages and sessionId required' });

        // Try to extract user from token if present
        let userId = null;
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (e) { /* guest */ }
        }

        // Upsert — update existing log for same session, or create new
        const log = await ChatLog.findOneAndUpdate(
            { sessionId },
            {
                $set: {
                    user: userId || undefined,
                    guestName: userId ? undefined : 'Guest',
                    messages: messages.map(m => ({ role: m.type, text: m.text })),
                    messageCount: messages.filter(m => m.type === 'user').length,
                },
                $setOnInsert: { sessionId },
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, id: log._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ message: 'ElectroMart API is running...' });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
