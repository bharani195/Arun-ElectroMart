import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const { cartItemsCount } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-inner">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <img src="/logo.jpg" alt="AbhiElectromart" style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                        AbhiElectromart
                    </Link>

                    {/* Search Bar */}
                    <div className="search-container">
                        <form onSubmit={handleSearch} className="search-bar">
                            <FiSearch size={18} style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search for products, brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-btn">
                                <FiSearch size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Header Actions */}
                    <div className="header-actions">
                        <Link to="/wishlist" className="header-icon-btn" title="Wishlist" style={{ position: 'relative' }}>
                            <FiHeart size={20} style={wishlist.length > 0 ? { fill: '#e74c3c', color: '#e74c3c' } : {}} />
                            {wishlist.length > 0 && (
                                <span className="cart-badge" style={{ background: '#e74c3c', boxShadow: '0 0 8px rgba(231, 76, 60, 0.6)' }}>{wishlist.length}</span>
                            )}
                        </Link>

                        <Link to="/cart" className="header-icon-btn" title="Cart">
                            <FiShoppingCart size={20} />
                            {cartItemsCount > 0 && (
                                <span className="cart-badge">{cartItemsCount}</span>
                            )}
                        </Link>

                        {user ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="header-icon-btn"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    style={{
                                        background: isProfileOpen ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                                        color: isProfileOpen ? 'white' : 'var(--text-secondary)'
                                    }}
                                >
                                    <FiUser size={20} />
                                </button>

                                {isProfileOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 12px)',
                                            right: 0,
                                            width: '240px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: 'var(--space-4)',
                                            zIndex: 1000,
                                            boxShadow: 'var(--glow-primary)'
                                        }}
                                    >
                                        <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-glass)', marginBottom: 'var(--space-2)' }}>
                                            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{user.email}</p>
                                        </div>

                                        <Link
                                            to="/orders"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-secondary)',
                                                transition: 'var(--transition-fast)'
                                            }}
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <FiPackage size={18} />
                                            My Orders
                                        </Link>

                                        <Link
                                            to="/profile"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-secondary)',
                                                transition: 'var(--transition-fast)'
                                            }}
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <FiSettings size={18} />
                                            Settings
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-3)',
                                                    padding: 'var(--space-3)',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: 'var(--neon-purple)',
                                                    transition: 'var(--transition-fast)'
                                                }}
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                ⚡ Admin Panel
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                padding: 'var(--space-3)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--neon-pink)',
                                                width: '100%',
                                                marginTop: 'var(--space-2)',
                                                borderTop: '1px solid var(--border-glass)',
                                                paddingTop: 'var(--space-4)',
                                                transition: 'var(--transition-fast)'
                                            }}
                                        >
                                            <FiLogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-5)' }}>
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="header-icon-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{ display: 'none' }}
                        >
                            {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
