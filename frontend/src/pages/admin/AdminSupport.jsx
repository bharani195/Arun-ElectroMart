import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiSend, FiMessageCircle } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css';

const priorityConfig = {
    Low: { bg: '#F3F4F6', color: '#6B7280' },
    Medium: { bg: '#FEF3C7', color: '#92400E' },
    High: { bg: '#FEE2E2', color: '#991B1B' },
};

const statusConfig = {
    Open: { bg: '#DBEAFE', color: '#1E40AF' },
    'In Progress': { bg: '#FEF3C7', color: '#92400E' },
    Resolved: { bg: '#D1FAE5', color: '#065F46' },
    Closed: { bg: '#F3F4F6', color: '#6B7280' },
};

const AdminSupport = () => {
    const [activeTab, setActiveTab] = useState('tickets');
    const [tickets, setTickets] = useState([]);
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [replyText, setReplyText] = useState({});
    const [updating, setUpdating] = useState({});
    const [filter, setFilter] = useState('All');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketRes, chatRes] = await Promise.all([
                api.get('/admin/support'),
                api.get('/admin/chatlogs'),
            ]);
            setTickets(ticketRes.data);
            setChatLogs(chatRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            setUpdating(prev => ({ ...prev, [id]: true }));
            const { data } = await api.put(`/admin/support/${id}`, { status });
            setTickets(tickets.map(t => t._id === id ? data : t));
        } catch (err) {
            alert('Error updating status');
        } finally {
            setUpdating(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleReply = async (id) => {
        const reply = replyText[id];
        if (!reply?.trim()) return alert('Please enter a reply');
        try {
            setUpdating(prev => ({ ...prev, [id]: true }));
            const { data } = await api.put(`/admin/support/${id}`, { adminReply: reply, status: 'In Progress' });
            setTickets(tickets.map(t => t._id === id ? data : t));
            setReplyText(prev => ({ ...prev, [id]: '' }));
        } catch (err) {
            alert('Error sending reply');
        } finally {
            setUpdating(prev => ({ ...prev, [id]: false }));
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const formatTime = (d) => {
        const diff = Date.now() - new Date(d);
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return formatDate(d);
    };

    const filteredTickets = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

    const statusCounts = {
        All: tickets.length,
        Open: tickets.filter(t => t.status === 'Open').length,
        'In Progress': tickets.filter(t => t.status === 'In Progress').length,
        Resolved: tickets.filter(t => t.status === 'Resolved').length,
        Closed: tickets.filter(t => t.status === 'Closed').length,
    };

    if (loading) {
        return (
            <AdminLayout activePage="support">
                <div className="admin-loading" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="support">
            <div className="drb-dashboard">
                <div className="drb-header">
                    <div>
                        <h1 className="drb-title">Customer Support</h1>
                        <p className="drb-subtitle">Manage tickets and view chatbot conversations</p>
                    </div>
                </div>

                {/* Main Tabs: Tickets / Chatbot Logs */}
                <div className="support-main-tabs">
                    <button
                        className={`support-main-tab ${activeTab === 'tickets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tickets')}
                    >
                        <FiMessageSquare size={16} /> Support Tickets
                        <span className="support-tab-badge">{tickets.length}</span>
                    </button>
                    <button
                        className={`support-main-tab ${activeTab === 'chatlogs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chatlogs')}
                    >
                        <FiMessageCircle size={16} /> Chatbot Logs
                        <span className="support-tab-badge">{chatLogs.length}</span>
                    </button>
                </div>

                {/* ============= TICKETS TAB ============= */}
                {activeTab === 'tickets' && (
                    <>
                        <div className="admin-tabs" style={{ marginBottom: '16px' }}>
                            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                                <button key={s} onClick={() => setFilter(s)}
                                    className={`admin-tab ${filter === s ? 'active' : ''}`}>
                                    {s} <span className="admin-tab-count">{statusCounts[s]}</span>
                                </button>
                            ))}
                        </div>

                        {filteredTickets.length === 0 ? (
                            <div className="drb-card">
                                <div className="admin-empty-state">
                                    <FiMessageSquare size={48} />
                                    <h2>No Tickets</h2>
                                    <p>{filter === 'All' ? 'No support tickets yet' : `No ${filter.toLowerCase()} tickets`}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredTickets.map(ticket => {
                                    const isOpen = expandedId === ticket._id;
                                    const pCfg = priorityConfig[ticket.priority] || priorityConfig.Medium;
                                    const sCfg = statusConfig[ticket.status] || statusConfig.Open;
                                    return (
                                        <div key={ticket._id} className="drb-card" style={{ padding: 0 }}>
                                            <div className="support-header" onClick={() => setExpandedId(isOpen ? null : ticket._id)}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 className="support-subject">{ticket.subject}</h4>
                                                    <p className="support-meta">
                                                        {ticket.user?.name || '—'} ({ticket.user?.email}) · {formatDate(ticket.createdAt)}
                                                    </p>
                                                </div>
                                                <span className="drb-status-pill" style={{ background: pCfg.bg, color: pCfg.color }}>{ticket.priority}</span>
                                                <span className="drb-status-pill" style={{ background: sCfg.bg, color: sCfg.color }}>{ticket.status}</span>
                                                {isOpen ? <FiChevronUp size={18} color="#9CA3AF" /> : <FiChevronDown size={18} color="#9CA3AF" />}
                                            </div>

                                            {isOpen && (
                                                <div className="support-body">
                                                    <div className="support-section">
                                                        <label>Customer Message</label>
                                                        <div className="support-message-box">{ticket.message}</div>
                                                    </div>
                                                    {ticket.adminReply && (
                                                        <div className="support-section">
                                                            <label>Your Reply</label>
                                                            <div className="support-reply-box">
                                                                {ticket.adminReply}
                                                                {ticket.repliedAt && (
                                                                    <span className="support-reply-time">Replied {formatDate(ticket.repliedAt)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="support-section">
                                                        <label>Reply to Customer</label>
                                                        <textarea
                                                            value={replyText[ticket._id] || ''}
                                                            onChange={e => setReplyText(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                                                            placeholder="Write your reply..."
                                                            className="rpt-input"
                                                            rows={3}
                                                            style={{ width: '100%', resize: 'vertical' }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                                                            <button className="rpt-btn rpt-btn-primary" onClick={() => handleReply(ticket._id)}
                                                                disabled={updating[ticket._id]}>
                                                                <FiSend size={14} /> {updating[ticket._id] ? 'Sending...' : 'Send Reply'}
                                                            </button>
                                                            <select value={ticket.status}
                                                                onChange={e => handleStatusUpdate(ticket._id, e.target.value)}
                                                                className="rpt-input" disabled={updating[ticket._id]}>
                                                                <option value="Open">Open</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Resolved">Resolved</option>
                                                                <option value="Closed">Closed</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ============= CHATBOT LOGS TAB ============= */}
                {activeTab === 'chatlogs' && (
                    <>
                        {chatLogs.length === 0 ? (
                            <div className="drb-card">
                                <div className="admin-empty-state">
                                    <FiMessageCircle size={48} />
                                    <h2>No Chatbot Logs</h2>
                                    <p>Chatbot conversations will appear here once customers use the chatbot</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {chatLogs.map(log => {
                                    const isOpen = expandedId === log._id;
                                    const userMsgCount = log.messages?.filter(m => m.role === 'user').length || 0;
                                    const customerName = log.user?.name || log.guestName || 'Guest';
                                    const customerEmail = log.user?.email || '';
                                    return (
                                        <div key={log._id} className="drb-card" style={{ padding: 0 }}>
                                            <div className="support-header" onClick={() => setExpandedId(isOpen ? null : log._id)}>
                                                <div className="chatlog-avatar">
                                                    {customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 className="support-subject">{customerName}</h4>
                                                    <p className="support-meta">
                                                        {customerEmail ? `${customerEmail} · ` : ''}{formatTime(log.createdAt)} · {userMsgCount} questions
                                                    </p>
                                                </div>
                                                <span className="drb-status-pill" style={{
                                                    background: log.user ? '#D1FAE5' : '#FEF3C7',
                                                    color: log.user ? '#065F46' : '#92400E',
                                                }}>
                                                    {log.user ? 'Registered' : 'Guest'}
                                                </span>
                                                {isOpen ? <FiChevronUp size={18} color="#9CA3AF" /> : <FiChevronDown size={18} color="#9CA3AF" />}
                                            </div>

                                            {isOpen && (
                                                <div className="support-body">
                                                    <div className="chatlog-conversation">
                                                        {log.messages?.map((msg, i) => (
                                                            <div key={i} className={`chatlog-bubble ${msg.role}`}>
                                                                <span className="chatlog-role">{msg.role === 'user' ? customerName : '🤖 ElectroBot'}</span>
                                                                <p className="chatlog-text">{msg.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSupport;
