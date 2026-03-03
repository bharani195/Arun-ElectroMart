import React, { useState, useEffect } from 'react';
import toast from '../../utils/toast';
import {
    FiPackage, FiShoppingCart, FiChevronDown, FiChevronUp,
    FiMapPin, FiCreditCard, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiDownload,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../utils/api';
import AdminLayout from '../../components/layout/AdminLayout';
import CustomDropdown from '../../components/common/CustomDropdown';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [statusFilter, setStatusFilter] = useState('All');
    const [updatingStatus, setUpdatingStatus] = useState({});

    const statusOptions = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
    const filterOptions = ['All', ...statusOptions];

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders/admin/all');
            setOrders(data.orders || data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error loading orders: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleOrderExpand = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) newExpanded.delete(orderId);
        else newExpanded.add(orderId);
        setExpandedOrders(newExpanded);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingStatus({ ...updatingStatus, [orderId]: true });
            const { data: updatedOrder } = await api.put(`/orders/admin/${orderId}/status`, { orderStatus: newStatus });
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, orderStatus: updatedOrder.orderStatus, paymentStatus: updatedOrder.paymentStatus } : order
            ));
            toast.success('Order status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status: ' + (error.response?.data?.message || error.message));
        } finally {
            setUpdatingStatus({ ...updatingStatus, [orderId]: false });
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            Pending: 'amber', Confirmed: 'blue',
            Delivered: 'green', Cancelled: 'red',
        };
        return map[status] || 'gray';
    };

    const getStatusIcon = (status) => {
        const icons = {
            Pending: FiClock, Confirmed: FiCheckCircle,
            Delivered: FiCheckCircle, Cancelled: FiXCircle,
        };
        const Icon = icons[status] || FiPackage;
        return <Icon size={14} />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    // --- Invoice PDF Generation ---
    const generateInvoice = (order) => {
        const doc = new jsPDF();
        const pw = doc.internal.pageSize.getWidth();
        const ph = doc.internal.pageSize.getHeight();
        const margin = 14;

        // ==================== HEADER ====================
        // Dark brown header background
        doc.setFillColor(45, 37, 32);
        doc.rect(0, 0, pw, 42, 'F');

        // Gold accent bar
        doc.setFillColor(201, 160, 80);
        doc.rect(0, 42, pw, 3, 'F');

        // Store name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('AbhiElectroMart', margin, 20);

        // Store tagline
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(201, 160, 80);
        doc.text('Premium Electrical Products', margin, 28);

        // Store contact in header
        doc.setFontSize(7);
        doc.setTextColor(200, 200, 200);
        doc.text('Kavindapadi, Erode - 638455 | +91 6379777230 | arunum.24mca@kongu.edu', margin, 36);

        // INVOICE label on right
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('TAX INVOICE', pw - margin, 18, { align: 'right' });

        // Invoice number & date
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(201, 160, 80);
        doc.text(`Invoice #: INV-${order.orderNumber}`, pw - margin, 28, { align: 'right' });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pw - margin, 36, { align: 'right' });

        // ==================== BILL TO & ORDER INFO ====================
        let y = 54;

        // Bill To Box
        doc.setFillColor(250, 248, 244);
        doc.setDrawColor(220, 210, 195);
        doc.roundedRect(margin, y, (pw - margin * 2) / 2 - 5, 40, 2, 2, 'FD');

        doc.setTextColor(139, 115, 85);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO', margin + 5, y + 8);

        doc.setTextColor(45, 37, 32);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(order.shippingAddress?.name || 'Customer', margin + 5, y + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        let billY = y + 22;
        if (order.shippingAddress?.phone) {
            doc.text(`Phone: ${order.shippingAddress.phone}`, margin + 5, billY); billY += 5;
        }
        if (order.shippingAddress?.addressLine1) {
            doc.text(order.shippingAddress.addressLine1, margin + 5, billY); billY += 5;
        }
        const cityLine = [order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ');
        if (cityLine) doc.text(cityLine, margin + 5, billY);

        // Order Details Box
        const rightBoxX = pw / 2 + 5;
        doc.setFillColor(250, 248, 244);
        doc.setDrawColor(220, 210, 195);
        doc.roundedRect(rightBoxX, y, (pw - margin * 2) / 2 - 5, 40, 2, 2, 'FD');

        doc.setTextColor(139, 115, 85);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDER DETAILS', rightBoxX + 5, y + 8);

        doc.setTextColor(45, 37, 32);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Order #: ${order.orderNumber}`, rightBoxX + 5, y + 16);
        doc.text(`Payment: ${order.paymentMethod?.toUpperCase() || 'COD'}`, rightBoxX + 5, y + 23);
        doc.text(`Status: ${order.orderStatus}`, rightBoxX + 5, y + 30);

        // Status badge
        if (order.orderStatus === 'Confirmed' || order.orderStatus === 'Delivered') {
            doc.setFillColor(34, 139, 34);
            doc.roundedRect(rightBoxX + 50, y + 26, 22, 6, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.text('PAID', rightBoxX + 56, y + 30.5);
        }

        y = 102;

        // ==================== ITEMS TABLE ====================
        // Section label
        doc.setTextColor(139, 115, 85);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDER ITEMS', margin, y);
        y += 4;

        let tableEndY = y + 30;
        autoTable(doc, {
            startY: y,
            head: [['#', 'Product', 'Qty', 'Unit Price', 'Amount']],
            body: order.items.map((item, i) => [
                i + 1,
                item.name,
                item.quantity,
                `Rs.${item.price.toLocaleString()}`,
                `Rs.${item.subtotal.toLocaleString()}`
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: [45, 37, 32],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                cellPadding: 4,
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [45, 37, 32],
            },
            alternateRowStyles: {
                fillColor: [250, 248, 244],
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
            },
            margin: { left: margin, right: margin },
            didDrawPage: (data) => {
                tableEndY = data.cursor.y;
            },
        });

        y = tableEndY + 8;

        // ==================== TOTALS SECTION ====================
        const rx = pw - margin;
        const lx = pw - 90;

        // Totals background box
        doc.setFillColor(250, 248, 244);
        doc.setDrawColor(220, 210, 195);
        doc.roundedRect(lx - 5, y - 3, rx - lx + 10, 42, 2, 2, 'FD');

        const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.subtotal, 0);
        const shipping = order.shippingCharge || 0;
        const gst = Math.round(subtotal * 0.18);
        const total = order.totalAmount;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Subtotal:', lx, y + 5); doc.text(`Rs.${subtotal.toLocaleString()}`, rx, y + 5, { align: 'right' });
        doc.text('Shipping:', lx, y + 12); doc.text(`Rs.${shipping.toLocaleString()}`, rx, y + 12, { align: 'right' });
        doc.text('GST (18%):', lx, y + 19); doc.text(`Rs.${gst.toLocaleString()}`, rx, y + 19, { align: 'right' });

        // Divider line
        doc.setDrawColor(201, 160, 80);
        doc.setLineWidth(0.5);
        doc.line(lx, y + 23, rx, y + 23);

        // Grand total
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 37, 32);
        doc.text('GRAND TOTAL:', lx, y + 32);
        doc.setTextColor(139, 115, 85);
        doc.text(`Rs.${total.toLocaleString()}`, rx, y + 32, { align: 'right' });

        y = y + 50;

        // ==================== TERMS & CONDITIONS ====================
        doc.setDrawColor(220, 210, 195);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pw - margin, y);
        y += 8;

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('TERMS & CONDITIONS:', margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text('1. Products must be returned within 7 days of delivery in original packaging.', margin, y); y += 4;
        doc.text('2. Warranty as per manufacturer terms. Keep this invoice for warranty claims.', margin, y); y += 4;
        doc.text('3. For any queries, contact us at arunum.24mca@kongu.edu or +91 6379777230.', margin, y);

        // ==================== FOOTER ====================
        // Gold bar at bottom
        doc.setFillColor(201, 160, 80);
        doc.rect(0, ph - 18, pw, 18, 'F');

        doc.setTextColor(45, 37, 32);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank you for shopping with AbhiElectroMart!', pw / 2, ph - 11, { align: 'center' });

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('This is a computer-generated invoice and does not require a signature.', pw / 2, ph - 5, { align: 'center' });

        // Open PDF in new tab for viewing and printing
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
    };

    const filteredOrders = statusFilter === 'All' ? orders : orders.filter(o => o.orderStatus === statusFilter);

    const getStatusCounts = () => {
        const counts = { All: orders.length };
        statusOptions.forEach(s => { counts[s] = orders.filter(o => o.orderStatus === s).length; });
        return counts;
    };
    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <AdminLayout activePage="orders">
                <div className="admin-loading" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activePage="orders">
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Order Management</h1>
                    <p className="admin-page-subtitle">Manage and track all customer orders</p>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="admin-tabs">
                {filterOptions.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`admin-tab ${statusFilter === status ? 'active' : ''}`}
                    >
                        {status}
                        <span className="admin-tab-count">{statusCounts[status]}</span>
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="admin-card">
                    <div className="admin-empty-state">
                        <FiShoppingCart size={56} />
                        <h2>No Orders Found</h2>
                        <p>{statusFilter === 'All' ? 'No orders have been placed yet.' : `No ${statusFilter.toLowerCase()} orders.`}</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredOrders.map((order) => {
                        const isExpanded = expandedOrders.has(order._id);
                        return (
                            <div key={order._id} className="admin-order-card">
                                {/* Order Header */}
                                <div className="admin-order-header" onClick={() => toggleOrderExpand(order._id)}
                                    style={{ paddingBottom: isExpanded ? '20px' : '0', borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none' }}>
                                    <div>
                                        <div className="admin-order-number">
                                            <FiPackage size={16} color="#8b7355" />
                                            #{order.orderNumber}
                                        </div>
                                        <p className="admin-order-customer">{order.user?.name || 'Unknown Customer'}</p>
                                    </div>
                                    <div>
                                        <p className="admin-order-label">Order Date</p>
                                        <p className="admin-order-value">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <span className={`admin-badge ${getStatusBadge(order.orderStatus)}`}>
                                            {getStatusIcon(order.orderStatus)} {order.orderStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="admin-order-label">Payment</p>
                                        <p className="admin-order-value">{order.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="admin-order-label">Total</p>
                                        <p className="admin-order-total">₹{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <button
                                        className="admin-invoice-btn"
                                        onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                                        title="Download Invoice"
                                    >
                                        <FiDownload size={14} /> Invoice
                                    </button>
                                </div>

                                {/* Order Details */}
                                {isExpanded && (
                                    <div className="admin-order-details">
                                        {/* Order Items */}
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                                                Order Items ({order.items.length})
                                            </h4>
                                            {order.items.map((item, index) => (
                                                <div key={index} className="admin-order-item">
                                                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                                                    <div>
                                                        <p className="admin-order-item-name">{item.name}</p>
                                                        <p className="admin-order-item-qty">
                                                            Qty: {item.quantity} × ₹{item.price.toLocaleString()} = ₹{item.subtotal.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="admin-detail-section">
                                            <h4 className="admin-detail-title">Update Status</h4>
                                            <CustomDropdown
                                                value={order.orderStatus}
                                                onChange={(val) => handleStatusUpdate(order._id, val)}
                                                options={statusOptions}
                                                disabled={updatingStatus[order._id]}
                                            />
                                        </div>

                                        {/* Shipping Address */}
                                        <div className="admin-detail-section">
                                            <h4 className="admin-detail-title">
                                                <FiMapPin size={14} color="#4f46e5" /> Shipping Address
                                            </h4>
                                            <div className="admin-detail-box">
                                                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{order.shippingAddress.name}</p>
                                                <p style={{ marginBottom: '4px' }}>{order.shippingAddress.phone}</p>
                                                <p>
                                                    {order.shippingAddress.addressLine1}
                                                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                    <br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment */}
                                        <div className="admin-detail-section">
                                            <h4 className="admin-detail-title">
                                                <FiCreditCard size={14} color="#4f46e5" /> Payment
                                            </h4>
                                            <div className="admin-detail-box">
                                                <div className="admin-detail-row">
                                                    <span>Method</span>
                                                    <span>{order.paymentMethod}</span>
                                                </div>
                                                <div className="admin-detail-row">
                                                    <span>Payment Status</span>
                                                    <span style={{ color: order.paymentStatus === 'Paid' ? '#5a7a5a' : '#b8860b' }}>
                                                        {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
