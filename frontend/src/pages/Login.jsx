import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Enter a valid email');
            return;
        }

        // Password validation
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
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
                            <h1 style={{ marginBottom: '0.5rem' }}>Welcome Back</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Login to your AbhiElectromart account</p>
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
                                        placeholder="Enter your password"
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
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                                    <input type="checkbox" />
                                    Remember me
                                </label>
                                <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-color)' }}>
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>

                            <div style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                                    Register Now
                                </Link>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
