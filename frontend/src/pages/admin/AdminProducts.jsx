import React, { useState, useEffect } from 'react';
import toast from '../../utils/toast';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomDropdown from '../../components/common/CustomDropdown';
import { useConfirm } from '../../components/common/ConfirmDialog';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const confirm = useConfirm();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page, selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 10 });
            if (selectedCategory) params.append('category', selectedCategory);
            if (search) params.append('search', search);
            const { data } = await api.get(`/products?${params}`);
            setProducts(data.products);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(); };

    const handleDelete = async (id) => {
        const ok = await confirm('Do you really want to delete this product? This action cannot be undone.', { title: 'Delete Product', confirmText: 'Delete' });
        if (!ok) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error deleting product');
        }
    };

    const getStockBadge = (stock) => {
        if (stock > 10) return 'green';
        if (stock > 0) return 'amber';
        return 'red';
    };

    return (
        <AdminLayout activePage="products">
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Products</h1>
                    <p className="admin-page-subtitle">Manage your product inventory</p>
                </div>
                <Link to="/admin/products/new" className="admin-btn admin-btn-gold">
                    <FiPlus size={18} /> Add Product
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
                <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px' }}>
                    <div className="admin-search-wrap">
                        <FiSearch size={16} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="admin-input with-icon"
                        />
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '10px 14px' }}>
                        <FiSearch size={16} />
                    </button>
                </form>
                <CustomDropdown
                    value={selectedCategory}
                    onChange={(val) => { setSelectedCategory(val); setPage(1); }}
                    options={[{ value: '', label: 'All Categories' }, ...categories.map(cat => ({ value: cat._id, label: cat.name }))]}
                />
            </div>

            {/* Products Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="admin-loading"><div className="loading-spinner"></div></div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? products.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="admin-product-cell">
                                                <img
                                                    src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                                    alt={product.name}
                                                    className="admin-product-img"
                                                />
                                                <div>
                                                    <p className="admin-product-name">{product.name}</p>
                                                    <p className="admin-product-brand">{product.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.category?.name || 'N/A'}</td>
                                        <td>
                                            <span className="admin-price">₹{product.price?.toLocaleString()}</span>
                                            {product.originalPrice && (
                                                <span className="admin-price-original">₹{product.originalPrice?.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${getStockBadge(product.stock)}`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${product.isActive ? 'green' : 'gray'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link to={`/admin/products/edit/${product._id}`}
                                                className="admin-btn-icon" style={{ marginRight: '6px' }}>
                                                <FiEdit2 size={15} />
                                            </Link>
                                            <button onClick={() => handleDelete(product._id)} className="admin-btn-icon danger">
                                                <FiTrash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', color: '#9a8a7a', padding: '32px' }}>
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="admin-pagination">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-pagination-btn">
                        <FiChevronLeft size={16} />
                    </button>
                    <span className="admin-pagination-info">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-pagination-btn">
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProducts;
