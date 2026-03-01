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
            enum: ['info', 'offer', 'alert', 'update'],
            default: 'info',
        },
        targetAudience: {
            type: String,
            enum: ['all', 'customers'],
            default: 'all',
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
