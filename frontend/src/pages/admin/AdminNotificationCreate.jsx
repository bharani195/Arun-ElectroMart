import React, { useState, useEffect } from 'react';
import toast from '../../utils/toast';
import {
    FiArrowLeft, FiInfo, FiTag, FiAlertTriangle, FiRefreshCw,
    FiStar, FiPercent, FiSearch, FiPackage, FiCalendar,
    FiUsers, FiShoppingBag, FiMail, FiX, FiCheck, FiSend
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomDropdown from '../../components/common/CustomDropdown';
import './admin.css';

const typeConfig = {
    info: { label: 'Info', bg: '#DBEAFE', color: '#1E40AF', icon: FiInfo, desc: 'General information' },
    offer: { label: 'Offer', bg: '#D1FAE5', color: '#065F46', icon: FiTag, desc: 'Promotions & deals' },
    alert: { label: 'Alert', bg: '#FEF3C7', color: '#92400E', icon: FiAlertTriangle, desc: 'Urgent alerts' },
    update: { label: 'Update', bg: '#EDE9FE', color: '#5B21B6', icon: FiRefreshCw, desc: 'Product/store updates' },
    product_spotlight: { label: 'Spotlight', bg: '#FFF7ED', color: '#C2410C', icon: FiStar, desc: 'Feature a product' },
    discount_offer: { label: 'Discount', bg: '#FEF2F2', color: '#DC2626', icon: FiPercent, desc: 'Discounts & coupons' },
};

const isProductType = (type) => ['product_spotlight', 'discount_offer'].includes(type);

const initialForm = {
    title: '', message: '', type: 'info', targetAudience: 'all',
    product: '', targetCategory: '',
    discountCode: '', discountPercent: '', offerExpiry: '',
    sendEmail: false,
};

const AdminNotificationCreate = () => {
    const [form, setForm] = useState({ ...initialForm });
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async (search = '') => {
        try {
            const { data } = await api.get(`/products?limit=30${search ? `&search=${search}` : ''}`);
            setProducts(data.products || data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleCreate = async () => {
        if (!form.title.trim() || !form.message.trim()) return toast.warn('Title and message are required');
        if (isProductType(form.type) && !form.product) return toast.warn('Please select a product');
        if (form.type === 'discount_offer' && !form.discountPercent) return toast.warn('Please enter discount percentage');
        if (form.targetAudience === 'category_buyers' && !form.targetCategory) return toast.warn('Please select a target category');

        try {
            setSaving(true);
            const payload = {
                title: form.title,
                message: form.message,
                type: form.type,
                targetAudience: form.targetAudience,
                sendEmail: form.sendEmail,
            };
            if (isProductType(form.type)) payload.product = form.product;
            if (form.type === 'discount_offer') {
                payload.discountCode = form.discountCode;
                payload.discountPercent = Number(form.discountPercent);
                if (form.offerExpiry) payload.offerExpiry = form.offerExpiry;
            }
            if (form.targetAudience === 'category_buyers') payload.targetCategory = form.targetCategory;

            await api.post('/admin/notifications', payload);
            toast.success(form.sendEmail ? 'Notification created & emails are being sent!' : 'Notification created!');
            navigate('/admin/notifications');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating notification');
        } finally {
            setSaving(false);
        }
    };

    // Product helpers
    const selectedProduct = products.find(p => p._id === form.product);
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleProductSearch = (val) => {
        setProductSearch(val);
        setShowProductDropdown(true);
        if (val.length >= 2) fetchProducts(val);
    };

    const selectProduct = (p) => {
        setForm({ ...form, product: p._id });
        setProductSearch(p.name);
        setShowProductDropdown(false);
    };

    const cfg = typeConfig[form.type] || typeConfig.info;

    return (
        <AdminLayout activePage="notifications">
            <div className="ntf-create-page">
                {/* Back header */}
                <div className="ntf-create-header">
                    <button className="ntf-back-btn" onClick={() => navigate('/admin/notifications')}>
                        <FiArrowLeft size={18} />
                        <span>Back to Notifications</span>
                    </button>
                    <h1 className="ntf-create-title">Create Notification</h1>
                    <p className="ntf-create-subtitle">Compose a new notification or email campaign for your customers</p>
                </div>

                <div className="ntf-create-layout">
                    {/* ─── LEFT: Form ─── */}
                    <div className="ntf-create-form">
                        {/* Type Selector */}
                        <div className="ntf-form-section">
                            <label className="ntf-form-label">Notification Type</label>
                            <div className="ntf-type-grid">
                                {Object.entries(typeConfig).map(([key, c]) => {
                                    const TypeIcon = c.icon;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`ntf-type-card ${form.type === key ? 'ntf-type-card-active' : ''}`}
                                            style={form.type === key ? { borderColor: c.color, background: c.bg } : {}}
                                            onClick={() => setForm({ ...form, type: key, product: '', discountCode: '', discountPercent: '', offerExpiry: '' })}
                                        >
                                            <div className="ntf-type-card-icon" style={form.type === key ? { background: c.color, color: '#fff' } : { background: c.bg, color: c.color }}>
                                                <TypeIcon size={16} />
                                            </div>
                                            <div>
                                                <div className="ntf-type-card-label">{c.label}</div>
                                                <div className="ntf-type-card-desc">{c.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="ntf-form-section">
                            <label className="ntf-form-label">Title *</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder={form.type === 'product_spotlight' ? 'e.g. New Arrival — Premium LED Bulbs!' : form.type === 'discount_offer' ? 'e.g. Flash Sale — 30% OFF!' : 'e.g. New Year Sale!'}
                                className="ntf-form-input" />
                        </div>

                        {/* Message */}
                        <div className="ntf-form-section">
                            <label className="ntf-form-label">Message *</label>
                            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                placeholder="Write your notification message..."
                                className="ntf-form-input ntf-form-textarea"
                                rows={4} />
                        </div>

                        {/* Product Selector */}
                        {isProductType(form.type) && (
                            <div className="ntf-form-section">
                                <label className="ntf-form-label"><FiPackage size={13} style={{ marginRight: 4 }} /> Select Product *</label>
                                <div className="ntf-product-select">
                                    <div className="ntf-product-search">
                                        <FiSearch size={14} className="ntf-product-search-icon" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={e => handleProductSearch(e.target.value)}
                                            onFocus={() => { setShowProductDropdown(true); fetchProducts(productSearch); }}
                                            onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                                            placeholder="Search products..."
                                            className="ntf-form-input"
                                            style={{ paddingLeft: '36px' }}
                                        />
                                    </div>
                                    {showProductDropdown && filteredProducts.length > 0 && (
                                        <div className="ntf-product-dropdown">
                                            {filteredProducts.map(p => (
                                                <div
                                                    key={p._id}
                                                    className={`ntf-product-option ${form.product === p._id ? 'ntf-product-option-selected' : ''}`}
                                                    onMouseDown={() => selectProduct(p)}
                                                >
                                                    <img src={p.images?.[0] || ''} alt="" className="ntf-product-option-img" />
                                                    <div className="ntf-product-option-info">
                                                        <span className="ntf-product-option-name">{p.name}</span>
                                                        <span className="ntf-product-option-price">₹{p.price?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    {form.product === p._id && <FiCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedProduct && (
                                    <div className="ntf-selected-product">
                                        <img src={selectedProduct.images?.[0] || ''} alt="" />
                                        <div>
                                            <strong>{selectedProduct.name}</strong>
                                            <span>₹{selectedProduct.price?.toLocaleString('en-IN')}{selectedProduct.originalPrice > selectedProduct.price ? ` (MRP: ₹${selectedProduct.originalPrice?.toLocaleString('en-IN')})` : ''}</span>
                                        </div>
                                        <button type="button" onClick={() => { setForm({ ...form, product: '' }); setProductSearch(''); }} className="ntf-remove-product"><FiX size={14} /></button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Discount Fields */}
                        {form.type === 'discount_offer' && (
                            <div className="ntf-discount-row">
                                <div className="ntf-form-section" style={{ flex: 1 }}>
                                    <label className="ntf-form-label"><FiPercent size={13} style={{ marginRight: 4 }} /> Discount % *</label>
                                    <input type="number" min="1" max="100" value={form.discountPercent}
                                        onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                                        placeholder="e.g. 20" className="ntf-form-input" />
                                </div>
                                <div className="ntf-form-section" style={{ flex: 1 }}>
                                    <label className="ntf-form-label"><FiTag size={13} style={{ marginRight: 4 }} /> Coupon Code</label>
                                    <input type="text" value={form.discountCode}
                                        onChange={e => setForm({ ...form, discountCode: e.target.value.toUpperCase() })}
                                        placeholder="e.g. MEGA20"
                                        className="ntf-form-input"
                                        style={{ fontFamily: 'monospace', letterSpacing: '1.5px' }} />
                                </div>
                                <div className="ntf-form-section" style={{ flex: 1 }}>
                                    <label className="ntf-form-label"><FiCalendar size={13} style={{ marginRight: 4 }} /> Offer Expiry</label>
                                    <input type="date" value={form.offerExpiry}
                                        onChange={e => setForm({ ...form, offerExpiry: e.target.value })}
                                        className="ntf-form-input" />
                                </div>
                            </div>
                        )}

                        {/* Target Audience */}
                        <div className="ntf-form-section">
                            <label className="ntf-form-label"><FiUsers size={13} style={{ marginRight: 4 }} /> Target Audience</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <CustomDropdown
                                        value={form.targetAudience}
                                        onChange={(val) => setForm({ ...form, targetAudience: val, targetCategory: '' })}
                                        options={[
                                            { value: 'all', label: 'All Users' },
                                            { value: 'customers', label: 'Customers Only' },
                                            { value: 'category_buyers', label: 'Category Buyers' },
                                        ]}
                                    />
                                </div>
                                {form.targetAudience === 'category_buyers' && (
                                    <div style={{ flex: 1 }}>
                                        <CustomDropdown
                                            value={form.targetCategory}
                                            onChange={(val) => setForm({ ...form, targetCategory: val })}
                                            options={categories.map(c => ({ value: c._id, label: c.name }))}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Email Toggle */}
                        {isProductType(form.type) && (
                            <div className="ntf-email-toggle" onClick={() => setForm({ ...form, sendEmail: !form.sendEmail })}>
                                <div className={`ntf-toggle-track ${form.sendEmail ? 'ntf-toggle-active' : ''}`}>
                                    <div className="ntf-toggle-thumb"></div>
                                </div>
                                <div className="ntf-toggle-label">
                                    <FiMail size={15} />
                                    <div>
                                        <strong>Send email campaign</strong>
                                        <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>
                                            Emails will be sent to {form.targetAudience === 'all' ? 'all users' : form.targetAudience === 'customers' ? 'customers' : 'category buyers'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="ntf-form-actions">
                            <button className="ntf-btn ntf-btn-cancel" onClick={() => navigate('/admin/notifications')}>Cancel</button>
                            <button className="ntf-btn ntf-btn-submit" onClick={handleCreate} disabled={saving}>
                                <FiSend size={15} />
                                {saving ? 'Sending...' : (form.sendEmail ? 'Create & Send Emails' : 'Create Notification')}
                            </button>
                        </div>
                    </div>

                    {/* ─── RIGHT: Live Preview ─── */}
                    <div className="ntf-create-preview">
                        <div className="ntf-preview-label">Live Preview</div>
                        <div className="ntf-preview-card">
                            {/* Preview Header */}
                            <div className="ntf-preview-header">
                                <span>⚡ ElectroMart</span>
                            </div>

                            {/* Discount Banner */}
                            {form.type === 'discount_offer' && form.discountPercent && (
                                <div className="ntf-preview-discount-banner">
                                    <span className="ntf-preview-discount-label">SPECIAL OFFER</span>
                                    <span className="ntf-preview-discount-value">{form.discountPercent}% OFF</span>
                                    {form.discountCode && (
                                        <span className="ntf-preview-discount-code">{form.discountCode}</span>
                                    )}
                                    {form.offerExpiry && (
                                        <span className="ntf-preview-discount-expiry">
                                            ⏰ Valid until {new Date(form.offerExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Greeting */}
                            <div className="ntf-preview-body">
                                <h3 className="ntf-preview-title">{form.title || 'Your notification title'}</h3>
                                <p className="ntf-preview-message">{form.message || 'Your notification message will appear here...'}</p>
                            </div>

                            {/* Product card */}
                            {isProductType(form.type) && selectedProduct && (
                                <div className="ntf-preview-product">
                                    {selectedProduct.images?.[0] && (
                                        <div className="ntf-preview-product-img-wrap">
                                            <img src={selectedProduct.images[0]} alt="" className="ntf-preview-product-img" />
                                            {form.type === 'discount_offer' && form.discountPercent && (
                                                <span className="ntf-preview-product-badge">-{form.discountPercent}%</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="ntf-preview-product-info">
                                        <strong>{selectedProduct.name}</strong>
                                        {selectedProduct.brand && <span className="ntf-preview-product-brand">{selectedProduct.brand}</span>}
                                        <div className="ntf-preview-product-price">
                                            <span className="ntf-preview-price-current">₹{selectedProduct.price?.toLocaleString('en-IN')}</span>
                                            {selectedProduct.originalPrice > selectedProduct.price && (
                                                <span className="ntf-preview-price-original">₹{selectedProduct.originalPrice?.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                        {form.type === 'discount_offer' && form.discountCode && (
                                            <div className="ntf-preview-coupon">
                                                <span>Use code:</span>
                                                <code>{form.discountCode}</code>
                                            </div>
                                        )}
                                        <div className="ntf-preview-cta">🛒 {form.type === 'discount_offer' ? 'Grab This Deal' : 'Shop Now'}</div>
                                    </div>
                                </div>
                            )}

                            {/* No product selected placeholder */}
                            {isProductType(form.type) && !selectedProduct && (
                                <div className="ntf-preview-placeholder">
                                    <FiPackage size={32} />
                                    <p>Select a product to see the preview</p>
                                </div>
                            )}

                            {/* Preview Footer */}
                            <div className="ntf-preview-footer">
                                <span>⚡ ElectroMart</span>
                                <span>Premium Electrical Products</span>
                            </div>
                        </div>

                        {/* Email send info */}
                        {form.sendEmail && (
                            <div className="ntf-preview-email-info">
                                <FiMail size={14} />
                                <span>This email will be sent to {form.targetAudience === 'all' ? 'all registered users' : form.targetAudience === 'customers' ? 'all customers' : `buyers from ${categories.find(c => c._id === form.targetCategory)?.name || 'selected'} category`}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotificationCreate;
