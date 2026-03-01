import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiSearch, FiDownload } from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [charts, setCharts] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/dashboard');
            setStats(data.stats);
            setActivities(data.recentActivities || []);
            setCharts(data.charts || null);
            setRecentOrders(data.recentOrders || []);
            setTopProducts(data.topProducts || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const formatTime = (date) => {
        const diff = Date.now() - new Date(date);
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(date).toLocaleDateString();
    };

    // --- CHART: Revenue Area ---
    const revenueData = charts?.revenueTrend ? {
        labels: charts.revenueTrend.map(r => r.label),
        datasets: [
            {
                label: 'Revenue',
                data: charts.revenueTrend.map(r => r.revenue),
                borderColor: '#2D7B6C',
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return 'rgba(45,123,108,0.1)';
                    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    g.addColorStop(0, 'rgba(45,123,108,0.18)');
                    g.addColorStop(1, 'rgba(45,123,108,0.01)');
                    return g;
                },
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2D7B6C',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5,
            },
            {
                label: 'Orders',
                data: charts.revenueTrend.map(r => r.orders * 1000),
                borderColor: '#E8AA42',
                backgroundColor: 'transparent',
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#E8AA42',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                borderDash: [6, 4],
                yAxisID: 'y1',
            }
        ]
    } : null;

    const revenueOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { size: 12, family: 'Inter, sans-serif', weight: '500' },
                    color: '#6B7280'
                }
            },
            tooltip: {
                backgroundColor: '#1F2937',
                titleFont: { family: 'Inter', size: 13, weight: '600' },
                bodyFont: { family: 'Inter', size: 12 },
                padding: 14,
                cornerRadius: 10,
                displayColors: true,
                usePointStyle: true,
                callbacks: {
                    label: (ctx) => {
                        if (ctx.dataset.label === 'Revenue') return ` Revenue: ₹${ctx.raw.toLocaleString()}`;
                        return ` Orders: ${Math.round(ctx.raw / 1000)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#9CA3AF', font: { family: 'Inter', size: 12 } }
            },
            y: {
                position: 'left',
                grid: { color: '#F3F4F6', drawBorder: false },
                border: { display: false },
                ticks: {
                    color: '#9CA3AF',
                    font: { family: 'Inter', size: 11 },
                    callback: (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`,
                    maxTicksLimit: 5
                }
            },
            y1: {
                position: 'right',
                grid: { display: false },
                border: { display: false },
                ticks: { display: false },
            }
        }
    };

    // --- CHART: Order Status Bar ---
    const statusPalette = {
        Pending: '#E8AA42', Confirmed: '#2D7B6C', Processing: '#5B8DEF',
        Shipped: '#9B6BDF', Delivered: '#34D399', Cancelled: '#EF4444'
    };

    const orderBarData = charts?.orderStatusCounts?.length ? {
        labels: charts.orderStatusCounts.map(s => s._id),
        datasets: [{
            label: 'Orders',
            data: charts.orderStatusCounts.map(s => s.count),
            backgroundColor: charts.orderStatusCounts.map(s => statusPalette[s._id] || '#D1D5DB'),
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 22,
        }]
    } : null;

    const orderBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1F2937',
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
                padding: 12,
                cornerRadius: 10,
            }
        },
        scales: {
            x: {
                grid: { color: '#F3F4F6', drawBorder: false },
                border: { display: false },
                ticks: {
                    color: '#9CA3AF',
                    font: { family: 'Inter', size: 11 },
                    stepSize: 1,
                    precision: 0
                }
            },
            y: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: '#4B5563',
                    font: { family: 'Inter', size: 12, weight: '500' },
                    padding: 8
                }
            }
        }
    };

    // Order pipeline for category progress bars
    const categoryBars = charts?.productsByCategory || [];
    const maxCatCount = Math.max(...categoryBars.map(c => c.count), 1);

    // Status badge
    const badgeStyle = (status) => {
        const map = {
            Pending: { bg: '#FEF3C7', color: '#92400E' },
            Confirmed: { bg: '#D1FAE5', color: '#065F46' },
            Processing: { bg: '#DBEAFE', color: '#1E40AF' },
            Shipped: { bg: '#EDE9FE', color: '#5B21B6' },
            Delivered: { bg: '#D1FAE5', color: '#065F46' },
            Cancelled: { bg: '#FEE2E2', color: '#991B1B' },
        };
        return map[status] || { bg: '#F3F4F6', color: '#374151' };
    };

    if (loading) {
        return (
            <AdminLayout activePage="dashboard">
                <div className="admin-loading" style={{ minHeight: '60vh' }}>
                    <div className="loading-spinner"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="dashboard">
            <div className="drb-dashboard">
                {/* Header */}
                <div className="drb-header">
                    <div>
                        <h1 className="drb-title">Dashboard</h1>
                        <p className="drb-subtitle">Here's what's happening with your store today.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="drb-kpi-grid">
                    <div className="drb-kpi-card">
                        <p className="drb-kpi-label">Total Revenue</p>
                        <div className="drb-kpi-row">
                            <span className="drb-kpi-value">₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
                            {stats?.monthlyRevenue > 0 && (
                                <span className="drb-kpi-pill green">
                                    <FiTrendingUp size={12} />
                                    This month
                                </span>
                            )}
                        </div>
                        <p className="drb-kpi-compare">₹{(stats?.monthlyRevenue || 0).toLocaleString()} this month</p>
                    </div>
                    <div className="drb-kpi-card">
                        <p className="drb-kpi-label">Total Orders</p>
                        <div className="drb-kpi-row">
                            <span className="drb-kpi-value">{stats?.totalOrders || 0}</span>
                            {stats?.todayOrders > 0 && (
                                <span className="drb-kpi-pill green">
                                    <FiTrendingUp size={12} />
                                    +{stats.todayOrders} today
                                </span>
                            )}
                        </div>
                        <p className="drb-kpi-compare">{stats?.pendingOrders || 0} pending</p>
                    </div>
                    <div className="drb-kpi-card">
                        <p className="drb-kpi-label">Products</p>
                        <div className="drb-kpi-row">
                            <span className="drb-kpi-value">{stats?.totalProducts || 0}</span>
                            <span className="drb-kpi-pill neutral">{stats?.totalCategories || 0} categories</span>
                        </div>
                        <p className="drb-kpi-compare">Active in store</p>
                    </div>
                    <div className="drb-kpi-card">
                        <p className="drb-kpi-label">Customers</p>
                        <div className="drb-kpi-row">
                            <span className="drb-kpi-value">{stats?.totalUsers || 0}</span>
                        </div>
                        <p className="drb-kpi-compare">Registered users</p>
                    </div>
                </div>

                {/* Row 1: Revenue Chart + Order Status Donut */}
                <div className="drb-grid-row">
                    <div className="drb-card drb-card-lg">
                        <div className="drb-card-head">
                            <h3>Revenue Overview</h3>
                            <span className="drb-card-tag">Last 6 months</span>
                        </div>
                        <div style={{ height: '260px' }}>
                            {revenueData ? (
                                <Line data={revenueData} options={revenueOptions} />
                            ) : (
                                <p className="drb-empty">No revenue data yet</p>
                            )}
                        </div>
                    </div>

                    <div className="drb-card">
                        <div className="drb-card-head">
                            <h3>Order Status</h3>
                            <span className="drb-card-tag">{stats?.totalOrders || 0} total</span>
                        </div>
                        <div style={{ height: '240px' }}>
                            {orderBarData ? (
                                <Bar data={orderBarData} options={orderBarOptions} />
                            ) : (
                                <p className="drb-empty">No orders yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Categories Progress + Recent Orders */}
                <div className="drb-grid-row">
                    <div className="drb-card">
                        <div className="drb-card-head">
                            <h3>Products by Category</h3>
                        </div>
                        <div className="drb-progress-list">
                            {categoryBars.length > 0 ? categoryBars.map((cat, i) => {
                                const colors = ['#2D7B6C', '#5B8DEF', '#E8AA42', '#9B6BDF', '#34D399', '#EF4444'];
                                const color = colors[i % colors.length];
                                return (
                                    <div key={cat.name} className="drb-progress-item">
                                        <div className="drb-progress-info">
                                            <span className="drb-progress-name">{cat.name}</span>
                                            <span className="drb-progress-count">{cat.count} products</span>
                                        </div>
                                        <div className="drb-progress-bar-bg">
                                            <div
                                                className="drb-progress-bar"
                                                style={{ width: `${(cat.count / maxCatCount) * 100}%`, background: color }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            }) : <p className="drb-empty">No categories yet</p>}
                        </div>
                    </div>

                    <div className="drb-card drb-card-lg">
                        <div className="drb-card-head">
                            <h3>Recent Orders</h3>
                            <Link to="/admin/orders" className="drb-link">View All →</Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="drb-table-wrap">
                                <table className="drb-table">
                                    <thead>
                                        <tr>
                                            <th>Order</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => {
                                            const badge = badgeStyle(order.orderStatus);
                                            return (
                                                <tr key={order._id}>
                                                    <td className="drb-table-mono">#{order.orderNumber}</td>
                                                    <td>{order.user?.name || '—'}</td>
                                                    <td className="drb-table-bold">₹{order.totalAmount?.toLocaleString()}</td>
                                                    <td>
                                                        <span className="drb-status-pill" style={{ background: badge.bg, color: badge.color }}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="drb-table-muted">{formatDate(order.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="drb-empty">No orders yet</p>}
                    </div>
                </div>

                {/* Row 3: Top Products + Activity */}
                <div className="drb-grid-row">
                    <div className="drb-card">
                        <div className="drb-card-head">
                            <h3>Top Products</h3>
                            <Link to="/admin/products" className="drb-link">View All →</Link>
                        </div>
                        <div className="drb-products">
                            {topProducts.length > 0 ? topProducts.map((p, i) => (
                                <div key={p._id} className="drb-product-row">
                                    <div className="drb-product-rank">{i + 1}</div>
                                    <img
                                        className="drb-product-thumb"
                                        src={p.images?.[0] || ''}
                                        alt=""
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="drb-product-details">
                                        <span className="drb-product-name">{p.name}</span>
                                        <span className="drb-product-brand">{p.brand} · ₹{p.price?.toLocaleString()}</span>
                                    </div>
                                    <span className="drb-product-stock">{p.stock} in stock</span>
                                </div>
                            )) : <p className="drb-empty">No products</p>}
                        </div>
                    </div>

                    <div className="drb-card">
                        <div className="drb-card-head">
                            <h3>Recent Activity</h3>
                            <Link to="/admin/activities" className="drb-link">View All →</Link>
                        </div>
                        <div className="drb-timeline">
                            {activities.length > 0 ? activities.slice(0, 6).map((a, i) => (
                                <div key={i} className="drb-timeline-item">
                                    <div className="drb-timeline-dot"></div>
                                    <div className="drb-timeline-content">
                                        <p className="drb-timeline-text">{a.description}</p>
                                        <span className="drb-timeline-meta">{a.userName || 'System'} · {formatTime(a.createdAt)}</span>
                                    </div>
                                </div>
                            )) : <p className="drb-empty">No activity</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
