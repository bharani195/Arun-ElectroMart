import Category from '../models/Category.js';
import { logActivity } from './adminController.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description, icon, image } = req.body;

        const category = await Category.create({
            name,
            description,
            icon,
            image,
        });

        // Log category creation
        await logActivity(req, 'category_create', `Created category: ${category.name}`, { categoryId: category._id, name: category.name });

        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Category already exists' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
    try {
        const { name, description, icon, image, isActive } = req.body;

        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.description = description || category.description;
            category.icon = icon || category.icon;
            category.image = image || category.image;
            if (isActive !== undefined) category.isActive = isActive;

            const updatedCategory = await category.save();

            // Log category update
            await logActivity(req, 'category_update', `Updated category: ${updatedCategory.name}`, { categoryId: updatedCategory._id, name: updatedCategory.name });

            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            const categoryName = category.name;
            await category.deleteOne();

            // Log category deletion
            await logActivity(req, 'category_delete', `Deleted category: ${categoryName}`, { categoryId: req.params.id, name: categoryName });

            res.json({ message: 'Category deleted successfully' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
