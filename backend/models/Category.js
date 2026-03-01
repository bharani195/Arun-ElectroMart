import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
        },
        icon: {
            type: String,
        },
        image: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '');
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
