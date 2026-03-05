import React, { useState, useEffect } from 'react';
import toast from '../../utils/toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiGrid, FiSearch, FiTag, FiCalendar, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { useConfirm } from '../../components/common/ConfirmDialog';
import './admin.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const confirm = useConfirm();

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
        if (!form.name.trim()) return toast.warn('Category name is required');
        try {
            setSaving(true);
            if (editing) {
                await api.put(`/categories/${editing._id}`, form);
                toast.success('Category updated successfully!');
            } else {
                await api.post('/categories', form);
                toast.success('Category created successfully!');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm('Do you really want to delete this category? Products in this category may lose their category.', { title: 'Delete Category', confirmText: 'Delete' });
        if (!ok) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted!');
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting category');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = categories.filter(c => c.isActive).length;

    if (loading) {
        return (
            <AdminLayout activePage="categories">
                <div className="admin-loading" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="categories">
            <div className="cat-page">
                {/* Header */}
                <div className="cat-header">
                    <div>
                        <h1 className="cat-title">Categories</h1>
                        <p className="cat-subtitle">Manage your product categories</p>
                    </div>
                    <button className="cat-add-btn" onClick={openAdd}>
                        <FiPlus size={16} /> Add Category
                    </button>
                </div>

                {/* Stats */}
                <div className="cat-stats-row">
                    <div className="cat-stat-chip">
                        <FiGrid size={14} />
                        <span><strong>{categories.length}</strong> Total</span>
                    </div>
                    <div className="cat-stat-chip cat-stat-chip-active">
                        <FiToggleRight size={14} />
                        <span><strong>{activeCount}</strong> Active</span>
                    </div>
                    <div className="cat-stat-chip cat-stat-chip-inactive">
                        <FiToggleRight size={14} style={{ transform: 'scaleX(-1)' }} />
                        <span><strong>{categories.length - activeCount}</strong> Inactive</span>
                    </div>
                </div>

                {/* Search */}
                {categories.length > 0 && (
                    <div className="cat-search-bar">
                        <FiSearch size={15} className="cat-search-icon" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="cat-search-input"
                        />
                    </div>
                )}

                {/* Table */}
                {filteredCategories.length === 0 ? (
                    <div className="cat-empty">
                        <div className="cat-empty-icon">
                            <FiGrid size={32} />
                        </div>
                        <h3>{searchQuery ? 'No matching categories' : 'No categories yet'}</h3>
                        <p>{searchQuery ? 'Try a different search term' : 'Create your first category to get started'}</p>
                        {!searchQuery && (
                            <button className="cat-add-btn" onClick={openAdd} style={{ marginTop: 16 }}>
                                <FiPlus size={16} /> Add Category
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="cat-table-card">
                        {/* Table Header */}
                        <div className="cat-table-header">
                            <span className="cat-th cat-th-num">#</span>
                            <span className="cat-th cat-th-name">Category</span>
                            <span className="cat-th cat-th-slug">Slug</span>
                            <span className="cat-th cat-th-status">Status</span>
                            <span className="cat-th cat-th-date">Created</span>
                            <span className="cat-th cat-th-actions">Actions</span>
                        </div>
                        {/* Table Body */}
                        <div className="cat-table-body">
                            {filteredCategories.map((cat, i) => (
                                <div key={cat._id} className="cat-row">
                                    <span className="cat-cell cat-cell-num">{i + 1}</span>
                                    <div className="cat-cell cat-cell-name">
                                        <div className="cat-row-icon">
                                            <FiTag size={16} />
                                        </div>
                                        <div className="cat-row-info">
                                            <h4 className="cat-row-name">{cat.name}</h4>
                                            <p className="cat-row-desc">{cat.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <span className="cat-cell cat-cell-slug">
                                        <code className="cat-slug-code">{cat.slug}</code>
                                    </span>
                                    <span className="cat-cell cat-cell-status">
                                        <span className="cat-status-badge" data-active={cat.isActive}>
                                            <span className="cat-status-dot"></span>
                                            {cat.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </span>
                                    <span className="cat-cell cat-cell-date">
                                        <FiCalendar size={12} />
                                        {new Date(cat.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </span>
                                    <div className="cat-cell cat-cell-actions">
                                        <button className="cat-icon-btn cat-icon-btn-edit" onClick={() => openEdit(cat)} title="Edit">
                                            <FiEdit2 size={13} />
                                        </button>
                                        <button className="cat-icon-btn cat-icon-btn-danger" onClick={() => handleDelete(cat._id)} title="Delete">
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Table Footer */}
                        <div className="cat-table-footer">
                            <span>Showing {filteredCategories.length} of {categories.length} categories</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="cat-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="cat-modal" onClick={e => e.stopPropagation()}>
                        <div className="cat-modal-header">
                            <div className="cat-modal-header-left">
                                <div className="cat-modal-icon">
                                    <FiTag size={18} />
                                </div>
                                <h3 className="cat-modal-title">{editing ? 'Edit Category' : 'New Category'}</h3>
                            </div>
                            <button className="cat-modal-close" onClick={() => setShowModal(false)}>
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="cat-modal-body">
                            <div className="cat-form-group">
                                <label className="cat-form-label">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Electronics"
                                    className="cat-form-input"
                                    autoFocus
                                />
                            </div>
                            <div className="cat-form-group">
                                <label className="cat-form-label">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Optional description"
                                    className="cat-form-input cat-form-textarea"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="cat-modal-footer">
                            <button className="cat-modal-btn cat-modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="cat-modal-btn cat-modal-btn-save" onClick={handleSave} disabled={saving}>
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
