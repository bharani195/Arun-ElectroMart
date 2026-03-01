import React, { useState } from 'react';
import { FiFileText, FiDownload, FiCalendar, FiShoppingCart, FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import './admin.css';

const reportTypes = [
    { key: 'sales', label: 'Sales Report', icon: FiDollarSign, desc: 'Revenue, orders, and daily breakdown', hasDate: true },
    { key: 'products', label: 'Product Report', icon: FiPackage, desc: 'All products with stock and category', hasDate: false },
    { key: 'customers', label: 'Customer Report', icon: FiUsers, desc: 'Customers with order count and spend', hasDate: false },
    { key: 'orders', label: 'Order Report', icon: FiShoppingCart, desc: 'All orders with details and status', hasDate: true },
];

const AdminReports = () => {
    const [selectedType, setSelectedType] = useState('sales');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const selectedReport = reportTypes.find(r => r.key === selectedType);

    const generateReport = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ type: selectedType });
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const { data } = await api.get(`/admin/reports?${params.toString()}`);
            setReportData(data);
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatCurrency = (v) => `₹${(v || 0).toLocaleString()}`;

    // PDF Generation
    const downloadPDF = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(45, 37, 32);
        doc.rect(0, 0, pageWidth, 32, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('ElectroMart', 14, 16);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${selectedReport.label}`, 14, 24);

        // Date range
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        const dateText = startDate || endDate
            ? `Period: ${startDate || 'Start'} to ${endDate || 'End'}`
            : 'All Time';
        doc.text(dateText, pageWidth - 14, 16, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 24, { align: 'right' });

        let yPos = 40;

        if (reportData.type === 'sales') {
            // Summary cards
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

            // Daily breakdown table
            doc.autoTable({
                startY: yPos,
                head: [['Date', 'Revenue', 'Orders']],
                body: reportData.data.map(r => [r._id, formatCurrency(r.revenue), r.orders]),
                theme: 'grid',
                headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                margin: { left: 14, right: 14 },
            });
        }

        if (reportData.type === 'products') {
            doc.autoTable({
                startY: yPos,
                head: [['Product', 'Brand', 'Category', 'Price', 'Stock', 'Status']],
                body: reportData.data.map(p => [p.name, p.brand, p.category, formatCurrency(p.price), p.stock, p.status]),
                theme: 'grid',
                headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                margin: { left: 14, right: 14 },
                columnStyles: { 0: { cellWidth: 45 } },
            });
        }

        if (reportData.type === 'customers') {
            doc.autoTable({
                startY: yPos,
                head: [['Customer', 'Email', 'Total Orders', 'Total Spend', 'Joined']],
                body: reportData.data.map(c => [c.name, c.email, c.totalOrders, formatCurrency(c.totalSpend), formatDate(c.createdAt)]),
                theme: 'grid',
                headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                margin: { left: 14, right: 14 },
            });
        }

        if (reportData.type === 'orders') {
            doc.autoTable({
                startY: yPos,
                head: [['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date']],
                body: reportData.data.map(o => [`#${o.orderNumber}`, o.customer, formatCurrency(o.total), o.payment, o.status, formatDate(o.date)]),
                theme: 'grid',
                headStyles: { fillColor: [45, 123, 108], textColor: 255, fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                margin: { left: 14, right: 14 },
            });
        }

        // Footer
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

    // Table columns per type
    const renderTable = () => {
        if (!reportData) return null;

        if (reportData.type === 'sales') {
            return (
                <>
                    <div className="rpt-summary-row">
                        <div className="rpt-summary-item">
                            <span className="rpt-summary-label">Total Revenue</span>
                            <span className="rpt-summary-value">{formatCurrency(reportData.summary.totalRevenue)}</span>
                        </div>
                        <div className="rpt-summary-item">
                            <span className="rpt-summary-label">Total Orders</span>
                            <span className="rpt-summary-value">{reportData.summary.totalOrders}</span>
                        </div>
                        <div className="rpt-summary-item">
                            <span className="rpt-summary-label">Avg Order Value</span>
                            <span className="rpt-summary-value">{formatCurrency(reportData.summary.avgOrderValue)}</span>
                        </div>
                    </div>
                    <table className="drb-table rpt-table">
                        <thead><tr><th>Date</th><th>Revenue</th><th>Orders</th></tr></thead>
                        <tbody>
                            {reportData.data.map((r, i) => (
                                <tr key={i}><td>{r._id}</td><td className="drb-table-bold">{formatCurrency(r.revenue)}</td><td>{r.orders}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </>
            );
        }

        if (reportData.type === 'products') {
            return (
                <table className="drb-table rpt-table">
                    <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                    <tbody>
                        {reportData.data.map((p, i) => (
                            <tr key={i}>
                                <td className="drb-table-bold">{p.name}</td><td>{p.brand}</td><td>{p.category}</td>
                                <td>{formatCurrency(p.price)}</td><td>{p.stock}</td>
                                <td><span className={`drb-status-pill`} style={{ background: p.status === 'Active' ? '#D1FAE5' : '#FEE2E2', color: p.status === 'Active' ? '#065F46' : '#991B1B' }}>{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (reportData.type === 'customers') {
            return (
                <table className="drb-table rpt-table">
                    <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spend</th><th>Joined</th></tr></thead>
                    <tbody>
                        {reportData.data.map((c, i) => (
                            <tr key={i}>
                                <td className="drb-table-bold">{c.name}</td><td>{c.email}</td><td>{c.totalOrders}</td>
                                <td className="drb-table-bold">{formatCurrency(c.totalSpend)}</td><td className="drb-table-muted">{formatDate(c.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (reportData.type === 'orders') {
            return (
                <table className="drb-table rpt-table">
                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                        {reportData.data.map((o, i) => {
                            const statusMap = {
                                Pending: { bg: '#FEF3C7', color: '#92400E' }, Confirmed: { bg: '#D1FAE5', color: '#065F46' },
                                Processing: { bg: '#DBEAFE', color: '#1E40AF' }, Shipped: { bg: '#EDE9FE', color: '#5B21B6' },
                                Delivered: { bg: '#D1FAE5', color: '#065F46' }, Cancelled: { bg: '#FEE2E2', color: '#991B1B' },
                            };
                            const badge = statusMap[o.status] || { bg: '#F3F4F6', color: '#374151' };
                            return (
                                <tr key={i}>
                                    <td className="drb-table-mono">#{o.orderNumber}</td><td>{o.customer}</td>
                                    <td className="drb-table-bold">{formatCurrency(o.total)}</td><td>{o.payment}</td>
                                    <td><span className="drb-status-pill" style={{ background: badge.bg, color: badge.color }}>{o.status}</span></td>
                                    <td className="drb-table-muted">{formatDate(o.date)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            );
        }

        return null;
    };

    return (
        <AdminLayout activePage="reports">
            <div className="drb-dashboard">
                <div className="drb-header">
                    <div>
                        <h1 className="drb-title">Reports</h1>
                        <p className="drb-subtitle">Generate and download reports for your business</p>
                    </div>
                </div>

                {/* Report Type Selector */}
                <div className="rpt-type-grid">
                    {reportTypes.map(rt => {
                        const Icon = rt.icon;
                        return (
                            <button
                                key={rt.key}
                                className={`rpt-type-card ${selectedType === rt.key ? 'active' : ''}`}
                                onClick={() => { setSelectedType(rt.key); setReportData(null); }}
                            >
                                <Icon size={20} />
                                <span className="rpt-type-label">{rt.label}</span>
                                <span className="rpt-type-desc">{rt.desc}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Filters + Generate */}
                <div className="drb-card" style={{ marginBottom: 16 }}>
                    <div className="rpt-filter-row">
                        {selectedReport.hasDate && (
                            <>
                                <div className="rpt-filter-group">
                                    <label>Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rpt-input" />
                                </div>
                                <div className="rpt-filter-group">
                                    <label>End Date</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rpt-input" />
                                </div>
                            </>
                        )}
                        <button className="rpt-btn rpt-btn-primary" onClick={generateReport} disabled={loading}>
                            <FiFileText size={16} />
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                        {reportData && (
                            <button className="rpt-btn rpt-btn-download" onClick={downloadPDF}>
                                <FiDownload size={16} />
                                Download PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                {reportData && (
                    <div className="drb-card">
                        <div className="drb-card-head">
                            <h3>{selectedReport.label}</h3>
                            <span className="drb-card-tag">{reportData.data?.length || 0} records</span>
                        </div>
                        <div className="drb-table-wrap">
                            {renderTable()}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminReports;
