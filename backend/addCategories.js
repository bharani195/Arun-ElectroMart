import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import connectDB from './config/db.js';

dotenv.config();

const categories = [
    {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and components',
        isActive: true,
    },
    {
        name: 'Switches & Accessories',
        slug: 'switches-accessories',
        description: 'Electrical switches, sockets, and accessories',
        isActive: true,
    },
    {
        name: 'Fans',
        slug: 'fans',
        description: 'Ceiling fans, table fans, and exhaust fans',
        isActive: true,
    },
    {
        name: 'Water Pumps & Motors',
        slug: 'water-pumps-motors',
        description: 'Water pumps, motors, and related equipment',
        isActive: true,
    },
    {
        name: 'Power Backup & Power Supply',
        slug: 'power-backup-supply',
        description: 'UPS, inverters, batteries, and power supply units',
        isActive: true,
    },
    {
        name: 'Wires & Cables',
        slug: 'wires-cables',
        description: 'Electrical wires, cables, and conduits',
        isActive: true,
    },
];

const addCategories = async () => {
    try {
        await connectDB();

        console.log('Clearing existing categories...');
        await Category.deleteMany({});

        console.log('Adding new categories...');
        const createdCategories = await Category.insertMany(categories);

        console.log('✅ Categories added successfully!');
        console.log('\nAdded categories:');
        createdCategories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding categories:', error);
        process.exit(1);
    }
};

addCategories();
