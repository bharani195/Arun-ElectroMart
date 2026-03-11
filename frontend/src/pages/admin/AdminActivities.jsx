import React, { useState, useEffect } from 'react';
import { FiFilter, FiRefreshCw, FiActivity } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomDropdown from '../../components/common/CustomDropdown';

const AdminActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState('');

    const activityTypes = [
        { value: '', label: 'All Activities' },
        { value: 'user_login', label: 'User Logins' },
        { value: 'user_register', label: 'Registrations' },
        { value: 'product_create', label: 'Product Created' },
        { value: 'product_update', label: 'Product Updated' },
        { value: 'product_delete', label: 'Product Deleted' },
        { value: 'order_placed', label: 'Orders Placed' },
        { value: 'order_updated', label: 'Order Updates' },
        { value: 'cart_add', label: 'Cart Additions' },
        { value: 'cart_remove', label: 'Cart Removals' },
        { value: 'category_create', label: 'Category Created' },
        { value: 'category_update', label: 'Category Updated' },
        { value: 'category_delete', label: 'Category Deleted' },
        { value: 'admin_action', label: 'Admin Actions' }
    ];

    useEffect(() => { fetchActivities(); }, [page, filterType]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 20 });
            if (filterType) params.append('type', filterType);
            const { data } = await api.get(`/admin/activities?${params}`);
            setActivities(data.activities);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            'product_create': '📦', 'product_update': '✏️', 'product_delete': '🗑️',
            'order_placed': '🛒', 'order_updated': '📝', 'user_register': '👤',
            'user_login': '🔑', 'cart_add': '🛍️', 'cart_remove': '❌',
            'admin_action': '⚡', 'category_create': '📁', 'category_update': '📂', 'category_delete': '🗂️'
        };
        return icons[type] || '📝';
    };

    const getActivityColor = (type) => {
        const colors = {
            'product_create': '#0d9488', 'product_update': '#8b7355', 'product_delete': '#dc2626',
            'order_placed': '#d97706', 'user_register': '#7c3aed', 'user_login': '#6b7d8f',
            'cart_add': '#ea580c', 'admin_action': '#d97706'
        };
        return colors[type] || '#6b7280';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AdminLayout activePage="activities">
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Activity Log</h1>
                    <p className="admin-page-subtitle">Monitor all system activities and user actions</p>
                </div>
                <button onClick={fetchActivities} className="admin-btn admin-btn-secondary">
                    <FiRefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
                <FiFilter size={16} color="#9ca3af" />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Filter by:</span>
                <CustomDropdown
                    value={filterType}
                    onChange={(val) => { setFilterType(val); setPage(1); }}
                    options={activityTypes}
                />
            </div>

            {/* Activity List */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading"><div className="loading-spinner"></div></div>
                ) : activities.length > 0 ? (
                    <div>
                        {activities.map((activity, idx) => (
                            <div key={activity._id || idx} className="admin-activity-item">
                                <div className="admin-activity-icon"
                                    style={{ background: `${getActivityColor(activity.type)}12` }}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="admin-activity-content">
                                    <p className="admin-activity-desc">{activity.description}</p>
                                    <div className="admin-activity-meta">
                                        <span>👤 {activity.userName || 'System'}</span>
                                        {activity.userEmail && <span>📧 {activity.userEmail}</span>}
                                        {activity.ipAddress && <span>🌐 {activity.ipAddress}</span>}
                                    </div>
                                </div>
                                <div className="admin-activity-right">
                                    <span className="admin-badge"
                                        style={{
                                            background: `${getActivityColor(activity.type)}12`,
                                            color: getActivityColor(activity.type),
                                            marginBottom: '6px', display: 'inline-block'
                                        }}>
                                        {activity.type?.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                    <p className="admin-activity-time">{formatDate(activity.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="admin-empty-state">
                        <FiActivity size={48} />
                        <p>No activities found</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="admin-pagination">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-pagination-btn">
                            Previous
                        </button>
                        <span className="admin-pagination-info">Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-pagination-btn">
                            Next
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminActivities;
