import React, { useState, useEffect } from 'react';
import toast from '../../utils/toast';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiSend, FiMessageCircle, FiSearch } from 'react-icons/fi';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomDropdown from '../../components/common/CustomDropdown';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async (search = '') => {
        try {
            setLoading(true);
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const [ticketRes, chatRes] = await Promise.all([
                api.get(`/admin/support${params}`),
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

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        fetchData(searchInput);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        fetchData('');
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            setUpdating(prev => ({ ...prev, [id]: true }));
            const { data } = await api.put(`/admin/support/${id}`, { status });
            setTickets(tickets.map(t => t._id === id ? data : t));
        } catch (err) {
            toast.error('Error updating status');
        } finally {
            setUpdating(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleReply = async (id) => {
        const reply = replyText[id];
        if (!reply?.trim()) return toast.warn('Please enter a reply');
        try {
            setUpdating(prev => ({ ...prev, [id]: true }));
            const { data } = await api.put(`/admin/support/${id}`, { adminReply: reply });
            setTickets(tickets.map(t => t._id === id ? data : t));
            setReplyText(prev => ({ ...prev, [id]: '' }));
        } catch (err) {
            toast.error('Error sending reply');
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
                        {/* Search Bar */}
                        <div style={{ marginBottom: '16px' }}>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                    <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={e => setSearchInput(e.target.value)}
                                        placeholder="Search by subject, customer name, or email..."
                                        className="rpt-input"
                                        style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <button type="submit" className="rpt-btn rpt-btn-primary" style={{ padding: '9px 18px' }}>
                                    <FiSearch size={14} /> Search
                                </button>
                                {searchQuery && (
                                    <button type="button" onClick={clearSearch} className="rpt-btn" style={{
                                        padding: '9px 18px', background: '#F3F4F6', color: '#6B7280',
                                        border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                                    }}>
                                        ✕ Clear
                                    </button>
                                )}
                            </form>
                            {searchQuery && (
                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                                    Showing results for "{searchQuery}" — {filteredTickets.length} ticket(s) found
                                </p>
                            )}
                        </div>

                        {/* Status Filter Tabs */}
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
                                    const allReplies = ticket.replies || [];
                                    const hasLegacyReply = ticket.adminReply && allReplies.length === 0;

                                    return (
                                        <div key={ticket._id} className="drb-card" style={{ padding: 0 }}>
                                            <div className="support-header" onClick={() => setExpandedId(isOpen ? null : ticket._id)}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 className="support-subject">{ticket.subject}</h4>
                                                    <p className="support-meta">
                                                        {ticket.user?.name || '—'} ({ticket.user?.email}) · {formatDate(ticket.createdAt)}
                                                        {allReplies.length > 0 && ` · ${allReplies.length} replies`}
                                                    </p>
                                                </div>
                                                <span className="drb-status-pill" style={{ background: pCfg.bg, color: pCfg.color }}>{ticket.priority}</span>
                                                <span className="drb-status-pill" style={{ background: sCfg.bg, color: sCfg.color }}>{ticket.status}</span>
                                                {isOpen ? <FiChevronUp size={18} color="#9CA3AF" /> : <FiChevronDown size={18} color="#9CA3AF" />}
                                            </div>

                                            {isOpen && (
                                                <div className="support-body">
                                                    {/* Original Customer Message */}
                                                    <div style={{
                                                        background: '#F0F4FF', borderRadius: '10px', padding: '14px 16px',
                                                        marginBottom: '12px', borderLeft: '3px solid #3B82F6',
                                                    }}>
                                                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase' }}>
                                                            👤 {ticket.user?.name || 'Customer'} · {formatDate(ticket.createdAt)}
                                                        </span>
                                                        <p style={{ fontSize: '14px', color: '#1F2937', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                            {ticket.message}
                                                        </p>
                                                    </div>

                                                    {/* Legacy admin reply (for old tickets) */}
                                                    {hasLegacyReply && (
                                                        <div style={{
                                                            background: '#F0FFF4', borderRadius: '10px', padding: '14px 16px',
                                                            marginBottom: '12px', borderLeft: '3px solid #10B981',
                                                        }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', textTransform: 'uppercase' }}>
                                                                🛡️ Admin · {ticket.repliedAt ? formatDate(ticket.repliedAt) : ''}
                                                            </span>
                                                            <p style={{ fontSize: '14px', color: '#1F2937', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
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
                                                                {reply.sender === 'admin' ? '🛡️ Admin' : `👤 ${ticket.user?.name || 'Customer'}`} · {formatDate(reply.createdAt)}
                                                            </span>
                                                            <p style={{ fontSize: '14px', color: '#1F2937', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                                {reply.message}
                                                            </p>
                                                        </div>
                                                    ))}

                                                    {/* Admin Reply Input + Status */}
                                                    <div className="support-section" style={{ marginTop: '12px' }}>
                                                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', display: 'block' }}>Reply to Customer</label>
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
                                                            <CustomDropdown
                                                                value={ticket.status}
                                                                onChange={(val) => handleStatusUpdate(ticket._id, val)}
                                                                options={['Open', 'In Progress', 'Resolved', 'Closed']}
                                                                disabled={updating[ticket._id]}
                                                            />
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
