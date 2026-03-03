import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiTag, FiAward, FiGrid } from 'react-icons/fi';

const CategoryNav = () => {
    const navItems = [
        { path: '/products', icon: <FiGrid size={16} />, label: 'All Products', emoji: '🔌' },
        { path: '/products?filter=bestseller', icon: <FiStar size={16} />, label: 'Best Seller', emoji: '🏆' },
        { path: '/products?filter=lowcost', icon: <FiTag size={16} />, label: 'Products at Low Cost', emoji: '💰' },
        { path: '/products?filter=featured', icon: <FiAward size={16} />, label: 'Featured Products', emoji: '⭐' }
    ];

    return (
        <nav className="category-nav">
            <div className="container">
                <ul className="category-nav-list" style={{ justifyContent: 'center' }}>
                    {navItems.map((item, index) => (
                        <li key={index} className="category-nav-item">
                            <Link to={item.path} onClick={() => window.scrollTo(0, 0)}>
                                <span>{item.emoji}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default CategoryNav;
