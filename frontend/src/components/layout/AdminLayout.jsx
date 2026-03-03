import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingCart, FiUsers, FiActivity, FiLogOut, FiFileText, FiLayers, FiBell, FiMessageSquare } from 'react-icons/fi';
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

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    // Auto-detect active page from URL if not provided
    const currentPage = activePage || (() => {
        const path = location.pathname;
        if (path === '/admin') return 'dashboard';
        const match = path.match(/\/admin\/(\w+)/);
        return match ? match[1] : 'dashboard';
    })();

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
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
