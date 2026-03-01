import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiGrid, FiList, FiShoppingCart, FiHeart, FiStar, FiAward, FiTag } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const { addToCart } = useCart();

    const filter = searchParams.get('filter');

    useEffect(() => {
        fetchProducts();
    }, [filter, sortBy]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let endpoint = '/products';
            const params = new URLSearchParams();

            // Handle different filters
            if (filter === 'bestseller') {
                params.append('bestseller', 'true');
            } else if (filter === 'lowcost') {
                params.append('lowcost', 'true');
            } else if (filter === 'featured') {
                params.append('featured', 'true');
            }

            // Add sorting
            if (sortBy === 'price_low') {
                params.append('sort', 'price_asc');
            } else if (sortBy === 'price_high') {
                params.append('sort', 'price_desc');
            } else if (sortBy === 'newest') {
                params.append('sort', 'newest');
            }

            const queryString = params.toString();
            const { data } = await api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`);
            setProducts(data.products || data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPageTitle = () => {
        switch (filter) {
            case 'bestseller': return '🏆 Best Sellers';
            case 'lowcost': return '💰 Products at Low Cost';
            case 'featured': return '⭐ Featured Products';
            default: return 'All Products';
        }
    };

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product._id, 1);
            alert('Added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    return (
        <div className="products-page" style={{ marginTop: '140px', minHeight: '60vh' }}>
            <div className="container">
                {/* Page Header */}
                <div style={{ marginBottom: 'var(--space-8)' }}>
                    <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
                        {getPageTitle()}
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                        {products.length} products found
                    </p>
                </div>

                {/* Filter Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                    padding: 'var(--space-4)',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)'
                }}>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="form-input"
                            style={{ width: '180px' }}
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: 'var(--space-2)',
                                background: viewMode === 'grid' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            <FiGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: 'var(--space-2)',
                                background: viewMode === 'list' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            <FiList size={18} />
                        </button>
                    </div>
                </div>

                {/* Products Grid/List */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-16)',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border-light)'
                    }}>
                        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                            No products found
                        </h3>
                        <p style={{ color: 'var(--text-tertiary)' }}>
                            Try adjusting your filters or check back later.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                        gap: 'var(--space-6)'
                    }}>
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="glass-card product-card-hover"
                                style={{
                                    padding: 'var(--space-4)',
                                    display: viewMode === 'list' ? 'flex' : 'block',
                                    gap: viewMode === 'list' ? 'var(--space-6)' : '0',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                {/* Product Image */}
                                <Link to={`/product/${product._id}`} style={{
                                    display: 'block',
                                    width: viewMode === 'list' ? '200px' : '100%',
                                    flexShrink: 0
                                }}>
                                    <div style={{
                                        position: 'relative',
                                        paddingBottom: viewMode === 'list' ? '100%' : '100%',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-lg)',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
                                            alt={product.name}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        {product.discount > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                background: 'var(--accent-coral)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--text-xs)',
                                                fontWeight: 600
                                            }}>
                                                -{product.discount}%
                                            </span>
                                        )}
                                        {product.isFeatured && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'var(--brand-primary)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--text-xs)',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <FiStar size={12} /> Featured
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div style={{ flex: 1, marginTop: viewMode === 'grid' ? 'var(--space-4)' : 0 }}>
                                    <Link to={`/product/${product._id}`}>
                                        <p style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--brand-primary)',
                                            marginBottom: 'var(--space-1)',
                                            textTransform: 'uppercase',
                                            fontWeight: 500
                                        }}>
                                            {product.brand || 'AbhiElectromart'}
                                        </p>
                                        <h3 style={{
                                            fontSize: 'var(--text-lg)',
                                            fontWeight: 600,
                                            marginBottom: 'var(--space-2)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-tertiary)',
                                        marginBottom: 'var(--space-3)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {product.shortDescription || product.description}
                                    </p>

                                    {/* Price */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <span style={{
                                            fontSize: 'var(--text-xl)',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)'
                                        }}>
                                            ₹{product.price?.toLocaleString()}
                                        </span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span style={{
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--text-muted)',
                                                textDecoration: 'line-through',
                                                marginLeft: 'var(--space-2)'
                                            }}>
                                                ₹{product.originalPrice?.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stock Status */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <span style={{
                                            fontSize: 'var(--text-xs)',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            background: product.stock > 0 ? 'rgba(42, 157, 143, 0.1)' : 'rgba(231, 111, 81, 0.1)',
                                            color: product.stock > 0 ? 'var(--accent-teal)' : 'var(--accent-coral)',
                                            fontWeight: 500
                                        }}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock === 0}
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            opacity: product.stock === 0 ? 0.5 : 1,
                                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <FiShoppingCart size={18} />
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
