import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiCpu, FiZap, FiTool, FiHome, FiMonitor, FiWifi,
    FiBattery, FiSun, FiDroplet, FiWind, FiLock, FiCamera
} from 'react-icons/fi';
import api from '../../utils/api';
import './CategoryGrid.css';

const iconMap = {
    'wiring': <FiZap />,
    'cables': <FiZap />,
    'smart': <FiCpu />,
    'tools': <FiTool />,
    'automation': <FiHome />,
    'lighting': <FiSun />,
    'security': <FiLock />,
    'networking': <FiWifi />,
    'power': <FiBattery />,
    'cctv': <FiCamera />,
    'camera': <FiCamera />,
    'climate': <FiWind />,
    'plumbing': <FiDroplet />,
    'display': <FiMonitor />,
    'fan': <FiWind />,
    'switch': <FiCpu />,
    'wire': <FiZap />,
    'pump': <FiDroplet />,
    'electronic': <FiCpu />,
};

const colorPalette = [
    '#ff9900', '#146eb4', '#067d62', '#c7511f', '#f08804', '#8b5cf6',
    '#06b6d4', '#ec4899', '#10b981', '#3b82f6', '#14b8a6', '#f59e0b',
];

const getIconForCategory = (name) => {
    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key)) return icon;
    }
    return <FiCpu />;
};

const CategoryGrid = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <section className="category-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Shop by Category</h2>
                    <p className="section-description">
                        Explore our wide range of electrical and hardware products
                    </p>
                </div>

                <div className="category-grid">
                    {categories.map((cat, index) => (
                        <Link
                            key={cat._id}
                            to={`/products?category=${encodeURIComponent(cat.name)}`}
                            className="category-card animate-fade-in-up"
                            onClick={() => window.scrollTo(0, 0)}
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                '--category-color': colorPalette[index % colorPalette.length]
                            }}
                        >
                            <div className="category-icon" style={{ background: colorPalette[index % colorPalette.length] }}>
                                {getIconForCategory(cat.name)}
                            </div>
                            <h3 className="category-name">{cat.name}</h3>
                            <div className="category-arrow">→</div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
