// Seed script to populate database with sample data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

// Sample data
const users = [
    {
        name: 'Admin User',
        email: 'arunum.24mca@kongu.edu',
        password: 'Arun@2003',
        role: 'admin',
        phone: '9876543210',
    },
    {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        phone: '9876543211',
        addresses: [
            {
                name: 'John Doe',
                phone: '9876543211',
                addressLine1: '123 Main Street',
                addressLine2: 'Apartment 4B',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                isDefault: true,
            },
        ],
    },
];

const categories = [
    {
        name: 'Electronics',
        description: 'Electronic devices and components',
        icon: '⚡',
    },
    {
        name: 'Switches & Accessories',
        description: 'Electrical switches and accessories',
        icon: '🔌',
    },
    {
        name: 'Power Backup & Power Supply',
        description: 'UPS, inverters, and power supplies',
        icon: '🔋',
    },
    {
        name: 'Fans',
        description: 'Ceiling fans, table fans, and exhaust fans',
        icon: '🌀',
    },
    {
        name: 'Wires & Cables',
        description: 'Electrical wires and cables',
        icon: '🔌',
    },
    {
        name: 'Water Pumps & Motors',
        description: 'Submersible pumps and motors',
        icon: '💧',
    },
];

const products = [
    // Fans
    {
        categoryName: 'Fans',
        name: 'Crompton Ceiling Fan',
        shortDescription: 'High performance ceiling fan with powerful air delivery',
        description: 'High performance ceiling fan with powerful air delivery and energy-efficient motor. Designed for silent operation and long-lasting performance.',
        price: 2499.99,
        originalPrice: 3499,
        discount: 29,
        brand: 'Crompton',
        images: ['/uploads/fan-1.jpg'],
        stock: 25,
        isFeatured: true,
        specifications: [
            { key: 'Sweep', value: '1200mm' },
            { key: 'Wattage', value: '75W' },
            { key: 'Speed', value: '3 Speed' },
            { key: 'Warranty', value: '2 Years' },
        ],
        features: ['Energy Efficient', 'Silent Operation', 'Anti-dust coating'],
        tags: ['ceiling fan', 'energy efficient', 'crompton'],
    },

    // Wires & Cables
    {
        categoryName: 'Wires & Cables',
        name: 'Polycab PVC Copper Wire 2.5 sq mm',
        shortDescription: 'High quality ISI marked copper wire suitable for all electrical wiring',
        description: 'High quality ISI marked copper wire suitable for all electrical wiring and commercial wiring with excellent heat resistance.',
        price: 2499,
        originalPrice: 3199,
        discount: 22,
        brand: 'Polycab',
        images: ['/uploads/wire-1.jpg'],
        stock: 45,
        isFeatured: true,
        specifications: [
            { key: 'Wire Size', value: '2.5 sq mm' },
            { key: 'Material', value: '99.97% Pure Copper' },
            { key: 'Length', value: '90 meters' },
            { key: 'Voltage Rating', value: '1100V' },
        ],
        features: ['ISI Certified', 'Fire Resistant', 'Durable PVC Insulation'],
        tags: ['wire', 'copper', 'polycab', 'electrical'],
    },
    {
        categoryName: 'Wires & Cables',
        name: 'Havells FR LSH House Wire 1.5 sq mm',
        shortDescription: 'Fire-retardant low-smoke halogen-free house wire',
        description: 'Fire-retardant low-smoke halogen-free house wire designed for enhanced safety in homes and apartments.',
        price: 1899,
        originalPrice: 2299,
        discount: 17,
        brand: 'Havells',
        images: ['/uploads/wire-2.jpg'],
        stock: 38,
        specifications: [
            { key: 'Wire Size', value: '1.5 sq mm' },
            { key: 'Material', value: 'Copper' },
            { key: 'Length', value: '90 meters' },
            { key: 'Type', value: 'FR LSH' },
        ],
        features: ['Fire Retardant', 'Low Smoke', 'Halogen Free'],
        tags: ['wire', 'fire retardant', 'havells'],
    },
    {
        categoryName: 'Wires & Cables',
        name: 'Finolex 3 Core Flexible Power Cable',
        shortDescription: 'Multi-core flexible power cable for various applications',
        description: 'Multi-core flexible power cable suitable for electrical appliances and power connections.',
        price: 3299,
        originalPrice: 4199,
        discount: 21,
        brand: 'Finolex',
        images: ['/uploads/cable-1.jpg'],
        stock: 28,
        specifications: [
            { key: 'Cores', value: '3 Core' },
            { key: 'Size', value: '1.5 sq mm' },
            { key: 'Length', value: '100 meters' },
            { key: 'Type', value: 'Flexible' },
        ],
        features: ['ISI Certified', 'Flexible', 'Durable'],
        tags: ['cable', 'power cable', 'finolex'],
    },

    // Water Pumps
    {
        categoryName: 'Water Pumps & Motors',
        name: 'Kirloskar Submersible Pump',
        shortDescription: '1 HP submersible pump for borewell applications',
        description: '1 HP submersible pump designed for deep borewell applications with energy-efficient motor.',
        price: 8599,
        originalPrice: 10999,
        discount: 22,
        brand: 'Kirloskar',
        images: ['/uploads/pump-1.jpg'],
        stock: 12,
        isFeatured: true,
        specifications: [
            { key: 'Power', value: '1 HP' },
            { key: 'Head', value: '50 meters' },
            { key: 'Flow Rate', value: '30 LPM' },
            { key: 'Voltage', value: '230V Single Phase' },
        ],
        features: ['Energy Efficient', 'Corrosion Resistant', 'Silent Operation'],
        tags: ['pump', 'submersible', 'kirloskar', 'borewell'],
    },
    {
        categoryName: 'Water Pumps & Motors',
        name: 'Crompton Monoblock Pump',
        shortDescription: '0.5 HP self-priming monoblock pump',
        description: '0.5 HP self-priming monoblock pump suitable for domestic water supply and irrigation.',
        price: 4599,
        originalPrice: 5999,
        discount: 23,
        brand: 'Crompton',
        images: ['/uploads/pump-2.jpg'],
        stock: 18,
        specifications: [
            { key: 'Power', value: '0.5 HP' },
            { key: 'Max Head', value: '25 meters' },
            { key: 'Flow Rate', value: '40 LPM' },
            { key: 'Type', value: 'Self Priming' },
        ],
        features: ['Self Priming', 'Low Maintenance', 'Compact Design'],
        tags: ['pump', 'monoblock', 'crompton'],
    },

    // Switches
    {
        categoryName: 'Switches & Accessories',
        name: 'Anchor Switches Set',
        shortDescription: 'Premium modular switch set',
        description: 'Premium modular switch set with elegant design and superior quality.',
        price: 1299,
        originalPrice: 1799,
        discount: 28,
        brand: 'Anchor',
        images: ['/uploads/switch-1.jpg'],
        stock: 55,
        specifications: [
            { key: 'Type', value: 'Modular' },
            { key: 'Color', value: 'White' },
            { key: 'Rating', value: '16A' },
            { key: 'Module', value: '2 Module' },
        ],
        features: ['ISI Certified', 'Elegant Design', 'Durable'],
        tags: ['switch', 'modular', 'anchor'],
    },

    // Electronics
    {
        categoryName: 'Electronics',
        name: 'LED Bulb 9W',
        shortDescription: 'Energy-saving LED bulb',
        description: 'Energy-saving LED bulb with long lifespan and bright illumination.',
        price: 149,
        originalPrice: 249,
        discount: 40,
        brand: 'Philips',
        images: ['/uploads/led-1.jpg'],
        stock: 150,
        isFeatured: false,
        specifications: [
            { key: 'Wattage', value: '9W' },
            { key: 'Lumens', value: '900 lm' },
            { key: 'Color Temperature', value: '6500K' },
            { key: 'Base Type', value: 'B22' },
        ],
        features: ['Energy Efficient', 'Long Life', 'Instant Brightness'],
        tags: ['led', 'bulb', 'philips', 'energy saver'],
    },

    // Power Backup
    {
        categoryName: 'Power Backup & Power Supply',
        name: 'Luminous Inverter 900VA',
        shortDescription: 'Sine wave home UPS inverter',
        description: 'Pure sine wave home UPS inverter for reliable power backup during outages.',
        price: 6999,
        originalPrice: 8999,
        discount: 22,
        brand: 'Luminous',
        images: ['/uploads/inverter-1.jpg'],
        stock: 15,
        isFeatured: true,
        specifications: [
            { key: 'Capacity', value: '900VA' },
            { key: 'Wave Type', value: 'Pure Sine Wave' },
            { key: 'Battery', value: '150Ah Compatible' },
            { key: 'Warranty', value: '2 Years' },
        ],
        features: ['Pure Sine Wave', 'Overload Protection', 'LED Display'],
        tags: ['inverter', 'ups', 'luminous', 'power backup'],
    },
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();

        console.log('Existing data cleared');

        // Create users one by one to trigger pre-save hook for password hashing
        const createdUsers = [];
        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
        }
        console.log(`${createdUsers.length} users created`);

        // Create categories
        const createdCategories = await Category.create(categories);
        console.log(`${createdCategories.length} categories created`);

        // Create products with category references
        const productsWithCategories = products.map((product) => {
            const category = createdCategories.find((cat) => cat.name === product.categoryName);
            const { categoryName, ...productData } = product;
            return {
                ...productData,
                category: category._id,
            };
        });

        const createdProducts = await Product.create(productsWithCategories);
        console.log(`${createdProducts.length} products created`);

        console.log('\nDatabase seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('Admin: arunum.24mca@kongu.edu / Arun@2003');
        console.log('User: user@example.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
