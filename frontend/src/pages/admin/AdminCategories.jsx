import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return alert('Category name is required');
        try {
            setSaving(true);
            if (editing) {
                await api.put(`/categories/${editing._id}`, form);
            } else {
                await api.post('/categories', form);
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category? Products in this category may lose their category.')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting category');
        }
    };

    if (loading) {
        return (
            <AdminLayout activePage="categories">
                <div className="admin-loading" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="categories">
            <div className="drb-dashboard">
                <div className="drb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="drb-title">Categories</h1>
                        <p className="drb-subtitle">Manage product categories</p>
                    </div>
                    <button className="rpt-btn rpt-btn-primary" onClick={openAdd}>
                        <FiPlus size={16} /> Add Category
                    </button>
                </div>

                <div className="drb-card">
                    {categories.length === 0 ? (
                        <div className="admin-empty-state">
                            <FiGrid size={48} />
                            <h2>No Categories</h2>
                            <p>Create your first product category</p>
                        </div>
                    ) : (
                        <table className="drb-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat, i) => (
                                    <tr key={cat._id}>
                                        <td style={{ color: '#9CA3AF' }}>{i + 1}</td>
                                        <td className="drb-table-bold">{cat.name}</td>
                                        <td className="drb-table-mono" style={{ fontSize: '11px' }}>{cat.slug}</td>
                                        <td className="drb-table-muted">{cat.description || '—'}</td>
                                        <td>
                                            <span className="drb-status-pill" style={{
                                                background: cat.isActive ? '#D1FAE5' : '#FEE2E2',
                                                color: cat.isActive ? '#065F46' : '#991B1B'
                                            }}>
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="drb-table-muted">
                                            {new Date(cat.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="cat-action-btn edit" onClick={() => openEdit(cat)} title="Edit">
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button className="cat-action-btn delete" onClick={() => handleDelete(cat._id)} title="Delete">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-head">
                            <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX size={18} /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Electronics"
                                    className="rpt-input"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Optional description"
                                    className="rpt-input"
                                    rows={3}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="rpt-btn" style={{ background: '#F3F4F6', color: '#374151' }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="rpt-btn rpt-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminCategories;
