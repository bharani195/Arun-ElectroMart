import React, { useState, useEffect } from 'react';
import toast from '../../utils/toast';
import {
    FiBell, FiPlus, FiTrash2, FiInfo, FiTag, FiAlertTriangle,
    FiRefreshCw, FiMail, FiPercent, FiStar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { useConfirm } from '../../components/common/ConfirmDialog';
import './admin.css';

const typeConfig = {
    info: { label: 'Info', bg: '#DBEAFE', color: '#1E40AF', icon: FiInfo },
    offer: { label: 'Offer', bg: '#D1FAE5', color: '#065F46', icon: FiTag },
    alert: { label: 'Alert', bg: '#FEF3C7', color: '#92400E', icon: FiAlertTriangle },
    update: { label: 'Update', bg: '#EDE9FE', color: '#5B21B6', icon: FiRefreshCw },
    product_spotlight: { label: 'Product Spotlight', bg: '#FFF7ED', color: '#C2410C', icon: FiStar },
    discount_offer: { label: 'Discount Offer', bg: '#FEF2F2', color: '#DC2626', icon: FiPercent },
};

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const confirm = useConfirm();

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm('Do you really want to delete this notification? This action cannot be undone.', { title: 'Delete Notification', confirmText: 'Delete' });
        if (!ok) return;
        try {
            await api.delete(`/admin/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            toast.error('Error deleting notification');
        }
    };

    const formatTime = (d) => {
        const diff = Date.now() - new Date(d);
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <AdminLayout activePage="notifications">
                <div className="admin-loading" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="notifications">
            <div className="drb-dashboard">
                <div className="drb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="drb-title">Notifications</h1>
                        <p className="drb-subtitle">Send notifications & email campaigns to your customers</p>
                    </div>
                    <button className="rpt-btn rpt-btn-primary" onClick={() => navigate('/admin/notifications/create')}>
                        <FiPlus size={16} /> New Notification
                    </button>
                </div>

                {notifications.length === 0 ? (
                    <div className="drb-card">
                        <div className="admin-empty-state">
                            <FiBell size={48} />
                            <h2>No Notifications</h2>
                            <p>Create your first notification to reach customers</p>
                        </div>
                    </div>
                ) : (
                    <div className="notif-list">
                        {notifications.map(n => {
                            const cfg = typeConfig[n.type] || typeConfig.info;
                            const Icon = cfg.icon;
                            return (
                                <div key={n._id} className="notif-card">
                                    <div className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-top">
                                            <h4 className="notif-title">{n.title}</h4>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span className="drb-status-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                                {n.sendEmail && (
                                                    <span className="drb-status-pill" style={{
                                                        background: n.emailStatus === 'sent' ? '#D1FAE5' : n.emailStatus === 'sending' ? '#FEF3C7' : n.emailStatus === 'failed' ? '#FEE2E2' : '#F3F4F6',
                                                        color: n.emailStatus === 'sent' ? '#065F46' : n.emailStatus === 'sending' ? '#92400E' : n.emailStatus === 'failed' ? '#991B1B' : '#6B7280',
                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        <FiMail size={11} />
                                                        {n.emailStatus === 'sent' ? `Sent to ${n.emailsSent}` :
                                                            n.emailStatus === 'sending' ? 'Sending...' :
                                                                n.emailStatus === 'failed' ? 'Failed' : 'Pending'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="notif-message">{n.message}</p>

                                        {/* Product info if linked */}
                                        {n.product && (
                                            <div className="notif-product-pill">
                                                {n.product.images?.[0] && (
                                                    <img src={n.product.images[0]} alt="" className="notif-product-img" />
                                                )}
                                                <span className="notif-product-name">{n.product.name}</span>
                                                {n.discountPercent > 0 && (
                                                    <span className="notif-discount-badge">-{n.discountPercent}%</span>
                                                )}
                                                {n.discountCode && (
                                                    <code className="notif-coupon-code">{n.discountCode}</code>
                                                )}
                                            </div>
                                        )}

                                        <span className="notif-meta">
                                            By {n.createdBy?.name || 'Admin'} · {formatTime(n.createdAt)} · Target: {
                                                n.targetAudience === 'category_buyers'
                                                    ? `${n.targetCategory?.name || 'Category'} Buyers`
                                                    : n.targetAudience === 'customers' ? 'Customers' : 'All Users'
                                            }
                                        </span>
                                    </div>
                                    <button className="cat-action-btn delete" onClick={() => handleDelete(n._id)} title="Delete">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
