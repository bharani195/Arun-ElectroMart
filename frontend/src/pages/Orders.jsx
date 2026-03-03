import React, { useState, useEffect } from 'react';
import toast from '../utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    FiPackage,
    FiShoppingBag,
    FiChevronDown,
    FiChevronUp,
    FiMapPin,
    FiCreditCard,
    FiCalendar,
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiXCircle,
} from 'react-icons/fi';

const Orders = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders/user');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error loading orders: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderExpand = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const getStatusColor = (status) => {
        const colors = {
            Pending: '#f59e0b',
            Confirmed: '#3b82f6',
            Delivered: '#10b981',
            Cancelled: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            Pending: FiClock,
            Confirmed: FiCheckCircle,
            Delivered: FiCheckCircle,
            Cancelled: FiXCircle,
        };
        const Icon = icons[status] || FiPackage;
        return <Icon size={16} />;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div style={{ minHeight: '60vh', paddingBottom: 'var(--space-16)' }}>
                <div className="container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                        <FiShoppingBag size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>No Orders Yet</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                            You haven't placed any orders yet. Start shopping to see your orders here!
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
        <div style={{ minHeight: '60vh', paddingBottom: 'var(--space-16)' }}>
            <div className="container">
                <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                    My Orders
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {orders.map((order) => {
                        const isExpanded = expandedOrders.has(order._id);
                        return (
                            <div key={order._id} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                                {/* Order Header */}
                                <div
                                    onClick={() => toggleOrderExpand(order._id)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        paddingBottom: isExpanded ? 'var(--space-6)' : '0',
                                        borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flex: 1 }}>
                                        {/* Order Number & Date */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <FiPackage size={20} color="var(--brand-primary)" />
                                                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                                                    #{order.orderNumber}
                                                </h3>
                                            </div>
                                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <FiCalendar size={14} />
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div
                                            style={{
                                                padding: 'var(--space-2) var(--space-4)',
                                                borderRadius: 'var(--radius-full)',
                                                background: `${getStatusColor(order.orderStatus)}20`,
                                                color: getStatusColor(order.orderStatus),
                                                fontWeight: 600,
                                                fontSize: 'var(--text-sm)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                            }}
                                        >
                                            {getStatusIcon(order.orderStatus)}
                                            {order.orderStatus}
                                        </div>

                                        {/* Total Amount */}
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                                Total Amount
                                            </p>
                                            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                                ₹{order.totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expand Icon */}
                                    <div style={{ marginLeft: 'var(--space-4)' }}>
                                        {isExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                                    </div>
                                </div>

                                {/* Order Details (Expanded) */}
                                {isExpanded && (
                                    <div style={{ marginTop: 'var(--space-6)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                                            {/* Order Items */}
                                            <div>
                                                <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                                                    Order Items ({order.items.length})
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                                    {order.items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: 'flex',
                                                                gap: 'var(--space-4)',
                                                                padding: 'var(--space-4)',
                                                                background: 'var(--bg-secondary)',
                                                                borderRadius: 'var(--radius-lg)',
                                                            }}
                                                        >
                                                            <img
                                                                src={item.image || 'https://via.placeholder.com/80'}
                                                                alt={item.name}
                                                                style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: 'var(--radius-md)',
                                                                }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <h5 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                                                    {item.name}
                                                                </h5>
                                                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                                <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                                                                    ₹{item.price.toLocaleString()} × {item.quantity} = ₹{item.subtotal.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            <div>
                                                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <FiMapPin size={18} color="var(--brand-primary)" />
                                                    Shipping Address
                                                </h4>
                                                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                                    <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                                        {order.shippingAddress.name}
                                                    </p>
                                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                                        {order.shippingAddress.phone}
                                                    </p>
                                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                        {order.shippingAddress.addressLine1}
                                                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                        <br />
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Details */}
                                            <div>
                                                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <FiCreditCard size={18} color="var(--brand-primary)" />
                                                    Payment Details
                                                </h4>
                                                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Method</span>
                                                        <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Payment Status</span>
                                                        <span
                                                            style={{
                                                                fontWeight: 600,
                                                                color: order.paymentStatus === 'Paid' ? 'var(--accent-teal)' : 'var(--brand-copper)',
                                                            }}
                                                        >
                                                            {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price Details */}
                                            <div>
                                                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                                                    Price Details
                                                </h4>
                                                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Subtotal</span>
                                                        <span>₹{order.subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-light)' }}>
                                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Shipping</span>
                                                        <span style={{ color: order.shippingCharge === 0 ? 'var(--accent-teal)' : 'inherit' }}>
                                                            {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 700 }}>Total</span>
                                                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                                            ₹{order.totalAmount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 900px) {
                    .container > div > div > div > div:first-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Orders;
