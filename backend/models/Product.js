import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            default: '',
        },
        shortDescription: {
            type: String,
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        originalPrice: {
            type: Number,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please provide a category'],
        },
        brand: {
            type: String,
        },
        images: [
            {
                type: String,
            },
        ],
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        stockStatus: {
            type: String,
            enum: ['In Stock', 'Low Stock', 'Out of Stock'],
            default: 'In Stock',
        },
        specifications: [
            {
                key: String,
                value: String,
            },
        ],
        features: [String],
        tags: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isBestSeller: {
            type: Boolean,
            default: false,
        },
        isLowCost: {
            type: Boolean,
            default: false,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '');
    }

    // Update stock status based on stock quantity
    if (this.stock === 0) {
        this.stockStatus = 'Out of Stock';
    } else if (this.stock <= 10) {
        this.stockStatus = 'Low Stock';
    } else {
        this.stockStatus = 'In Stock';
    }

    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
