import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i} size={12} />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} size={12} />);
            } else {
                stars.push(<FaRegStar key={i} size={12} />);
            }
        }
        return stars;
    };

    const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product._id);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            await removeFromWishlist(product._id);
        } else {
            await addToWishlist(product._id);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product._id, 1);
    };

    const getStockStatus = () => {
        if (product.stock === 0) return { text: 'Out of Stock', class: 'stock-out' };
        if (product.stock <= 10) return { text: `Only ${product.stock} left`, class: 'stock-low' };
        return { text: 'In Stock', class: 'stock-in' };
    };

    const stockStatus = getStockStatus();
    const discountPercent = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <Link to={`/product/${product._id}`} className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                    }}
                />

                {discountPercent > 0 && (
                    <span className="product-badge">-{discountPercent}%</span>
                )}

                <div className="product-actions">
                    <button
                        className={`product-action-btn ${isWishlisted ? 'active' : ''}`}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        onClick={handleWishlistToggle}
                        style={{ color: isWishlisted ? 'var(--accent-coral)' : 'inherit' }}
                    >
                        <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button className="product-action-btn" title="Quick View">
                        <FiEye size={18} />
                    </button>
                </div>
            </div>

            <div className="product-info">
                <span className="product-category">
                    {product.category?.name || 'Electronics'}
                </span>

                <h3 className="product-title">{product.name}</h3>

                <div className="product-rating">
                    <div className="stars">
                        {renderStars(product.averageRating || 4.5)}
                    </div>
                    <span className="rating-count">
                        ({product.reviewCount || 0} reviews)
                    </span>
                </div>

                <div className="product-price">
                    <span className="price-current">₹{product.price?.toLocaleString()}</span>
                    {product.originalPrice && (
                        <>
                            <span className="price-original">₹{product.originalPrice?.toLocaleString()}</span>
                            <span className="price-discount">{discountPercent}% OFF</span>
                        </>
                    )}
                </div>

                <p className={`product-stock ${stockStatus.class}`}>
                    {stockStatus.text}
                </p>

                <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                >
                    <FiShoppingCart size={18} />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;
