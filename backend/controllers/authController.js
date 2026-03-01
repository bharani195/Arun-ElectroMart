import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Enter a valid email' });
        }

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Enter a valid email' });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Success - return user data with token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                addresses: user.addresses,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                addresses: updatedUser.addresses,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add address
// @route   POST /api/auth/address
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const { name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

            // If this is set as default, unset all other defaults
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
                isDefault: isDefault || user.addresses.length === 0,
            });

            await user.save();

            res.status(201).json({ message: 'Address added successfully', addresses: user.addresses });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/auth/address/:id
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const address = user.addresses.id(req.params.id);

            if (address) {
                const { name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

                address.name = name || address.name;
                address.phone = phone || address.phone;
                address.addressLine1 = addressLine1 || address.addressLine1;
                address.addressLine2 = addressLine2 || address.addressLine2;
                address.city = city || address.city;
                address.state = state || address.state;
                address.pincode = pincode || address.pincode;

                // If setting as default, unset all others
                if (isDefault) {
                    user.addresses.forEach((addr) => {
                        addr.isDefault = false;
                    });
                    address.isDefault = true;
                }

                await user.save();

                res.json({ message: 'Address updated successfully', addresses: user.addresses });
            } else {
                res.status(404).json({ message: 'Address not found' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/auth/address/:id
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id);

            await user.save();

            res.json({ message: 'Address deleted successfully', addresses: user.addresses });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
