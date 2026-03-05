import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
        },
        type: {
            type: String,
            enum: ['info', 'offer', 'alert', 'update', 'product_spotlight', 'discount_offer'],
            default: 'info',
        },
        targetAudience: {
            type: String,
            enum: ['all', 'customers', 'category_buyers'],
            default: 'all',
        },
        // Product-linked notification
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        // Category-based targeting
        targetCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        // Discount / Offer fields
        discountCode: {
            type: String,
            trim: true,
        },
        discountPercent: {
            type: Number,
            min: 0,
            max: 100,
        },
        offerExpiry: {
            type: Date,
        },
        // Email tracking
        sendEmail: {
            type: Boolean,
            default: false,
        },
        emailsSent: {
            type: Number,
            default: 0,
        },
        emailStatus: {
            type: String,
            enum: ['pending', 'sending', 'sent', 'failed'],
            default: 'pending',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
