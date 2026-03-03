import React, { useState, useEffect } from 'react';
import toast from '../utils/toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CustomDropdown from '../components/common/CustomDropdown';
import {
    FiHelpCircle, FiPlus, FiSend, FiChevronDown, FiChevronUp,
    FiClock, FiCheckCircle, FiAlertCircle, FiX, FiMessageSquare
} from 'react-icons/fi';

const priorityOptions = [
    { value: 'Low', label: '🟢 Low', color: '#10B981' },
    { value: 'Medium', label: '🟡 Medium', color: '#F59E0B' },
    { value: 'High', label: '🔴 High', color: '#EF4444' },
];

const statusConfig = {
    Open: { icon: <FiAlertCircle />, color: '#3B82F6', bg: '#DBEAFE', label: 'Open' },
    'In Progress': { icon: <FiClock />, color: '#F59E0B', bg: '#FEF3C7', label: 'In Progress' },
    Resolved: { icon: <FiCheckCircle />, color: '#10B981', bg: '#D1FAE5', label: 'Resolved' },
    Closed: { icon: <FiX />, color: '#6B7280', bg: '#F3F4F6', label: 'Closed' },
};

const Support = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [replyText, setReplyText] = useState({});
    const [replying, setReplying] = useState({});
    const [form, setForm] = useState({ subject: '', message: '', priority: 'Medium' });

    useEffect(() => {
        if (user) fetchTickets();
    }, [user]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/support');
            setTickets(data);
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.message.trim()) return toast.warn('Please fill in all fields');
        try {
            setSubmitting(true);
            await api.post('/users/support', form);
            setForm({ subject: '', message: '', priority: 'Medium' });
            setShowForm(false);
            fetchTickets();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error submitting ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (ticketId) => {
        const msg = replyText[ticketId];
        if (!msg?.trim()) return toast.warn('Please enter a reply');
        try {
            setReplying(prev => ({ ...prev, [ticketId]: true }));
            const { data } = await api.post(`/users/support/${ticketId}/reply`, { message: msg });
            setTickets(tickets.map(t => t._id === ticketId ? data : t));
            setReplyText(prev => ({ ...prev, [ticketId]: '' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error sending reply');
        } finally {
            setReplying(prev => ({ ...prev, [ticketId]: false }));
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    if (!user) {
        return (
            <div style={{ paddingTop: '20px', minHeight: '100vh' }}>
                <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
                    <FiHelpCircle size={64} color="var(--brand-gold)" />
                    <h2 style={{ marginTop: '20px', color: 'var(--text-primary)' }}>Help & Support</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                        Please <a href="/login" style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>login</a> to raise a support ticket
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '20px', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <div className="container" style={{ maxWidth: '900px', padding: '0 20px 60px' }}>

                {/* Page Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '30px', flexWrap: 'wrap', gap: '16px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiHelpCircle color="var(--brand-gold)" /> Help & Support
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
                            Raise a ticket and we'll get back to you
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: 'var(--gradient-primary)', color: '#fff', border: 'none',
                            padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(139,115,85,0.3)',
                        }}
                        onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                    >
                        <FiPlus size={16} /> New Ticket
                    </button>
                </div>

                {/* New Ticket Form */}
                {showForm && (
                    <div style={{
                        background: 'var(--bg-primary)', borderRadius: '16px', padding: '28px',
                        marginBottom: '30px', border: '1px solid var(--border-light)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
                            📝 Raise a New Ticket
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Subject *</label>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '10px',
                                        border: '1.5px solid var(--border-light)', fontSize: '14px',
                                        outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Priority</label>
                                <CustomDropdown
                                    value={form.priority}
                                    onChange={(val) => setForm({ ...form, priority: val })}
                                    options={priorityOptions.map(p => ({ value: p.value, label: p.label }))}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Message *</label>
                                <textarea
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    rows={5}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '10px',
                                        border: '1.5px solid var(--border-light)', fontSize: '14px',
                                        outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={submitting} style={{
                                    background: 'var(--gradient-primary)', color: '#fff', border: 'none',
                                    padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <FiSend size={14} /> {submitting ? 'Submitting...' : 'Submit Ticket'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} style={{
                                    background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-light)', padding: '12px 28px',
                                    borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tickets List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div style={{
                        background: 'var(--bg-primary)', borderRadius: '16px', padding: '60px 20px',
                        textAlign: 'center', border: '1px solid var(--border-light)',
                    }}>
                        <FiMessageSquare size={48} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                        <h3 style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>No Support Tickets</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
                            Click "New Ticket" to raise your first support request
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tickets.map(ticket => {
                            const isExpanded = expandedId === ticket._id;
                            const sc = statusConfig[ticket.status] || statusConfig.Open;
                            const allReplies = ticket.replies || [];
                            // Include legacy adminReply if no replies array
                            const hasLegacyReply = ticket.adminReply && allReplies.length === 0;

                            return (
                                <div key={ticket._id} style={{
                                    background: 'var(--bg-primary)', borderRadius: '14px',
                                    border: '1px solid var(--border-light)', overflow: 'hidden',
                                    boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
                                    transition: 'box-shadow 0.2s',
                                }}>
                                    {/* Ticket Header */}
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                                        style={{
                                            padding: '18px 20px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{
                                                fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
                                                marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {ticket.subject}
                                            </h4>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {formatDate(ticket.createdAt)}
                                                {allReplies.length > 0 && ` · ${allReplies.length} replies`}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: sc.bg, color: sc.color,
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
                                            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {sc.icon} {sc.label}
                                        </span>
                                        {isExpanded ? <FiChevronUp size={18} color="#9CA3AF" /> : <FiChevronDown size={18} color="#9CA3AF" />}
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div style={{ padding: '20px' }}>
                                            {/* Original Message */}
                                            <div style={{
                                                background: '#F0F4FF', borderRadius: '10px', padding: '14px 16px',
                                                marginBottom: '16px', borderLeft: '3px solid #3B82F6',
                                            }}>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase' }}>
                                                    You · {formatDate(ticket.createdAt)}
                                                </span>
                                                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                    {ticket.message}
                                                </p>
                                            </div>

                                            {/* Legacy admin reply */}
                                            {hasLegacyReply && (
                                                <div style={{
                                                    background: '#F0FFF4', borderRadius: '10px', padding: '14px 16px',
                                                    marginBottom: '16px', borderLeft: '3px solid #10B981',
                                                }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', textTransform: 'uppercase' }}>
                                                        Admin · {ticket.repliedAt ? formatDate(ticket.repliedAt) : ''}
                                                    </span>
                                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                        {ticket.adminReply}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Threaded Replies */}
                                            {allReplies.map((reply, i) => (
                                                <div key={i} style={{
                                                    background: reply.sender === 'admin' ? '#F0FFF4' : '#FFF8F0',
                                                    borderRadius: '10px', padding: '14px 16px',
                                                    marginBottom: '10px',
                                                    borderLeft: `3px solid ${reply.sender === 'admin' ? '#10B981' : '#F59E0B'}`,
                                                }}>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                                                        color: reply.sender === 'admin' ? '#10B981' : '#F59E0B',
                                                    }}>
                                                        {reply.sender === 'admin' ? '🛡️ Admin' : '👤 You'} · {formatDate(reply.createdAt)}
                                                    </span>
                                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                        {reply.message}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Reply Input */}
                                            {ticket.status !== 'Closed' && (
                                                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                    <textarea
                                                        value={replyText[ticket._id] || ''}
                                                        onChange={e => setReplyText(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                                                        placeholder="Write a reply..."
                                                        rows={2}
                                                        style={{
                                                            flex: 1, padding: '12px 14px', borderRadius: '10px',
                                                            border: '1.5px solid var(--border-light)', fontSize: '13px',
                                                            outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleReply(ticket._id)}
                                                        disabled={replying[ticket._id]}
                                                        style={{
                                                            background: 'var(--gradient-primary)', color: '#fff',
                                                            border: 'none', padding: '12px 18px', borderRadius: '10px',
                                                            cursor: replying[ticket._id] ? 'not-allowed' : 'pointer',
                                                            opacity: replying[ticket._id] ? 0.7 : 1,
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <FiSend size={14} /> {replying[ticket._id] ? 'Sending...' : 'Reply'}
                                                    </button>
                                                </div>
                                            )}

                                            {ticket.status === 'Closed' && (
                                                <div style={{
                                                    background: '#F3F4F6', borderRadius: '10px', padding: '14px',
                                                    textAlign: 'center', color: '#6B7280', fontSize: '13px', fontWeight: 500,
                                                    marginTop: '12px',
                                                }}>
                                                    🔒 This ticket is closed
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Support;
