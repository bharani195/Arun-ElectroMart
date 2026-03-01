import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        guestName: {
            type: String,
            default: 'Guest',
        },
        messages: [chatMessageSchema],
        messageCount: {
            type: Number,
            default: 0,
        },
        sessionId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

export default ChatLog;
