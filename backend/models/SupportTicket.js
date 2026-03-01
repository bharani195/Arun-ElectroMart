import mongoose from 'mongoose';

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
        adminReply: {
            type: String,
            default: '',
        },
        repliedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
