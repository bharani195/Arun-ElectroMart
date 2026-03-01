import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiImage, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', shortDescription: '',
        price: '', originalPrice: '',
        category: '', brand: '', stock: '',
        images: [''],
        isFeatured: false, isBestSeller: false, isLowCost: false, isActive: true
    });

    useEffect(() => {
        fetchCategories();
        if (isEditing) fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                shortDescription: data.shortDescription || '',
                price: data.price || '',
                originalPrice: data.originalPrice || '',
                category: data.category?._id || '',
                brand: data.brand || '',
                stock: data.stock || '',
                images: data.images?.length ? data.images : [''],
                isFeatured: data.isFeatured || false,
                isBestSeller: data.isBestSeller || false,
                isLowCost: data.isLowCost || false,
                isActive: data.isActive !== false
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Error loading product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...formData,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
                stock: Number(formData.stock),
                images: formData.images.filter(img => img.trim() !== '')
            };
            if (isEditing) {
                await api.put(`/products/${id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const addImageField = () => setFormData({ ...formData, images: [...formData.images, ''] });

    const updateImage = (index, value) => {
        const updated = [...formData.images];
        updated[index] = value;
        setFormData({ ...formData, images: updated });
    };

    const removeImage = (index) => {
        if (formData.images.length <= 1) return;
        const updated = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: updated });
    };

    // Calculate discount %
    const discount = formData.price && formData.originalPrice
        ? Math.round((1 - Number(formData.price) / Number(formData.originalPrice)) * 100)
        : 0;

    if (loading) {
        return (
            <AdminLayout activePage="products">
                <div className="admin-loading" style={{ minHeight: '60vh' }}>
                    <div className="loading-spinner"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="products">
            {/* Breadcrumb + Header */}
            <div style={{ marginBottom: '28px' }}>
                <Link to="/admin/products" className="admin-back-link">
                    <FiArrowLeft size={16} />
                    Back to Products
                </Link>
                <h1 className="admin-page-title" style={{ marginTop: '12px' }}>
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="admin-page-subtitle">
                    {isEditing ? 'Update product information and pricing' : 'Fill in the details to add a new product'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="admin-product-form-grid">
                    {/* LEFT COLUMN — Details */}
                    <div className="admin-product-form-left">
                        {/* Basic Info */}
                        <div className="admin-card admin-card-body">
                            <h3 className="admin-form-section-title">Basic Information</h3>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Product Name *</label>
                                <input type="text" className="admin-form-input" value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="Enter product name" required />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Short Description</label>
                                <input type="text" className="admin-form-input" value={formData.shortDescription}
                                    onChange={(e) => updateField('shortDescription', e.target.value)}
                                    placeholder="Brief one-line summary" />
                            </div>
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-form-label">Full Description</label>
                                <textarea className="admin-form-input" rows={5} value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Detailed product description..." />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="admin-card admin-card-body">
                            <h3 className="admin-form-section-title">
                                <FiImage size={16} /> Media
                            </h3>
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="admin-image-input-row">
                                    {img && (
                                        <img src={img} alt="Preview" className="admin-image-preview"
                                            onError={(e) => { e.target.style.display = 'none'; }} />
                                    )}
                                    <input type="text" className="admin-form-input" value={img}
                                        onChange={(e) => updateImage(idx, e.target.value)}
                                        placeholder="https://example.com/image.jpg" />
                                    {formData.images.length > 1 && (
                                        <button type="button" onClick={() => removeImage(idx)}
                                            className="admin-btn-icon danger" style={{ flexShrink: 0 }}>
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addImageField} className="admin-btn admin-btn-secondary"
                                style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                                <FiPlus size={16} /> Add Image URL
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN — Pricing, Category, Settings */}
                    <div className="admin-product-form-right">
                        {/* Pricing */}
                        <div className="admin-card admin-card-body">
                            <h3 className="admin-form-section-title">Pricing</h3>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Selling Price (₹) *</label>
                                <input type="number" className="admin-form-input" value={formData.price}
                                    onChange={(e) => updateField('price', e.target.value)}
                                    placeholder="0.00" min="0" required />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Original Price (₹)</label>
                                <input type="number" className="admin-form-input" value={formData.originalPrice}
                                    onChange={(e) => updateField('originalPrice', e.target.value)}
                                    placeholder="0.00" min="0" />
                            </div>
                            {discount > 0 && (
                                <div className="admin-discount-badge">
                                    {discount}% OFF
                                </div>
                            )}
                        </div>

                        {/* Organization */}
                        <div className="admin-card admin-card-body">
                            <h3 className="admin-form-section-title">Organization</h3>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Category *</label>
                                <select className="admin-form-input" value={formData.category}
                                    onChange={(e) => updateField('category', e.target.value)} required>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Brand</label>
                                <input type="text" className="admin-form-input" value={formData.brand}
                                    onChange={(e) => updateField('brand', e.target.value)}
                                    placeholder="e.g. Havells, Philips" />
                            </div>
                            <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label className="admin-form-label">Stock *</label>
                                <input type="number" className="admin-form-input" value={formData.stock}
                                    onChange={(e) => updateField('stock', e.target.value)}
                                    placeholder="0" min="0" required />
                            </div>
                        </div>

                        {/* Tags & Status */}
                        <div className="admin-card admin-card-body">
                            <h3 className="admin-form-section-title">Tags & Status</h3>
                            <div className="admin-tag-grid">
                                <label className="admin-tag-chip">
                                    <input type="checkbox" checked={formData.isActive}
                                        onChange={(e) => updateField('isActive', e.target.checked)} />
                                    <span className="admin-tag-label active-tag">✓ Active</span>
                                </label>
                                <label className="admin-tag-chip">
                                    <input type="checkbox" checked={formData.isFeatured}
                                        onChange={(e) => updateField('isFeatured', e.target.checked)} />
                                    <span className="admin-tag-label">⭐ Featured</span>
                                </label>
                                <label className="admin-tag-chip">
                                    <input type="checkbox" checked={formData.isBestSeller}
                                        onChange={(e) => updateField('isBestSeller', e.target.checked)} />
                                    <span className="admin-tag-label">🏆 Best Seller</span>
                                </label>
                                <label className="admin-tag-chip">
                                    <input type="checkbox" checked={formData.isLowCost}
                                        onChange={(e) => updateField('isLowCost', e.target.checked)} />
                                    <span className="admin-tag-label">💰 Budget</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="admin-form-action-bar">
                    <Link to="/admin/products" className="admin-btn admin-btn-secondary">
                        <FiX size={16} /> Cancel
                    </Link>
                    <button type="submit" className="admin-btn admin-btn-gold" disabled={saving}>
                        <FiSave size={16} />
                        {saving ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AdminProductForm;
