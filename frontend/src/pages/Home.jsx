import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight, FiTruck, FiShield, FiCreditCard, FiRefreshCw, FiStar, FiZap } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import HeroCarousel from '../components/common/HeroCarousel';
import CategoryGrid from '../components/common/CategoryGrid';
import FloatingBackground from '../components/common/FloatingBackground';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const features = [
        { icon: <FiTruck size={24} />, title: 'Free Delivery', desc: 'On orders above ₹500' },
        { icon: <FiShield size={24} />, title: '2 Year Warranty', desc: 'On all products' },
        { icon: <FiCreditCard size={24} />, title: 'Secure Payment', desc: '100% Protected' },
        { icon: <FiRefreshCw size={24} />, title: 'Easy Returns', desc: '7-day return policy' },
    ];

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const { data } = await api.get('/products/featured');
                setFeaturedProducts(data);
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {/* Floating Background Effects */}
            <FloatingBackground />

            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Category Grid */}
            <CategoryGrid />



            {/* Featured Products Section */}
            <section className="section" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.03) 100%)' }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-8)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-4)'
                    }}>
                        <div>
                            <div className="hero-badge" style={{
                                display: 'inline-flex',
                                marginBottom: 'var(--space-2)',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FiZap size={14} /> FEATURED
                            </div>
                            <h2 className="section-title" style={{
                                background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: 'var(--space-2)'
                            }}>
                                Trending Products
                            </h2>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                                Handpicked selection of our best electrical products
                            </p>
                        </div>
                        <Link to="/products" className="btn btn-secondary">
                            View All <FiArrowRight />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 'var(--space-16)',
                            minHeight: '400px'
                        }}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="glass-card" style={{
                            textAlign: 'center',
                            padding: 'var(--space-16)',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                            border: '2px dashed var(--border-light)',
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 'var(--space-4)'
                        }}>
                            <FiStar size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                            <div>
                                <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                                    No Featured Products Yet
                                </h3>
                                <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                                    Add products via Admin Panel and mark them as Featured to display here
                                </p>
                                <Link to="/products" className="btn btn-primary">
                                    Browse All Products
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            {/* Left Arrow */}
                            {featuredProducts.length > 4 && (
                                <button
                                    onClick={() => {
                                        const container = document.getElementById('trending-carousel');
                                        if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: '-20px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        color: 'var(--text-primary)'
                                    }}
                                    aria-label="Scroll left"
                                >
                                    ‹
                                </button>
                            )}

                            <div
                                id="trending-carousel"
                                className="featured-products-grid"
                                style={{
                                    animation: 'fadeIn 0.5s ease-in'
                                }}
                            >
                                {featuredProducts.slice(0, 4).map((product, index) => (
                                    <div
                                        key={product._id}
                                        style={{
                                            animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            {/* Right Arrow */}
                            {featuredProducts.length > 4 && (
                                <button
                                    onClick={() => {
                                        const container = document.getElementById('trending-carousel');
                                        if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '-20px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        color: 'var(--text-primary)'
                                    }}
                                    aria-label="Scroll right"
                                >
                                    ›
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="section">
                <div className="container">
                    <div
                        className="glass-card"
                        style={{
                            textAlign: 'center',
                            padding: 'var(--space-16)',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
                                Ready to Upgrade Your Space?
                            </h2>
                            <p className="section-description" style={{ marginBottom: 'var(--space-8)' }}>
                                Join thousands of satisfied customers and experience the AbhiElectromart difference
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/register" className="btn btn-primary">
                                    Create Account
                                </Link>
                                <Link to="/products" className="btn btn-secondary">
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
