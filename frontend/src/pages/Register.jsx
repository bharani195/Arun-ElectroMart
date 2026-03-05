import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await register(formData.name, formData.email, formData.password, formData.phone);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--gray-50)', minHeight: 'calc(100vh - 400px)', padding: '3rem 0' }}>
            <div className="container">
                <div className="auth-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h1 style={{ marginBottom: '0.5rem' }}>Create Account</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Join AbhiElectromart for exclusive deals</p>
                        </div>

                        {error && (
                            <div
                                style={{
                                    background: '#fee',
                                    color: 'var(--error)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1.5rem',
                                    fontSize: 'var(--font-size-sm)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-light)',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-light)',
                                        }}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <FiPhone
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-light)',
                                        }}
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-light)',
                                        }}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="form-input"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-light)',
                                        }}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                    Must be at least 6 characters
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-light)',
                                        }}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        className="form-input"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                                    <input type="checkbox" required style={{ marginTop: '0.25rem' }} />
                                    <span>
                                        I agree to the{' '}
                                        <Link to="/terms" style={{ color: 'var(--primary-color)' }}>
                                            Terms & Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy" style={{ color: 'var(--primary-color)' }}>
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                                    Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
