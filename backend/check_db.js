import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Order from './models/Order.js';

dotenv.config();

const checkData = async () => {
    try {
        await connectDB();

        // Check Users
        const userCount = await User.countDocuments();
        console.log(`\n📊 DATABASE STATUS:\n`);
        console.log(`👥 Total Users: ${userCount}`);

        if (userCount > 0) {
            const users = await User.find().select('name email role createdAt');
            console.log('\n📋 User Details:');
            users.forEach((user, index) => {
                const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
                console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Created: ${createdDate}`);
            });
        } else {
            console.log('⚠️  No users found in database');
        }

        // Check Products
        const productCount = await Product.countDocuments();
        console.log(`\n📦 Total Products: ${productCount}`);

        // Check Categories
        const categoryCount = await Category.countDocuments();
        console.log(`📁 Total Categories: ${categoryCount}`);

        // Check Orders
        const orderCount = await Order.countDocuments();
        console.log(`🛒 Total Orders: ${orderCount}\n`);

        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkData();
