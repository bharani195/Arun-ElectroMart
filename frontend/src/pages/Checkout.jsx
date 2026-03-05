import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/common/ConfirmDialog';
import api, { secureUrl } from '../utils/api';
import {
    FiMapPin,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCreditCard,
    FiDollarSign,
    FiPackage,
    FiTruck,
    FiCheckCircle,
} from 'react-icons/fi';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const confirm = useConfirm();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [placing, setPlacing] = useState(false);

    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!cart || cart.items?.length === 0) {
            navigate('/cart');
            return;
        }

        fetchAddresses();
    }, [isAuthenticated, cart]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/profile');
            setAddresses(data.user.addresses || []);
            if (data.user.addresses?.length > 0) {
                setSelectedAddressId(data.user.addresses[0]._id);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressFormChange = (e) => {
        setAddressForm({
            ...addressForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/address', addressForm);
            await fetchAddresses();
            setShowAddressForm(false);
            setAddressForm({
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
            });
        } catch (error) {
            toast.error('Error adding address: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteAddress = async (addressId) => {
        const ok = await confirm('Do you really want to delete this address? This action cannot be undone.', { title: 'Delete Address', confirmText: 'Delete' });
        if (!ok) return;

        try {
            await api.delete(`/users/address/${addressId}`);
            await fetchAddresses();
            if (selectedAddressId === addressId) {
                setSelectedAddressId(null);
            }
        } catch (error) {
            toast.error('Error deleting address: ' + (error.response?.data?.message || error.message));
        }
    };

    const calculateSubtotal = () => {
        return cart?.items?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;
    };

    const calculateShipping = () => {
        const subtotal = calculateSubtotal();
        return subtotal >= 500 ? 0 : 50;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateShipping();
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.warn('Please select a shipping address');
            return;
        }

        if (!paymentMethod) {
            toast.warn('Please select a payment method');
            return;
        }

        try {
            setPlacing(true);

            const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId);

            const orderData = {
                items: cart.items.map((item) => ({
                    product: item.product._id,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    addressLine1: selectedAddress.addressLine1,
                    addressLine2: selectedAddress.addressLine2 || '',
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
                },
                paymentMethod,
                shippingCharge: calculateShipping(),
            };

            // Step 1: Create order on our server
            const { data: order } = await api.post('/orders/create', orderData);

            if (paymentMethod === 'Online') {
                // Step 2: Create Razorpay order
                const { data: razorpayOrder } = await api.post('/payment/create-order', {
                    amount: calculateTotal(),
                    orderId: order._id,
                });

                // Step 3: Open Razorpay payment popup
                const options = {
                    key: razorpayOrder.key,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: 'AbhiElectromart',
                    description: `Order #${order.orderNumber}`,
                    order_id: razorpayOrder.id,
                    handler: async function (response) {
                        try {
                            // Step 4: Verify payment on server
                            await api.post('/payment/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: order._id,
                            });

                            // Clear cart and redirect
                            await clearCart();
                            toast.success(`Payment successful! Order Number: ${order.orderNumber}`);
                            navigate('/orders');
                        } catch (err) {
                            console.error('Payment verification failed:', err);
                            toast.error('Payment verification failed. Please contact support.');
                            navigate('/orders');
                        }
                    },
                    prefill: {
                        name: user?.name || selectedAddress.name,
                        email: user?.email || '',
                        contact: selectedAddress.phone,
                    },
                    theme: {
                        color: '#8b7355',
                    },
                    modal: {
                        ondismiss: function () {
                            setPlacing(false);
                            toast.warn('Payment was cancelled. Your order has been saved. You can complete payment from your orders page.');
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + response.error.description);
                    setPlacing(false);
                });
                rzp.open();
                return; // Don't set placing=false here, Razorpay popup is open
            }

            // COD flow — just clear cart and redirect
            await clearCart();
            toast.success(`Order placed successfully! Order Number: ${order.orderNumber}`);
            navigate('/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Error placing order: ' + (error.response?.data?.message || error.message));
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '60vh', paddingBottom: 'var(--space-16)' }}>
            <div className="container">
                <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-8)' }}>
                    Checkout
                </h1>

                <div className="checkout-layout">
                    {/* Left Column - Address & Payment */}
                    <div>
                        {/* Shipping Address Section */}
                        <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <FiMapPin size={24} color="var(--brand-primary)" />
                                    Shipping Address
                                </h2>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="btn btn-outline"
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                                >
                                    <FiPlus size={18} />
                                    Add New Address
                                </button>
                            </div>

                            {/* Add Address Form */}
                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>New Address</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={addressForm.name}
                                                onChange={handleAddressFormChange}
                                                required
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={addressForm.phone}
                                                onChange={handleAddressFormChange}
                                                required
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                Address Line 1 *
                                            </label>
                                            <input
                                                type="text"
                                                name="addressLine1"
                                                value={addressForm.addressLine1}
                                                onChange={handleAddressFormChange}
                                                required
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                Address Line 2
                                            </label>
                                            <input
                                                type="text"
                                                name="addressLine2"
                                                value={addressForm.addressLine2}
                                                onChange={handleAddressFormChange}
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={addressForm.city}
                                                onChange={handleAddressFormChange}
                                                required
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={addressForm.state}
                                                onChange={handleAddressFormChange}
                                                required
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                                Pincode *
                                            </label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={addressForm.pincode}
                                                onChange={handleAddressFormChange}
                                                required
                                                pattern="[0-9]{6}"
                                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                        <button type="submit" className="btn btn-primary">
                                            Save Address
                                        </button>
                                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-outline">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Address List */}
                            {addresses.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
                                    No saved addresses. Please add a new address to continue.
                                </p>
                            ) : (
                                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                    {addresses.map((address) => (
                                        <div
                                            key={address._id}
                                            onClick={() => setSelectedAddressId(address._id)}
                                            style={{
                                                padding: 'var(--space-5)',
                                                border: selectedAddressId === address._id ? '2px solid var(--brand-primary)' : '1px solid var(--border-light)',
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: 'pointer',
                                                background: selectedAddressId === address._id ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                            }}
                                        >
                                            {selectedAddressId === address._id && (
                                                <FiCheckCircle
                                                    size={24}
                                                    color="var(--brand-primary)"
                                                    style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}
                                                />
                                            )}
                                            <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                                                {address.name}
                                            </h4>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                                {address.phone}
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                                {address.addressLine1}
                                                {address.addressLine2 && `, ${address.addressLine2}`}
                                                <br />
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAddress(address._id);
                                                }}
                                                style={{
                                                    marginTop: 'var(--space-3)',
                                                    color: 'var(--accent-coral)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-2)',
                                                    fontSize: 'var(--text-sm)',
                                                }}
                                            >
                                                <FiTrash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Section */}
                        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FiCreditCard size={24} color="var(--brand-primary)" />
                                Payment Method
                            </h2>

                            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    style={{
                                        padding: 'var(--space-5)',
                                        border: paymentMethod === 'COD' ? '2px solid var(--brand-primary)' : '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        background: paymentMethod === 'COD' ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                    }}
                                >
                                    {paymentMethod === 'COD' && (
                                        <FiCheckCircle
                                            size={24}
                                            color="var(--brand-primary)"
                                            style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <FiDollarSign size={32} color="var(--accent-teal)" />
                                        <div>
                                            <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Cash on Delivery</h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                                Pay when you receive your order
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('Online')}
                                    style={{
                                        padding: 'var(--space-5)',
                                        border: paymentMethod === 'Online' ? '2px solid var(--brand-primary)' : '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        background: paymentMethod === 'Online' ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                    }}
                                >
                                    {paymentMethod === 'Online' && (
                                        <FiCheckCircle
                                            size={24}
                                            color="var(--brand-primary)"
                                            style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <FiCreditCard size={32} color="var(--brand-copper)" />
                                        <div>
                                            <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Online Payment</h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                                UPI, Cards, Net Banking via Razorpay
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div>
                        <div className="glass-card" style={{ padding: 'var(--space-6)', position: 'sticky', top: '140px' }}>
                            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FiPackage size={24} color="var(--brand-primary)" />
                                Order Summary
                            </h2>

                            {/* Cart Items */}
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                {cart?.items?.map((item) => (
                                    <div key={item._id} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                                        <img
                                            src={secureUrl(item.product.images?.[0]) || 'https://via.placeholder.com/80'}
                                            alt={item.product.name}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                                {item.product.name}
                                            </h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                                                Qty: {item.quantity}
                                            </p>
                                            <p style={{ fontWeight: 600, marginTop: 'var(--space-1)' }}>
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>₹{calculateSubtotal().toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <FiTruck size={16} />
                                        Shipping
                                    </span>
                                    <span style={{ fontWeight: 600, color: calculateShipping() === 0 ? 'var(--accent-teal)' : 'inherit' }}>
                                        {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping()}`}
                                    </span>
                                </div>
                                {calculateShipping() > 0 && (
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                                        Add ₹{(500 - calculateSubtotal()).toLocaleString()} more for free shipping
                                    </p>
                                )}
                                <div style={{ paddingTop: 'var(--space-4)', borderTop: '2px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Total</span>
                                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                        ₹{calculateTotal().toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={!selectedAddressId || placing}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-4)',
                                    fontSize: 'var(--text-lg)',
                                    opacity: !selectedAddressId || placing ? 0.5 : 1,
                                    cursor: !selectedAddressId || placing ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {placing ? 'Placing Order...' : 'Place Order'}
                            </button>

                            {!selectedAddressId && (
                                <p style={{ color: 'var(--accent-coral)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
                                    Please select a shipping address
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

