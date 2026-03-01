import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiCpu, FiZap, FiTool, FiHome, FiMonitor, FiWifi,
    FiBattery, FiSun, FiDroplet, FiWind, FiLock, FiCamera
} from 'react-icons/fi';
import './CategoryGrid.css';

const CategoryGrid = () => {
    const categories = [
        { id: 1, name: 'Wiring & Cables', icon: <FiZap />, link: '/products?category=wiring', color: '#ff9900' },
        { id: 2, name: 'Smart Devices', icon: <FiCpu />, link: '/products?category=smart', color: '#146eb4' },
        { id: 3, name: 'Tools & Equipment', icon: <FiTool />, link: '/products?category=tools', color: '#067d62' },
        { id: 4, name: 'Home Automation', icon: <FiHome />, link: '/products?category=automation', color: '#c7511f' },
        { id: 5, name: 'Lighting', icon: <FiSun />, link: '/products?category=lighting', color: '#f08804' },
        { id: 6, name: 'Security Systems', icon: <FiLock />, link: '/products?category=security', color: '#8b5cf6' },
        { id: 7, name: 'Networking', icon: <FiWifi />, link: '/products?category=networking', color: '#06b6d4' },
        { id: 8, name: 'Power Solutions', icon: <FiBattery />, link: '/products?category=power', color: '#ec4899' },
        { id: 9, name: 'CCTV & Cameras', icon: <FiCamera />, link: '/products?category=cctv', color: '#10b981' },
        { id: 10, name: 'Climate Control', icon: <FiWind />, link: '/products?category=climate', color: '#3b82f6' },
        { id: 11, name: 'Plumbing', icon: <FiDroplet />, link: '/products?category=plumbing', color: '#14b8a6' },
        { id: 12, name: 'Displays', icon: <FiMonitor />, link: '/products?category=displays', color: '#f59e0b' },
    ];

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
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            to={category.link}
                            className="category-card animate-fade-in-up"
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                '--category-color': category.color
                            }}
                        >
                            <div className="category-icon" style={{ background: category.color }}>
                                {category.icon}
                            </div>
                            <h3 className="category-name">{category.name}</h3>
                            <div className="category-arrow">→</div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
