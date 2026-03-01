import React, { useState, useEffect } from 'react';
import { FiBell, FiPlus, FiTrash2, FiX, FiInfo, FiTag, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css';

const typeConfig = {
    info: { label: 'Info', bg: '#DBEAFE', color: '#1E40AF', icon: FiInfo },
    offer: { label: 'Offer', bg: '#D1FAE5', color: '#065F46', icon: FiTag },
    alert: { label: 'Alert', bg: '#FEF3C7', color: '#92400E', icon: FiAlertTriangle },
    update: { label: 'Update', bg: '#EDE9FE', color: '#5B21B6', icon: FiRefreshCw },
};

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'info', targetAudience: 'all' });
    const [saving, setSaving] = useState(false);

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

    const handleCreate = async () => {
        if (!form.title.trim() || !form.message.trim()) return alert('Title and message are required');
        try {
            setSaving(true);
            await api.post('/admin/notifications', form);
            setShowModal(false);
            setForm({ title: '', message: '', type: 'info', targetAudience: 'all' });
            fetchNotifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating notification');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            await api.delete(`/admin/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            alert('Error deleting notification');
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
                        <p className="drb-subtitle">Send notifications to your customers</p>
                    </div>
                    <button className="rpt-btn rpt-btn-primary" onClick={() => setShowModal(true)}>
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
                                            <span className="drb-status-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                        </div>
                                        <p className="notif-message">{n.message}</p>
                                        <span className="notif-meta">
                                            By {n.createdBy?.name || 'Admin'} · {formatTime(n.createdAt)} · Target: {n.targetAudience}
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

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h3>New Notification</h3>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX size={18} /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. New Year Sale!" className="rpt-input" style={{ width: '100%' }} />
                            </div>
                            <div className="admin-form-group">
                                <label>Message *</label>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                    placeholder="Write your notification message..." className="rpt-input" rows={4}
                                    style={{ width: '100%', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="admin-form-group" style={{ flex: 1 }}>
                                    <label>Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="rpt-input" style={{ width: '100%' }}>
                                        <option value="info">Info</option>
                                        <option value="offer">Offer</option>
                                        <option value="alert">Alert</option>
                                        <option value="update">Update</option>
                                    </select>
                                </div>
                                <div className="admin-form-group" style={{ flex: 1 }}>
                                    <label>Target Audience</label>
                                    <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}
                                        className="rpt-input" style={{ width: '100%' }}>
                                        <option value="all">All Users</option>
                                        <option value="customers">Customers Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="rpt-btn" style={{ background: '#F3F4F6', color: '#374151' }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="rpt-btn rpt-btn-primary" onClick={handleCreate} disabled={saving}>
                                {saving ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminNotifications;
