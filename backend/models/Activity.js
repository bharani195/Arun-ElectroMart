import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['user_login', 'user_register', 'product_view', 'product_create', 'product_update', 'product_delete', 'order_placed', 'order_updated', 'cart_add', 'cart_remove', 'category_create', 'category_update', 'category_delete', 'admin_action']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: String,
        userEmail: String,
        description: {
            type: String,
            required: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        },
        ipAddress: String,
        userAgent: String,
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
