import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiEdit2,
    FiSave,
    FiX,
    FiPlus,
    FiTrash2,
    FiShoppingBag,
    FiCalendar,
    FiDollarSign,
    FiShield,
    FiLock,
    FiCheck,
} from 'react-icons/fi';

const Profile = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [addressMode, setAddressMode] = useState(false);
    const [editAddressId, setEditAddressId] = useState(null);

    // Form states
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!authUser) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [authUser, navigate]);

    const fetchProfile = async () => {
        try {
            console.log('Fetching profile...');
            const { data } = await api.get('/users/profile');
            console.log('Profile data received:', data);
            setUser(data.user);
            setStats(data.stats);
            setProfileForm({
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone || '',
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            console.error('Error response:', error.response);
            // Show error message to user
            showMessage('error', error.response?.data?.message || 'Failed to load profile. Please try logging in again.');
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/users/profile', profileForm);
            setUser(data);
            setEditMode(false);
            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage('error', 'Passwords do not match');
            return;
        }
        try {
            await api.put('/users/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordMode(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMessage('success', 'Password changed successfully!');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            if (editAddressId) {
                const { data } = await api.put(`/users/address/${editAddressId}`, addressForm);
                setUser({ ...user, addresses: data });
                showMessage('success', 'Address updated successfully!');
            } else {
                const { data } = await api.post('/users/address', addressForm);
                setUser({ ...user, addresses: data });
                showMessage('success', 'Address added successfully!');
            }
            setAddressMode(false);
            setEditAddressId(null);
            resetAddressForm();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to save address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/users/address/${addressId}`);
            setUser({ ...user, addresses: user.addresses.filter((a) => a._id !== addressId) });
            showMessage('success', 'Address deleted successfully!');
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to delete address');
        }
    };

    const startEditAddress = (address) => {
        setAddressForm({
            name: address.name,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault,
        });
        setEditAddressId(address._id);
        setAddressMode(true);
    };

    const resetAddressForm = () => {
        setAddressForm({
            name: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false,
        });
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container" style={{ marginTop: '120px', padding: 'var(--space-8)' }}>
                <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 'var(--space-4)' }}>Unable to Load Profile</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                        {message.text || 'Please make sure you are logged in.'}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Go to Login
                        </button>
                        <button onClick={fetchProfile} className="btn btn-outline">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '120px', padding: 'var(--space-8) 0', marginBottom: 'var(--space-8)' }}>
            {/* Message Alert */}
            {message.text && (
                <div
                    style={{
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        borderRadius: 'var(--radius-lg)',
                        background: message.type === 'success' ? 'rgba(42, 157, 143, 0.1)' : 'rgba(231, 111, 81, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'var(--accent-teal)' : 'var(--accent-coral)'}`,
                        color: message.type === 'success' ? 'var(--accent-teal)' : 'var(--accent-coral)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}
                >
                    {message.type === 'success' && <FiCheck />}
                    {message.text}
                </div>
            )}

            {/* Profile Header */}
            <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                <div
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-4)',
                        fontSize: 'var(--text-4xl)',
                        color: 'white',
                        fontWeight: '700',
                    }}
                >
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>{user.name}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{user.email}</p>
                {user.role === 'admin' && (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-4)',
                            background: 'var(--gradient-gold)',
                            color: 'var(--brand-primary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600',
                        }}
                    >
                        <FiShield size={14} /> ADMIN
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Personal Information */}
                <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <FiUser /> Personal Info
                        </h2>
                        {!editMode && (
                            <button onClick={() => setEditMode(true)} className="btn btn-outline" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                                <FiEdit2 size={16} /> Edit
                            </button>
                        )}
                    </div>

                    {editMode ? (
                        <form onSubmit={handleProfileUpdate}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Name</label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Email</label>
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Phone</label>
                                <input
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    <FiSave size={16} /> Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                >
                                    <FiX size={16} /> Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                                    <FiUser size={16} />
                                    <span>{user.name}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                                    <FiMail size={16} />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                                    <FiPhone size={16} />
                                    <span>{user.phone || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Stats */}
                <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ marginBottom: 'var(--space-4)' }}>Account Stats</h2>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(42, 157, 143, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-teal)',
                                }}
                            >
                                <FiShoppingBag size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '700' }}>{stats?.totalOrders || 0}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Total Orders</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(201, 160, 80, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--brand-gold)',
                                }}
                            >
                                <FiDollarSign size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '700' }}>₹{stats?.totalSpent?.toFixed(2) || '0.00'}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Total Spent</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(30, 58, 95, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--brand-primary)',
                                }}
                            >
                                <FiCalendar size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>
                                    {new Date(stats?.memberSince).toLocaleDateString()}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Member Since</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <FiLock /> Security
                    </h2>
                    {!passwordMode && (
                        <button onClick={() => setPasswordMode(true)} className="btn btn-outline" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                            Change Password
                        </button>
                    )}
                </div>

                {passwordMode && (
                    <form onSubmit={handlePasswordChange} style={{ maxWidth: '500px' }}>
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                required
                                minLength={6}
                            />
                        </div>
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                required
                                minLength={6}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button type="submit" className="btn btn-primary">
                                <FiSave size={16} /> Update Password
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPasswordMode(false);
                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="btn btn-outline"
                            >
                                <FiX size={16} /> Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Addresses Section */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <FiMapPin /> Saved Addresses
                    </h2>
                    {!addressMode && (
                        <button
                            onClick={() => {
                                setAddressMode(true);
                                setEditAddressId(null);
                                resetAddressForm();
                            }}
                            className="btn btn-primary"
                            style={{ padding: 'var(--space-2) var(--space-4)' }}
                        >
                            <FiPlus size={16} /> Add Address
                        </button>
                    )}
                </div>

                {addressMode && (
                    <form onSubmit={handleAddAddress} style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--space-4)' }}>{editAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Name</label>
                                <input
                                    type="text"
                                    value={addressForm.name}
                                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Phone</label>
                                <input
                                    type="tel"
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Address Line 1</label>
                            <input
                                type="text"
                                value={addressForm.addressLine1}
                                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                required
                            />
                        </div>
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Address Line 2</label>
                            <input
                                type="text"
                                value={addressForm.addressLine2}
                                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>State</label>
                                <input
                                    type="text"
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>Pincode</label>
                                <input
                                    type="text"
                                    value={addressForm.pincode}
                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={addressForm.isDefault}
                                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                />
                                <span>Set as default address</span>
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            <button type="submit" className="btn btn-primary">
                                <FiSave size={16} /> {editAddressId ? 'Update' : 'Save'} Address
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAddressMode(false);
                                    setEditAddressId(null);
                                    resetAddressForm();
                                }}
                                className="btn btn-outline"
                            >
                                <FiX size={16} /> Cancel
                            </button>
                        </div>
                    </form>
                )}

                {user.addresses && user.addresses.length > 0 ? (
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        {user.addresses.map((address) => (
                            <div
                                key={address._id}
                                style={{
                                    padding: 'var(--space-4)',
                                    border: `2px solid ${address.isDefault ? 'var(--brand-gold)' : 'var(--border-light)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    position: 'relative',
                                }}
                            >
                                {address.isDefault && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: 'var(--space-2)',
                                            right: 'var(--space-2)',
                                            padding: 'var(--space-1) var(--space-3)',
                                            background: 'var(--gradient-gold)',
                                            color: 'var(--brand-primary)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-xs)',
                                            fontWeight: '600',
                                        }}
                                    >
                                        DEFAULT
                                    </span>
                                )}
                                <h4 style={{ marginBottom: 'var(--space-2)' }}>{address.name}</h4>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>{address.phone}</p>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                    {address.addressLine1}
                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                                    <button
                                        onClick={() => startEditAddress(address)}
                                        className="btn btn-outline"
                                        style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }}
                                    >
                                        <FiEdit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(address._id)}
                                        className="btn btn-outline"
                                        style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--accent-coral)', borderColor: 'var(--accent-coral)' }}
                                    >
                                        <FiTrash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !addressMode && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--space-8)' }}>
                            No saved addresses. Add your first address to get started.
                        </p>
                    )
                )}
            </div>

            {/* Admin Section */}
            {user.role === 'admin' && (
                <div className="glass-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(201, 160, 80, 0.1) 0%, rgba(30, 58, 95, 0.1) 100%)' }}>
                    <h2 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <FiShield /> Admin Access
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                        You have administrator privileges. Access the admin dashboard to manage products, categories, orders, and users.
                    </p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="btn btn-primary"
                    >
                        Go to Admin Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;
