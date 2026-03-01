import React from 'react';
import { FiX, FiShoppingCart, FiHeart, FiStar, FiCheck, FiTruck, FiShield } from 'react-icons/fi';
import './QuickViewModal.css';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart }) => {
    if (!isOpen || !product) return null;

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FiStar
                key={index}
                size={16}
                fill={index < rating ? '#ffa41c' : 'none'}
                color="#ffa41c"
            />
        ));
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="quick-view-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FiX size={24} />
                </button>

                <div className="modal-content">
                    {/* Product Image */}
                    <div className="modal-image-section">
                        <div className="modal-image-wrapper">
                            <img
                                src={product.images?.[0] || '/placeholder-product.png'}
                                alt={product.name}
                                className="modal-product-image"
                            />
                            {product.discount > 0 && (
                                <span className="modal-discount-badge">
                                    -{product.discount}% OFF
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="modal-details-section">
                        <div className="modal-header">
                            <span className="modal-category">{product.category}</span>
                            <h2 className="modal-title">{product.name}</h2>

                            {/* Rating */}
                            <div className="modal-rating">
                                <div className="stars-wrapper">
                                    {renderStars(product.rating || 4)}
                                </div>
                                <span className="rating-text">
                                    {product.rating || 4}.0 ({product.reviews || 128} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="modal-price-section">
                            <div className="modal-price">
                                <span className="current-price">₹{product.price?.toLocaleString()}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
                                )}
                            </div>
                            {product.discount > 0 && (
                                <span className="savings-badge">
                                    Save ₹{(product.originalPrice - product.price)?.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="modal-description">
                            <p>{product.description || product.shortDescription || 'Premium quality electrical product with advanced features and reliable performance.'}</p>
                        </div>

                        {/* Features */}
                        <div className="modal-features">
                            <div className="feature-item">
                                <FiCheck className="feature-icon" />
                                <span>2 Year Warranty</span>
                            </div>
                            <div className="feature-item">
                                <FiTruck className="feature-icon" />
                                <span>Free Delivery</span>
                            </div>
                            <div className="feature-item">
                                <FiShield className="feature-icon" />
                                <span>100% Genuine</span>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="modal-stock">
                            {product.stock > 0 ? (
                                <span className="in-stock">
                                    <FiCheck size={16} /> In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button
                                className="btn-primary-modern btn-modern modal-add-cart"
                                onClick={() => {
                                    onAddToCart(product);
                                    onClose();
                                }}
                                disabled={product.stock === 0}
                            >
                                <FiShoppingCart size={20} />
                                Add to Cart
                            </button>
                            <button className="btn-outline-modern btn-modern modal-wishlist">
                                <FiHeart size={20} />
                                Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
