import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const handleMoveToCart = async (product) => {
        try {
            await addToCart(product._id, 1);
            await removeFromWishlist(product._id);
            // Optional: Show success toast
        } catch (error) {
            console.error('Error moving to cart:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ marginTop: '140px', minHeight: '60vh', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: 'var(--space-16)' }}>
                    <FiHeart size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <h2 style={{ marginBottom: 'var(--space-4)' }}>Please Login</h2>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                        Login to view your wishlist and save your favorite items.
                    </p>
                    <Link to="/login" className="btn btn-primary">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container" style={{ marginTop: '140px', minHeight: '60vh', display: 'flex', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="container" style={{ marginTop: '140px', minHeight: '60vh', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: 'var(--space-16)' }}>
                    <FiHeart size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                    <h2 style={{ marginBottom: 'var(--space-4)' }}>Your Wishlist is Empty</h2>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                        Save items you love here for later.
                    </p>
                    <Link to="/products" className="btn btn-primary">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '140px', minHeight: '80vh', paddingBottom: 'var(--space-16)' }}>
            <div style={{
                marginBottom: 'var(--space-8)',
                background: 'var(--gradient-primary)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-xl)',
                color: 'white',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    <FiArrowLeft /> Back to Shopping
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>My Wishlist</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-full)' }}>
                        <FiHeart size={32} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-8)' }}>
                {wishlist.filter(item => item && item._id).map((product) => (
                    <div key={product._id} className="product-card" style={{
                        position: 'relative',
                        background: 'white',
                        border: '1px solid var(--border-medium)',
                        boxShadow: 'var(--shadow-md)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}>
                        <Link to={`/product/${product._id}`}>
                            <div className="product-image" style={{ background: 'var(--bg-secondary)', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
                                    alt={product.name}
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        </Link>

                        <div className="product-info" style={{ padding: 'var(--space-5)' }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {product.brand}
                            </p>
                            <Link to={`/product/${product._id}`}>
                                <h3 className="product-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)', height: '54px', overflow: 'hidden' }}>{product.name}</h3>
                            </Link>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                <span className="product-price" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--brand-primary)' }}>₹{product.price.toLocaleString()}</span>
                                {product.stock > 0 ? (
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-teal)', background: 'rgba(42, 157, 143, 0.1)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>In Stock</span>
                                ) : (
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-coral)', background: 'rgba(231, 111, 81, 0.1)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>Out of Stock</span>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <button
                                    onClick={() => handleMoveToCart(product)}
                                    className="btn btn-primary"
                                    style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    disabled={product.stock === 0}
                                >
                                    <FiShoppingCart size={16} /> Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="btn"
                                    style={{
                                        fontSize: 'var(--text-sm)',
                                        padding: 'var(--space-2)',
                                        border: '1px solid var(--border-medium)',
                                        color: 'var(--accent-coral)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        background: 'transparent'
                                    }}
                                >
                                    <FiTrash2 size={16} /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
