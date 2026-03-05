import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiMenu, FiX, FiLogOut, FiPackage, FiSettings, FiHome, FiGrid, FiStar, FiTag, FiZap } from 'react-icons/fi';
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

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${searchQuery}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="header">
                <div className="container">
                    <div className="header-inner">
                        {/* Logo */}
                        <Link to="/" className="logo">
                            <img src="/logo.jpg" alt="AbhiElectromart" style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                            AbhiElectromart
                        </Link>

                        {/* Search Bar - Desktop */}
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

                        {/* Header Actions - Desktop */}
                        <div className="header-actions header-desktop-actions">
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

                                            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }} onClick={() => setIsProfileOpen(false)}>
                                                <FiPackage size={18} /> My Orders
                                            </Link>

                                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }} onClick={() => setIsProfileOpen(false)}>
                                                <FiSettings size={18} /> Settings
                                            </Link>

                                            {user.role === 'admin' && (
                                                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--neon-purple)', transition: 'var(--transition-fast)' }} onClick={() => setIsProfileOpen(false)}>
                                                    ⚡ Admin Panel
                                                </Link>
                                            )}

                                            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--neon-pink)', width: '100%', marginTop: 'var(--space-2)', borderTop: '1px solid var(--border-glass)', paddingTop: 'var(--space-4)', transition: 'var(--transition-fast)' }}>
                                                <FiLogOut size={18} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-5)' }}>
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="header-icon-btn mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div
                className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />
            <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-nav-header">
                    <Link to="/" className="logo" onClick={closeMobileMenu} style={{ fontSize: 'var(--text-lg)' }}>
                        <img src="/logo.jpg" alt="AbhiElectromart" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                        AbhiElectromart
                    </Link>
                    <button className="mobile-nav-close" onClick={closeMobileMenu}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="mobile-nav-search">
                    <form onSubmit={handleSearch} className="search-bar">
                        <FiSearch size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-btn">
                            <FiSearch size={16} />
                        </button>
                    </form>
                </div>

                {/* Mobile Nav Links */}
                <ul className="mobile-nav-links">
                    <li>
                        <Link to="/" onClick={closeMobileMenu}>
                            <FiHome size={20} /> Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/products" onClick={closeMobileMenu}>
                            <FiGrid size={20} /> All Products
                        </Link>
                    </li>
                    <li>
                        <Link to="/products?filter=bestseller" onClick={closeMobileMenu}>
                            <FiStar size={20} /> Best Sellers
                        </Link>
                    </li>
                    <li>
                        <Link to="/products?filter=lowcost" onClick={closeMobileMenu}>
                            <FiTag size={20} /> Low Cost Products
                        </Link>
                    </li>
                    <li>
                        <Link to="/products?filter=featured" onClick={closeMobileMenu}>
                            <FiZap size={20} /> Featured
                        </Link>
                    </li>
                    <li>
                        <Link to="/wishlist" onClick={closeMobileMenu}>
                            <FiHeart size={20} /> Wishlist
                            {wishlist.length > 0 && <span className="mobile-nav-badge">{wishlist.length}</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/cart" onClick={closeMobileMenu}>
                            <FiShoppingCart size={20} /> Cart
                            {cartItemsCount > 0 && <span className="mobile-nav-badge">{cartItemsCount}</span>}
                        </Link>
                    </li>

                    {user ? (
                        <>
                            <li style={{ borderTop: '2px solid var(--border-light)', marginTop: 'var(--space-2)' }}>
                                <Link to="/orders" onClick={closeMobileMenu}>
                                    <FiPackage size={20} /> My Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" onClick={closeMobileMenu}>
                                    <FiSettings size={20} /> Settings
                                </Link>
                            </li>
                            {user.role === 'admin' && (
                                <li>
                                    <Link to="/admin" onClick={closeMobileMenu}>
                                        ⚡ Admin Panel
                                    </Link>
                                </li>
                            )}
                            <li>
                                <button onClick={handleLogout} style={{ color: 'var(--neon-pink)' }}>
                                    <FiLogOut size={20} /> Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li style={{ padding: 'var(--space-4)' }}>
                            <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu} style={{ width: '100%', justifyContent: 'center' }}>
                                Sign In
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
};

export default Header;
