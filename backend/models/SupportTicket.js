import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['customer', 'admin'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const supportTicketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subject: {
            type: String,
            required: [true, 'Please provide a subject'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        // Legacy single reply (kept for backward compat)
        adminReply: {
            type: String,
            default: '',
        },
        repliedAt: {
            type: Date,
        },
        // Multi-reply thread
        replies: [replySchema],
    },
    {
        timestamps: true,
    }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
