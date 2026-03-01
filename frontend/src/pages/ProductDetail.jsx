import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiArrowLeft, FiCheck, FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isWishlisted = product ? isInWishlist(product._id) : false;

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (isWishlisted) {
            await removeFromWishlist(product._id);
        } else {
            await addToWishlist(product._id);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setAddingToCart(true);
            await addToCart(product._id, quantity);
            alert('Added to cart successfully!');
        } catch (error) {
            alert('Error adding to cart: ' + (error.response?.data?.message || error.message));
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setAddingToCart(true);
            await addToCart(product._id, quantity);
            navigate('/checkout');
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div style={{ marginTop: '140px', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ marginTop: '140px', minHeight: '60vh' }}>
                <div className="container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                        <h2>Product Not Found</h2>
                        <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-4)' }}>
                            The product you're looking for doesn't exist or has been removed.
                        </p>
                        <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
                            Back to Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div style={{ marginTop: '140px', minHeight: '60vh' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <Link
                        to="/products"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            color: 'var(--brand-primary)'
                        }}
                    >
                        <FiArrowLeft size={18} />
                        Back to Products
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', alignItems: 'start' }}>
                    {/* Left - Product Images */}
                    <div>
                        {/* Main Image */}
                        <div className="glass-card" style={{
                            padding: 'var(--space-4)',
                            marginBottom: 'var(--space-4)',
                            position: 'relative'
                        }}>
                            <div style={{
                                paddingBottom: '100%',
                                position: 'relative',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                background: 'var(--bg-secondary)'
                            }}>
                                <img
                                    src={product.images?.[selectedImage] || 'https://via.placeholder.com/500?text=No+Image'}
                                    alt={product.name}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>

                            {/* Badges */}
                            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {discount > 0 && (
                                    <span style={{
                                        background: 'var(--accent-coral)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 600
                                    }}>
                                        -{discount}% OFF
                                    </span>
                                )}
                                {product.isFeatured && (
                                    <span style={{
                                        background: 'var(--brand-primary)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FiStar size={14} /> Featured
                                    </span>
                                )}
                                {product.isBestSeller && (
                                    <span style={{
                                        background: 'var(--accent-teal)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 600
                                    }}>
                                        🏆 Best Seller
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {product.images && product.images.length > 1 && (
                            <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto' }}>
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            border: selectedImage === idx
                                                ? '2px solid var(--brand-primary)'
                                                : '2px solid var(--border-light)',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            background: 'var(--bg-secondary)'
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right - Product Info */}
                    <div>
                        {/* Brand & Category */}
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                            <span style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--brand-primary)',
                                fontWeight: 500,
                                textTransform: 'uppercase'
                            }}>
                                {product.brand || 'AbhiElectromart'}
                            </span>
                            {product.category && (
                                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                                    {' '}• {product.category.name}
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 style={{
                            fontSize: 'var(--text-3xl)',
                            fontWeight: 700,
                            marginBottom: 'var(--space-4)',
                            lineHeight: 1.2
                        }}>
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                        key={star}
                                        size={18}
                                        fill={star <= (product.averageRating || 4) ? '#fbbf24' : 'transparent'}
                                        color={star <= (product.averageRating || 4) ? '#fbbf24' : '#cbd5e0'}
                                    />
                                ))}
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                ({product.reviewCount || 0} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
                                <span style={{
                                    fontSize: 'var(--text-3xl)',
                                    fontWeight: 700,
                                    color: 'var(--brand-primary)'
                                }}>
                                    ₹{product.price?.toLocaleString()}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <>
                                        <span style={{
                                            fontSize: 'var(--text-lg)',
                                            color: 'var(--text-muted)',
                                            textDecoration: 'line-through'
                                        }}>
                                            ₹{product.originalPrice?.toLocaleString()}
                                        </span>
                                        <span style={{
                                            background: 'rgba(42, 157, 143, 0.1)',
                                            color: 'var(--accent-teal)',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 600
                                        }}>
                                            Save ₹{(product.originalPrice - product.price).toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                                Inclusive of all taxes
                            </p>
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <p style={{
                                fontSize: 'var(--text-base)',
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-6)',
                                lineHeight: 1.6
                            }}>
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Stock Status */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 600,
                                background: product.stock > 0 ? 'rgba(42, 157, 143, 0.1)' : 'rgba(231, 111, 81, 0.1)',
                                color: product.stock > 0 ? 'var(--accent-teal)' : 'var(--accent-coral)'
                            }}>
                                <FiCheck size={16} />
                                {product.stock > 0
                                    ? `In Stock (${product.stock} available)`
                                    : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={{
                                display: 'block',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 600,
                                marginBottom: 'var(--space-2)'
                            }}>
                                Quantity
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                        opacity: quantity <= 1 ? 0.5 : 1
                                    }}
                                >
                                    <FiMinus size={18} />
                                </button>
                                <span style={{
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    fontSize: 'var(--text-xl)',
                                    fontWeight: 600
                                }}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= product.stock}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                                        opacity: quantity >= product.stock ? 0.5 : 1
                                    }}
                                >
                                    <FiPlus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || addingToCart}
                                className="btn btn-secondary"
                                style={{
                                    flex: 1,
                                    opacity: product.stock === 0 ? 0.5 : 1,
                                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FiShoppingCart size={20} />
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0 || addingToCart}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    opacity: product.stock === 0 ? 0.5 : 1,
                                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Buy Now
                            </button>
                            <button
                                onClick={handleWishlistToggle}
                                className="btn"
                                style={{
                                    width: '56px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isWishlisted
                                        ? 'linear-gradient(135deg, #100f0fff 0%, #0d0c0cff 100%)'
                                        : 'linear-gradient(135deg, #080808ff 0%, #120f10ff 100%)',
                                    border: 'none',
                                    color: 'white',
                                    boxShadow: isWishlisted
                                        ? '0 0 0 3px rgba(255, 0, 110, 0.3), 0 6px 20px rgba(255, 0, 110, 0.5)'
                                        : '0 6px 20px rgba(255, 0, 110, 0.4)',
                                    transition: 'all 0.3s ease',
                                }}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <FiHeart
                                    size={24}
                                    fill={isWishlisted ? "black" : "none"}
                                    stroke="black"
                                    strokeWidth={2}
                                    style={{ color: 'black' }}
                                />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--brand-primary)'
                                    }}>
                                        <FiTruck size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Free Delivery</p>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Orders over ₹500</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'rgba(42, 157, 143, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--accent-teal)'
                                    }}>
                                        <FiShield size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>2 Year Warranty</p>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Full coverage</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'rgba(231, 111, 81, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--accent-coral)'
                                    }}>
                                        <FiRefreshCw size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Easy Returns</p>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>7-day policy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Description */}
                <div className="glass-card" style={{ padding: 'var(--space-8)', marginTop: 'var(--space-10)' }}>
                    <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>
                        Product Description
                    </h2>
                    <div style={{
                        color: 'var(--text-secondary)',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line'
                    }}>
                        {product.description}
                    </div>

                    {/* Specifications */}
                    {product.specifications && product.specifications.length > 0 && (
                        <div style={{ marginTop: 'var(--space-8)' }}>
                            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                                Specifications
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'var(--space-3)'
                            }}>
                                {product.specifications.map((spec, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            padding: 'var(--space-3)',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <span style={{
                                            fontWeight: 600,
                                            minWidth: '140px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {spec.key}:
                                        </span>
                                        <span>{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Features List */}
                    {product.features && product.features.length > 0 && (
                        <div style={{ marginTop: 'var(--space-8)' }}>
                            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                                Key Features
                            </h3>
                            <ul style={{
                                listStyle: 'none',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'var(--space-3)'
                            }}>
                                {product.features.map((feature, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <FiCheck style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 900px) {
                    .container > div:nth-child(2) {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;
