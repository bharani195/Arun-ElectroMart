import React, { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiMail, FiPhone, FiCalendar, FiCheck, FiUsers } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.filter(u => u._id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout activePage="users">
                <div className="admin-loading" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="users">
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Registered Users</h1>
                    <p className="admin-page-subtitle">Manage your customer database</p>
                </div>
                <div className="admin-search-wrap" style={{ width: '280px' }}>
                    <FiSearch size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-input with-icon"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact Info</th>
                                <th>Role</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-cell-avatar">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="admin-user-cell-name">{user.name}</p>
                                                    <span className={`admin-badge ${user.role === 'admin' ? 'indigo' : 'gray'}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-user-contact">
                                                <div className="admin-user-contact-item">
                                                    <FiMail size={13} />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="admin-user-contact-item">
                                                        <FiPhone size={13} />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {user.role === 'admin' ? (
                                                <FiCheck size={16} color="#059669" />
                                            ) : (
                                                <FiUsers size={16} color="#9ca3af" />
                                            )}
                                        </td>
                                        <td>
                                            <div className="admin-user-contact-item">
                                                <FiCalendar size={13} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="admin-btn-icon danger"
                                                    title="Delete User"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
