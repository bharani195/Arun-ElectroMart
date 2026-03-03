import React, { useState, useEffect } from 'react';
import { FiDownload, FiShoppingCart, FiPackage, FiUsers, FiDollarSign, FiFileText } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css';

const reportTypes = [
    { key: 'sales', label: 'Sales Report', icon: FiDollarSign, desc: 'Revenue, orders, and daily breakdown' },
    { key: 'products', label: 'Product Report', icon: FiPackage, desc: 'All products with stock and category' },
    { key: 'customers', label: 'Customer Report', icon: FiUsers, desc: 'Customers with order count and spend' },
    { key: 'orders', label: 'Order Report', icon: FiShoppingCart, desc: 'All orders with details and status' },
];

const AdminReports = () => {
    const [selectedType, setSelectedType] = useState('sales');
    const [reports, setReports] = useState({});
    const [loading, setLoading] = useState({});

    useEffect(() => {
        reportTypes.forEach(rt => fetchReport(rt.key));
    }, []);

    const fetchReport = async (type) => {
        try {
            setLoading(prev => ({ ...prev, [type]: true }));
            const { data } = await api.get(`/admin/reports?type=${type}`);
            setReports(prev => ({ ...prev, [type]: data }));
        } catch (error) {
            console.error(`Error fetching ${type} report:`, error);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const reportData = reports[selectedType];
    const selectedReport = reportTypes.find(r => r.key === selectedType);
    const isLoading = loading[selectedType];

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatCurrency = (v) => `₹${(v || 0).toLocaleString()}`;

    // PDF Generation
    const downloadPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFillColor(45, 37, 32);
        doc.rect(0, 0, pageWidth, 32, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('ElectroMart', 14, 16);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(selectedReport.label, 14, 24);
        doc.setTextColor(100);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 24, { align: 'right' });

        let yPos = 40;

        if (reportData.type === 'sales') {
            doc.setTextColor(45, 37, 32);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Summary', 14, yPos);
            yPos += 8;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Revenue: ${formatCurrency(reportData.summary.totalRevenue)}`, 14, yPos);
            doc.text(`Total Orders: ${reportData.summary.totalOrders}`, 90, yPos);
            doc.text(`Avg Order Value: ${formatCurrency(reportData.summary.avgOrderValue)}`, 150, yPos);
            yPos += 12;
            doc.autoTable({ startY: yPos, head: [['Date', 'Revenue', 'Orders']], body: reportData.data.map(r => [r._id, formatCurrency(r.revenue), r.orders]), theme: 'grid', headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: [248, 249, 250] }, margin: { left: 14, right: 14 } });
        }
        if (reportData.type === 'products') {
            doc.autoTable({ startY: yPos, head: [['Product', 'Brand', 'Category', 'Price', 'Stock', 'Status']], body: reportData.data.map(p => [p.name, p.brand, p.category, formatCurrency(p.price), p.stock, p.status]), theme: 'grid', headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [248, 249, 250] }, margin: { left: 14, right: 14 }, columnStyles: { 0: { cellWidth: 45 } } });
        }
        if (reportData.type === 'customers') {
            doc.autoTable({ startY: yPos, head: [['Customer', 'Email', 'Total Orders', 'Total Spend', 'Joined']], body: reportData.data.map(c => [c.name, c.email, c.totalOrders, formatCurrency(c.totalSpend), formatDate(c.createdAt)]), theme: 'grid', headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: [248, 249, 250] }, margin: { left: 14, right: 14 } });
        }
        if (reportData.type === 'orders') {
            doc.autoTable({ startY: yPos, head: [['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date']], body: reportData.data.map(o => [`#${o.orderNumber}`, o.customer, formatCurrency(o.total), o.payment, o.status, formatDate(o.date)]), theme: 'grid', headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [248, 249, 250] }, margin: { left: 14, right: 14 } });
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`ElectroMart — ${selectedReport.label}`, 14, doc.internal.pageSize.getHeight() - 10);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
        doc.save(`ElectroMart_${selectedReport.label.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // Excel Export for a specific report type
    const downloadExcelForType = (type) => {
        const data = reports[type];
        if (!data) return;
        const rt = reportTypes.find(r => r.key === type);
        const sheetName = rt?.label || type;
        let rows = [];

        if (data.type === 'sales') {
            rows = data.data.map(r => ({ Date: r._id, Revenue: r.revenue, Orders: r.orders }));
            rows.push({});
            rows.push({ Date: 'SUMMARY', Revenue: data.summary?.totalRevenue || 0, Orders: data.summary?.totalOrders || 0 });
        } else if (data.type === 'products') {
            rows = data.data.map(p => ({ Product: p.name, Brand: p.brand, Category: p.category, Price: p.price, Stock: p.stock, Status: p.status }));
        } else if (data.type === 'customers') {
            rows = data.data.map(c => ({ Customer: c.name, Email: c.email, 'Total Orders': c.totalOrders, 'Total Spend': c.totalSpend, Joined: formatDate(c.createdAt) }));
        } else if (data.type === 'orders') {
            rows = data.data.map(o => ({ 'Order #': o.orderNumber, Customer: o.customer, Total: o.total, Payment: o.payment, Status: o.status, Date: formatDate(o.date) }));
        }

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const fileName = `ElectroMart_${sheetName.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const link = document.createElement('a');
        link.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbout;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
    };

    const renderTable = () => {
        if (!reportData) return null;
        const emptyRow = (cols, msg) => (
            <tr><td colSpan={cols} style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>{msg}</td></tr>
        );

        if (reportData.type === 'sales') {
            return (
                <table className="drb-table">
                    <thead><tr><th>Date</th><th>Revenue</th><th>Orders</th></tr></thead>
                    <tbody>
                        {reportData.data.length > 0 ? reportData.data.map((r, i) => (
                            <tr key={i}><td>{r._id}</td><td className="drb-table-bold">{formatCurrency(r.revenue)}</td><td>{r.orders}</td></tr>
                        )) : emptyRow(3, 'No sales data found')}
                    </tbody>
                </table>
            );
        }
        if (reportData.type === 'products') {
            return (
                <table className="drb-table">
                    <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                    <tbody>
                        {reportData.data.length > 0 ? reportData.data.map((p, i) => (
                            <tr key={i}>
                                <td className="drb-table-bold">{p.name}</td><td>{p.brand}</td><td>{p.category}</td>
                                <td>{formatCurrency(p.price)}</td><td>{p.stock}</td>
                                <td><span className="drb-status-pill" style={{ background: p.status === 'Active' ? '#D1FAE5' : '#FEE2E2', color: p.status === 'Active' ? '#065F46' : '#991B1B' }}>{p.status}</span></td>
                            </tr>
                        )) : emptyRow(6, 'No products found')}
                    </tbody>
                </table>
            );
        }
        if (reportData.type === 'customers') {
            return (
                <table className="drb-table">
                    <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spend</th><th>Joined</th></tr></thead>
                    <tbody>
                        {reportData.data.length > 0 ? reportData.data.map((c, i) => (
                            <tr key={i}>
                                <td className="drb-table-bold">{c.name}</td><td>{c.email}</td><td>{c.totalOrders}</td>
                                <td className="drb-table-bold">{formatCurrency(c.totalSpend)}</td><td className="drb-table-muted">{formatDate(c.createdAt)}</td>
                            </tr>
                        )) : emptyRow(5, 'No customers found')}
                    </tbody>
                </table>
            );
        }
        if (reportData.type === 'orders') {
            const statusMap = {
                Pending: { bg: '#FEF3C7', color: '#92400E' }, Confirmed: { bg: '#D1FAE5', color: '#065F46' },
                Processing: { bg: '#DBEAFE', color: '#1E40AF' }, Shipped: { bg: '#EDE9FE', color: '#5B21B6' },
                Delivered: { bg: '#D1FAE5', color: '#065F46' }, Cancelled: { bg: '#FEE2E2', color: '#991B1B' },
            };
            return (
                <table className="drb-table">
                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                        {reportData.data.length > 0 ? reportData.data.map((o, i) => {
                            const badge = statusMap[o.status] || { bg: '#F3F4F6', color: '#374151' };
                            return (
                                <tr key={i}>
                                    <td className="drb-table-mono">#{o.orderNumber}</td><td>{o.customer}</td>
                                    <td className="drb-table-bold">{formatCurrency(o.total)}</td><td>{o.payment}</td>
                                    <td><span className="drb-status-pill" style={{ background: badge.bg, color: badge.color }}>{o.status}</span></td>
                                    <td className="drb-table-muted">{formatDate(o.date)}</td>
                                </tr>
                            );
                        }) : emptyRow(6, 'No orders found')}
                    </tbody>
                </table>
            );
        }
        return null;
    };

    // Sales KPI cards (same style as dashboard)
    const salesSummary = reportData?.type === 'sales' ? reportData.summary : null;

    return (
        <AdminLayout activePage="reports">
            <div className="drb-dashboard">
                {/* Header */}
                <div className="drb-header">
                    <div>
                        <h1 className="drb-title">Reports</h1>
                        <p className="drb-subtitle">Real-time business reports from your database</p>
                    </div>
                    {reportData && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="rpt-btn rpt-btn-download" onClick={downloadPDF}>
                                <FiDownload size={16} /> Download PDF
                            </button>
                        </div>
                    )}
                </div>

                {/* KPI Cards - same style as Dashboard */}
                {salesSummary && (
                    <div className="drb-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="drb-kpi-card">
                            <p className="drb-kpi-label">Total Revenue</p>
                            <div className="drb-kpi-row">
                                <span className="drb-kpi-value">{formatCurrency(salesSummary.totalRevenue)}</span>
                            </div>
                            <p className="drb-kpi-compare">From all orders</p>
                        </div>
                        <div className="drb-kpi-card">
                            <p className="drb-kpi-label">Total Orders</p>
                            <div className="drb-kpi-row">
                                <span className="drb-kpi-value">{salesSummary.totalOrders || 0}</span>
                            </div>
                            <p className="drb-kpi-compare">All time</p>
                        </div>
                        <div className="drb-kpi-card">
                            <p className="drb-kpi-label">Avg Order Value</p>
                            <div className="drb-kpi-row">
                                <span className="drb-kpi-value">{formatCurrency(salesSummary.avgOrderValue)}</span>
                            </div>
                            <p className="drb-kpi-compare">Per order average</p>
                        </div>
                    </div>
                )}

                {/* Report Type Tabs */}
                <div className="rpt-type-grid">
                    {reportTypes.map(rt => {
                        const Icon = rt.icon;
                        const data = reports[rt.key];
                        const count = data?.data?.length || 0;
                        return (
                            <button
                                key={rt.key}
                                className={`rpt-type-card ${selectedType === rt.key ? 'active' : ''}`}
                                onClick={() => setSelectedType(rt.key)}
                            >
                                <Icon size={20} />
                                <span className="rpt-type-label">{rt.label}</span>
                                <span className="rpt-type-desc">
                                    {loading[rt.key] ? 'Loading...' : `${count} records`}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Data Table */}
                {isLoading ? (
                    <div className="admin-loading" style={{ minHeight: '300px' }}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : reportData ? (
                    <div className="drb-card">
                        <div className="drb-card-head">
                            <h3>{selectedReport.label}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                                <span className="drb-card-tag">{reportData.data?.length || 0} records</span>
                                <button
                                    className="rpt-btn rpt-btn-download rpt-btn-export-sm"
                                    onClick={() => downloadExcelForType(selectedType)}
                                    title={`Export ${selectedReport.label} to Excel`}
                                >
                                    <FiFileText size={14} /> Export Excel
                                </button>
                            </div>
                        </div>
                        <div className="drb-table-wrap">
                            {renderTable()}
                        </div>
                    </div>
                ) : (
                    <div className="admin-loading" style={{ minHeight: '300px' }}>
                        <p className="drb-empty">No data available</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminReports;
