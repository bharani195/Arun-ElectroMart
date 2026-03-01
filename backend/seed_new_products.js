import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import User from './models/User.js';

dotenv.config();

const products = [
    // Electronics (4 products)
    {
        name: 'Arduino Uno R3',
        description: 'The classic Arduino board. Perfect for beginners and advanced users alike. Microcontroller based on ATmega328P.',
        price: 1850,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1555664424-778a69022365?q=80&w=600&auto=format&fit=crop'],
        stock: 50,
        brand: 'Arduino',
        specifications: [{ key: 'Microcontroller', value: 'ATmega328P' }, { key: 'Operating Voltage', value: '5V' }]
    },
    {
        name: 'Raspberry Pi 4 Model B (4GB)',
        description: 'A powerful single-board computer. Quad-core 64-bit processor, dual-display support, and 4GB RAM.',
        price: 5999,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1629739884942-9692967405dc?q=80&w=600&auto=format&fit=crop'],
        stock: 25,
        brand: 'Raspberry Pi',
        specifications: [{ key: 'RAM', value: '4GB LPDDR4' }, { key: 'Processor', value: 'Quad Core Cortex-A72' }]
    },
    {
        name: 'Digital Multimeter DT-830D',
        description: 'Compact and reliable digital multimeter for measuring voltage, current, and resistance. Essential for every toolbox.',
        price: 350,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600&auto=format&fit=crop'],
        stock: 100,
        brand: 'Generic',
        specifications: [{ key: 'Display', value: 'LCD' }, { key: 'Measurement', value: 'AC/DC Voltage, DC Current, Resistance' }]
    },
    {
        name: 'Soldering Iron Kit 60W',
        description: 'Adjustable temperature soldering iron with 5 tips, stand, and solder wire. Ideal for electronics repairs.',
        price: 850,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1597423245284-954553b47e26?q=80&w=600&auto=format&fit=crop'],
        stock: 40,
        brand: 'Soldron',
        specifications: [{ key: 'Power', value: '60W' }, { key: 'Temp Range', value: '200°C - 450°C' }]
    },

    // Fans (3 products)
    {
        name: 'High Speed Ceiling Fan 1200mm',
        description: 'Elegant design with high air delivery. Rust-free powder coated finish.',
        price: 2499,
        category: 'Fans',
        images: ['https://images.unsplash.com/photo-1618941716939-553df0c690b8?q=80&w=600&auto=format&fit=crop'],
        stock: 30,
        brand: 'Orient',
        specifications: [{ key: 'Sweep', value: '1200mm' }, { key: 'Speed', value: '380 RPM' }]
    },
    {
        name: 'Pedestal Fan with Remote',
        description: 'Adjustable height pedestal fan with remote control and multiple speed settings.',
        price: 3200,
        category: 'Fans',
        images: ['https://images.unsplash.com/photo-1565193566173-033e46121621?q=80&w=600&auto=format&fit=crop'],
        stock: 20,
        brand: 'Usha',
        specifications: [{ key: 'Type', value: 'Pedestal' }, { key: 'Control', value: 'Remote' }]
    },
    {
        name: 'Exhaust Fan Metal 9 Inch',
        description: 'Heavy duty metal exhaust fan for kitchen and bathrooms. High suction power.',
        price: 1500,
        category: 'Fans',
        images: ['https://images.unsplash.com/photo-1517420879524-86d64ac2f339?q=80&w=600&auto=format&fit=crop'],
        stock: 35,
        brand: 'Crompton',
        specifications: [{ key: 'Size', value: '225mm (9 inch)' }, { key: 'Material', value: 'Metal' }]
    },

    // Power Backup & Power Supply (4 products)
    {
        name: 'Luminous Zelio+ 1100 Inverter',
        description: 'Sine wave inverter with LED display. Supports wide range of batteries.',
        price: 6500,
        category: 'Power Backup & Power Supply',
        images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=600&auto=format&fit=crop'],
        stock: 15,
        brand: 'Luminous',
        specifications: [{ key: 'Capacity', value: '900 VA' }, { key: 'Wave Form', value: 'Sine Wave' }]
    },
    {
        name: 'APC BV650-IN UPS',
        description: '650VA / 360W UPS for home and office usage. Protects against power surges.',
        price: 3500,
        category: 'Power Backup & Power Supply',
        images: ['https://images.unsplash.com/photo-1551731409-43c2c1e62688?q=80&w=600&auto=format&fit=crop'],
        stock: 20,
        brand: 'APC',
        specifications: [{ key: 'Output Power', value: '360 Watts' }, { key: 'Runtime', value: '15-20 Mins' }]
    },
    {
        name: '12V 2A Power Adapter',
        description: 'Universal AC to DC power adapter. Ideal for LED strips, routers, and CCTV cameras.',
        price: 250,
        category: 'Power Backup & Power Supply',
        images: ['https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=600&auto=format&fit=crop'],
        stock: 100,
        brand: 'Generic',
        specifications: [{ key: 'Output', value: '12V DC, 2A' }, { key: 'Connector', value: '5.5mm x 2.1mm' }]
    },
    {
        name: 'Exide InvaMaster 150Ah Battery',
        description: 'Tubular battery for inverters. Long life and low maintenance.',
        price: 13500,
        category: 'Power Backup & Power Supply',
        images: ['https://images.unsplash.com/photo-1542816416-5d635a96013a?q=80&w=600&auto=format&fit=crop'],
        stock: 10,
        brand: 'Exide',
        specifications: [{ key: 'Capacity', value: '150 Ah' }, { key: 'Warranty', value: '36 Months' }]
    },

    // Switches & Accessories (3 products)
    {
        name: 'Modular Switch 6A (Set of 10)',
        description: 'White poly-carbonate modular switches. Fire retardant and shock proof.',
        price: 499,
        category: 'Switches & Accessories',
        images: ['https://media.istockphoto.com/id/1141778521/photo/light-switch.jpg?s=612x612&w=0&k=20&c=6SgDsOmpR6wDSD-3suC2Hj12SqpWp-33DnzxH8S3g6s='],
        stock: 100,
        brand: 'Anchor',
        specifications: [{ key: 'Rating', value: '6A' }, { key: 'Type', value: '1 Way' }]
    },
    {
        name: '3 Pin Plug Top 16A',
        description: 'Heavy duty 16A plug top for appliances like heaters and ACs.',
        price: 85,
        category: 'Switches & Accessories',
        images: ['https://media.istockphoto.com/id/175402636/photo/electric-plug.jpg?s=612x612&w=0&k=20&c=7d3a040b286c_539a250320_29b20b20'],
        stock: 150,
        brand: 'Havells',
        specifications: [{ key: 'Rating', value: '16 Amp' }, { key: 'Pins', value: '3 (Brass)' }]
    },
    {
        name: '4 Way Extension Board',
        description: 'Extension board with 4 sockets and individual switches. 2 meter wire.',
        price: 650,
        category: 'Switches & Accessories',
        images: ['https://images.unsplash.com/photo-1563608149-650a30b20755?q=80&w=600&auto=format&fit=crop'],
        stock: 45,
        brand: 'GM',
        specifications: [{ key: 'Sockets', value: '4 Universal' }, { key: 'Wire Length', value: '2 Meters' }]
    },

    // Water Pumps & Motors (3 products)
    {
        name: '0.5 HP Monoblock Water Pump',
        description: 'Self priming monoblock pump for domestic water supply.',
        price: 2800,
        category: 'Water Pumps & Motors',
        images: ['https://media.istockphoto.com/id/903632238/photo/water-pump.jpg?s=612x612&w=0&k=20&c=123-123'],
        stock: 20,
        brand: 'Crompton',
        specifications: [{ key: 'Power', value: '0.5 HP' }, { key: 'Head range', value: '6-21 meters' }]
    },
    {
        name: '1 HP Submersible Pump',
        description: 'Stainless steel submersible pump for borewells. Energy efficient.',
        price: 6500,
        category: 'Water Pumps & Motors',
        images: ['https://images.unsplash.com/photo-1574360789534-19236d85635f?q=80&w=600&auto=format&fit=crop'],
        stock: 15,
        brand: 'Kirloskar',
        specifications: [{ key: 'Power', value: '1 HP' }, { key: 'Discharge', value: '100 LPM' }]
    },
    {
        name: 'Automatic Water Level Controller',
        description: 'Ideally used for overhead tanks. Prevents overflow and saves electricity.',
        price: 950,
        category: 'Water Pumps & Motors',
        images: ['https://media.istockphoto.com/id/116223456/photo/water-meter.jpg?s=612x612&w=0&k=20&c=123'],
        stock: 60,
        brand: 'Generic',
        specifications: [{ key: 'Sensors', value: 'Magnetic Float' }, { key: 'Type', value: 'Fully Automatic' }]
    },

    // Wires & Cables (3 products)
    {
        name: '1.5 sq mm Copper Wire (90m)',
        description: 'PVC insulated multi-strand copper wire. Flame retardant.',
        price: 1800,
        category: 'Wires & Cables',
        images: ['https://media.istockphoto.com/id/172671569/photo/electric-cable.jpg?s=612x612&w=0&k=20&c=123'],
        stock: 80,
        brand: 'Polycab',
        specifications: [{ key: 'Size', value: '1.5 sq mm' }, { key: 'Length', value: '90 Meters' }]
    },
    {
        name: 'CAT6 Ethernet Cable (305m)',
        description: 'High speed LAN cable for internet networking. Supports Gigabit ethernet.',
        price: 5500,
        category: 'Wires & Cables',
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=600&auto=format&fit=crop'],
        stock: 25,
        brand: 'D-Link',
        specifications: [{ key: 'Type', value: 'CAT6 UTP' }, { key: 'Length', value: '305 Meters (Box)' }]
    },
    {
        name: '2.5 sq mm Copper Wire (90m)',
        description: 'Heavy duty house wiring cable. Ideal for AC and power sockets.',
        price: 2900,
        category: 'Wires & Cables',
        images: ['https://media.istockphoto.com/id/172671569/photo/electric-cable.jpg?s=612x612&w=0&k=20&c=123'],
        stock: 60,
        brand: 'Finolex',
        specifications: [{ key: 'Size', value: '2.5 sq mm' }, { key: 'Length', value: '90 Meters' }]
    }
];

const seedProducts = async () => {
    try {
        await connectDB();

        console.log('Clearing existing products...');
        await Product.deleteMany({}); // Warning: This clears all products. Remove if you want to append.

        console.log('Ensuring categories exist...');
        const uniqueCategories = [...new Set(products.map(p => p.category))];

        const categoryMap = {}; // name -> _id

        for (const catName of uniqueCategories) {
            let category = await Category.findOne({ name: catName });
            if (!category) {
                category = await Category.create({
                    name: catName,
                    description: `Products for ${catName}`,
                    image: 'https://via.placeholder.com/150'
                });
                console.log(`Created category: ${catName}`);
            }
            categoryMap[catName] = category._id;
        }

        console.log('Inserting products...');
        const productsWithIds = products.map(product => {
            const slug = product.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/(^_|_$)/g, '') + '-' + Math.floor(Math.random() * 1000);

            return {
                ...product,
                slug, // Explicitly set unique slug
                category: categoryMap[product.category]
            };
        });

        await Product.insertMany(productsWithIds);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedProducts();
