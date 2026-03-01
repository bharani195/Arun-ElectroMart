import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get order statistics
        const orders = await Order.find({ user: req.user._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
            user,
            stats: {
                totalOrders,
                totalSpent,
                memberSince: user.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;

        // Check if email is being changed and if it's already taken
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = req.body.email;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            addresses: updatedUser.addresses,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new address
// @route   POST /api/users/address
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        user.addresses.push({
            name,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            isDefault: isDefault || user.addresses.length === 0, // First address is default
        });

        await user.save();

        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/users/address/:id
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const { name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        address.name = name || address.name;
        address.phone = phone || address.phone;
        address.addressLine1 = addressLine1 || address.addressLine1;
        address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
        address.city = city || address.city;
        address.state = state || address.state;
        address.pincode = pincode || address.pincode;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Remove address
        address.deleteOne();
        await user.save();

        res.json({ message: 'Address removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
