import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/common/ConfirmDialog';

const Cart = () => {
    const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItem(itemId, newQuantity);
        } catch (error) {
            toast.error('Error updating quantity: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await removeFromCart(itemId);
        } catch (error) {
            toast.error('Error removing item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleClearCart = async () => {
        const ok = await confirm('Do you really want to clear your entire cart? This action cannot be undone.', { title: 'Clear Cart', confirmText: 'Clear All' });
        if (ok) {
            try {
                await clearCart();
            } catch (error) {
                toast.error('Error clearing cart: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const calculateSubtotal = () => {
        return cart.items?.reduce((total, item) => {
            const price = item.product?.price || item.price || 0;
            return total + (price * item.quantity);
        }, 0) || 0;
    };

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    if (!isAuthenticated) {
        return (
            <div className="cart-page" style={{ minHeight: '60vh' }}>
                <div className="container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                        <FiShoppingCart size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Please Login to View Cart</h2>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                            You need to be logged in to add items to your cart and checkout.
                        </p>
                        <Link to="/login" className="btn btn-primary">
                            Login to Continue
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="cart-page" style={{ minHeight: '60vh' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="cart-page" style={{ minHeight: '60vh' }}>
                <div className="container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                        <FiShoppingBag size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Your Cart is Empty</h2>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            <FiShoppingBag size={18} />
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page" style={{ minHeight: '60vh' }}>
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-8)' }}>
                    <Link
                        to="/products"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            color: 'var(--brand-primary)',
                            marginBottom: 'var(--space-4)'
                        }}
                    >
                        <FiArrowLeft size={18} />
                        Continue Shopping
                    </Link>
                    <h1 style={{ fontSize: 'var(--text-3xl)' }}>Shopping Cart</h1>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: 'var(--text-lg)' }}>Cart Items</h3>
                            <button
                                onClick={handleClearCart}
                                style={{
                                    padding: 'var(--space-2) var(--space-4)',
                                    background: 'rgba(231, 111, 81, 0.1)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--accent-coral)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 500
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        {cart.items.map((item) => (
                            <div
                                key={item._id}
                                style={{
                                    display: 'flex',
                                    gap: 'var(--space-4)',
                                    padding: 'var(--space-4)',
                                    marginBottom: 'var(--space-4)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-light)'
                                }}
                            >
                                {/* Product Image */}
                                <Link to={`/product/${item.product?._id}`}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <img
                                            src={item.product?.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'}
                                            alt={item.product?.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                </Link>

                                {/* Product Details */}
                                <div style={{ flex: 1 }}>
                                    <Link to={`/product/${item.product?._id}`}>
                                        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                            {item.product?.name || 'Product'}
                                        </h4>
                                    </Link>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                                        {item.product?.brand || 'AbhiElectromart'}
                                    </p>
                                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                        ₹{(item.product?.price || item.price || 0).toLocaleString()}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        style={{
                                            padding: 'var(--space-2)',
                                            background: 'rgba(231, 111, 81, 0.1)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--accent-coral)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                                opacity: item.quantity <= 1 ? 0.5 : 1
                                            }}
                                        >
                                            <FiMinus size={14} />
                                        </button>
                                        <span style={{
                                            minWidth: '40px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: 'var(--text-base)'
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FiPlus size={14} />
                                        </button>
                                    </div>

                                    <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
                                        ₹{((item.product?.price || item.price || 0) * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="glass-card" style={{ padding: 'var(--space-6)', position: 'sticky', top: '160px' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                            Order Summary
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                                <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--accent-teal)' : 'inherit' }}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-teal)' }}>
                                    Add ₹{(500 - subtotal).toLocaleString()} more for FREE shipping!
                                </p>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 'var(--space-4) 0',
                            borderTop: '1px solid var(--border-light)',
                            marginBottom: 'var(--space-6)'
                        }}>
                            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Total</span>
                            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                ₹{total.toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: 'var(--space-3)' }}
                        >
                            Proceed to Checkout
                        </button>

                        <Link
                            to="/products"
                            className="btn btn-secondary"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 900px) {
                    .cart-page .container > div:last-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Cart;
