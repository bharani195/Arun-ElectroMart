import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="logo" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>
                            <img src="/logo.jpg" alt="AbhiElectromart" style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                            AbhiElectromart
                        </Link>
                        <p>
                            Your trusted destination for premium electrical products.
                            Quality, innovation, and reliability in every product we deliver.
                        </p>
                        <div className="footer-socials">
                            <a href="#" onClick={e => e.preventDefault()} aria-label="Facebook"><FiFacebook size={18} /></a>
                            <a href="#" onClick={e => e.preventDefault()} aria-label="Twitter"><FiTwitter size={18} /></a>
                            <a href="#" onClick={e => e.preventDefault()} aria-label="Instagram"><FiInstagram size={18} /></a>
                            <a href="#" onClick={e => e.preventDefault()} aria-label="LinkedIn"><FiLinkedin size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/products?featured=true">Featured</Link></li>
                            <li><Link to="/products?sort=newest">New Arrivals</Link></li>
                            <li><Link to="/products?sale=true">Best Deals</Link></li>
                            <li><Link to="/support">Help & Support</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-section">
                        <h4>Categories</h4>
                        <ul className="footer-links">
                            <li><Link to="/products?category=electronics">Electronics</Link></li>
                            <li><Link to="/products?category=fans">Fans & Cooling</Link></li>
                            <li><Link to="/products?category=wires">Wires & Cables</Link></li>
                            <li><Link to="/products?category=pumps">Water Pumps</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <ul className="footer-links">
                            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FiMapPin size={14} style={{ color: 'var(--neon-purple)', flexShrink: 0 }} />
                                Kavindapadi, Erode - 638455
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FiPhone size={14} style={{ color: 'var(--neon-purple)', flexShrink: 0 }} />
                                +91 6379777230
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FiMail size={14} style={{ color: 'var(--neon-purple)', flexShrink: 0 }} />
                                arunum.24mca@kongu.edu
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-8)',
                        marginBottom: 'var(--space-8)',
                        flexWrap: 'wrap'
                    }}
                >
                    <div>
                        <h4 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                            Subscribe to our Newsletter
                        </h4>
                        <p style={{ color: 'var(--text-tertiary)' }}>
                            Get the latest updates on new products and offers
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, maxWidth: '400px' }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="form-input"
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-primary" style={{ flexShrink: 0 }}>
                            <FiArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <p>© 2026 AbhiElectromart. All rights reserved. Made with ⚡ in India</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
