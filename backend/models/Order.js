import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const shippingAddressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
});

const trackingUpdateSchema = new mongoose.Schema({
    status: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'Online'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        paymentId: {
            type: String,
        },
        orderStatus: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        subtotal: {
            type: Number,
            required: true,
        },
        shippingCharge: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        trackingInfo: {
            trackingNumber: String,
            courier: String,
            updateHistory: [trackingUpdateSchema],
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
