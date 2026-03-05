import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingCart, FiUsers, FiActivity, FiLogOut, FiFileText, FiLayers, FiBell, FiMessageSquare, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../pages/admin/admin.css';

const navItems = [
    { path: '/admin', label: 'Dashboard', icon: FiGrid, key: 'dashboard' },
    { path: '/admin/products', label: 'Products', icon: FiPackage, key: 'products' },
    { path: '/admin/categories', label: 'Categories', icon: FiLayers, key: 'categories' },
    { path: '/admin/orders', label: 'Orders', icon: FiShoppingCart, key: 'orders' },
    { path: '/admin/reports', label: 'Reports', icon: FiFileText, key: 'reports' },
    { path: '/admin/notifications', label: 'Notifications', icon: FiBell, key: 'notifications' },
    { path: '/admin/support', label: 'Support', icon: FiMessageSquare, key: 'support' },
    { path: '/admin/users', label: 'Users', icon: FiUsers, key: 'users' },
    { path: '/admin/activities', label: 'Activity Log', icon: FiActivity, key: 'activities' },
];

const AdminLayout = ({ children, activePage }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    // Auto-detect active page from URL if not provided
    const currentPage = activePage || (() => {
        const path = location.pathname;
        if (path === '/admin') return 'dashboard';
        const match = path.match(/\/admin\/(\w+)/);
        return match ? match[1] : 'dashboard';
    })();

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <div className="admin-mobile-header">
                <button
                    className="admin-mobile-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
                <Link to="/" className="admin-mobile-logo">
                    <img src="/logo.jpg" alt="ElectroMart" />
                    <span>ElectroMart</span>
                </Link>
                <p className="admin-mobile-badge">Admin</p>
            </div>

            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <Link to="/" className="admin-sidebar-logo">
                    <img src="/logo.jpg" alt="ElectroMart" />
                    <span>ElectroMart</span>
                </Link>
                <p className="admin-sidebar-subtitle">Admin Panel</p>

                {/* Navigation */}
                <nav className="admin-nav">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.key;
                        return (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`admin-nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Sign Out */}
                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="admin-user-name">{user?.name || 'Admin'}</p>
                            <p className="admin-user-role">Administrator</p>
                        </div>
                    </div>
                    <button onClick={handleSignOut} className="admin-signout-btn">
                        <FiLogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
