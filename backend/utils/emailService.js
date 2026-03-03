import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Format ₹ currency
const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;

// Format date
const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

/**
 * Send invoice email to customer after Razorpay payment success
 */
export const sendInvoiceEmail = async (order) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️ SMTP not configured — skipping invoice email');
            return;
        }

        const transporter = createTransporter();
        const customerEmail = order.user?.email;
        const customerName = order.user?.name || 'Customer';

        if (!customerEmail) {
            console.log('⚠️ No customer email found — skipping invoice');
            return;
        }

        // Build items rows
        const itemRows = order.items.map((item, i) => `
            <tr style="border-bottom: 1px solid #f0ebe4;">
                <td style="padding: 14px 16px; font-size: 14px; color: #2D2520;">${i + 1}</td>
                <td style="padding: 14px 16px; font-size: 14px; color: #2D2520; font-weight: 500;">${item.name}</td>
                <td style="padding: 14px 16px; font-size: 14px; color: #6B7280; text-align: center;">${item.quantity}</td>
                <td style="padding: 14px 16px; font-size: 14px; color: #6B7280; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 14px 16px; font-size: 14px; color: #2D2520; font-weight: 600; text-align: right;">${formatCurrency(item.subtotal)}</td>
            </tr>
        `).join('');

        const addr = order.shippingAddress || {};
        const addressStr = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');

        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f1eb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff;">

        <!-- Header -->
        <div style="background: #2D2520; padding: 30px 32px; text-align: center;">
            <h1 style="margin: 0; color: #E8AA42; font-size: 24px; font-weight: 700; letter-spacing: 1px;">⚡ ElectroMart</h1>
            <p style="margin: 6px 0 0; color: #d4c5a9; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Invoice</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 32px 32px 16px;">
            <h2 style="margin: 0 0 8px; color: #2D2520; font-size: 20px;">Thank you, ${customerName}! 🎉</h2>
            <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                Your payment was successful. Here's your invoice for order <strong style="color: #2D2520;">#${order.orderNumber}</strong>.
            </p>
        </div>

        <!-- Order Details -->
        <div style="padding: 0 32px 24px;">
            <div style="background: #faf7f2; border-radius: 12px; padding: 20px; display: flex; flex-wrap: wrap; gap: 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border: none;">
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #9CA3AF;">Order Number</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #2D2520; font-weight: 600; text-align: right;">#${order.orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #9CA3AF;">Date</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #2D2520; text-align: right;">${formatDate(order.createdAt)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #9CA3AF;">Payment Method</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #2D2520; text-align: right;">${order.paymentMethod}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #9CA3AF;">Payment Status</td>
                        <td style="padding: 6px 0; font-size: 13px; text-align: right;">
                            <span style="background: #D1FAE5; color: #065F46; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">✅ Paid</span>
                        </td>
                    </tr>
                    ${order.paymentId ? `
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #9CA3AF;">Transaction ID</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #6B7280; text-align: right; font-family: monospace;">${order.paymentId}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
        </div>

        <!-- Items Table -->
        <div style="padding: 0 32px 24px;">
            <h3 style="margin: 0 0 12px; color: #2D2520; font-size: 16px; font-weight: 600;">Items Ordered</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0ebe4; border-radius: 10px; overflow: hidden;">
                <thead>
                    <tr style="background: #faf7f2;">
                        <th style="padding: 12px 16px; font-size: 11px; color: #9CA3AF; text-transform: uppercase; text-align: left; font-weight: 600;">#</th>
                        <th style="padding: 12px 16px; font-size: 11px; color: #9CA3AF; text-transform: uppercase; text-align: left; font-weight: 600;">Product</th>
                        <th style="padding: 12px 16px; font-size: 11px; color: #9CA3AF; text-transform: uppercase; text-align: center; font-weight: 600;">Qty</th>
                        <th style="padding: 12px 16px; font-size: 11px; color: #9CA3AF; text-transform: uppercase; text-align: right; font-weight: 600;">Price</th>
                        <th style="padding: 12px 16px; font-size: 11px; color: #9CA3AF; text-transform: uppercase; text-align: right; font-weight: 600;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div style="padding: 0 32px 28px;">
            <div style="border-top: 2px solid #f0ebe4; padding-top: 16px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Subtotal</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #2D2520; text-align: right;">${formatCurrency(order.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Shipping</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #2D2520; text-align: right;">${order.shippingCharge > 0 ? formatCurrency(order.shippingCharge) : 'Free'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0 0; font-size: 18px; color: #2D2520; font-weight: 700; border-top: 2px solid #2D2520;">Grand Total</td>
                        <td style="padding: 12px 0 0; font-size: 18px; color: #2D2520; font-weight: 700; text-align: right; border-top: 2px solid #2D2520;">${formatCurrency(order.totalAmount)}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Shipping Address -->
        <div style="padding: 0 32px 28px;">
            <h3 style="margin: 0 0 10px; color: #2D2520; font-size: 16px; font-weight: 600;">📦 Shipping Address</h3>
            <div style="background: #faf7f2; border-radius: 10px; padding: 16px;">
                <p style="margin: 0 0 4px; font-size: 14px; color: #2D2520; font-weight: 600;">${addr.name || customerName}</p>
                <p style="margin: 0 0 4px; font-size: 13px; color: #6B7280; line-height: 1.5;">${addressStr}</p>
                ${addr.phone ? `<p style="margin: 0; font-size: 13px; color: #6B7280;">📞 ${addr.phone}</p>` : ''}
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #2D2520; padding: 24px 32px; text-align: center;">
            <p style="margin: 0 0 6px; color: #E8AA42; font-size: 14px; font-weight: 600;">⚡ ElectroMart</p>
            <p style="margin: 0 0 12px; color: #a09080; font-size: 12px;">Premium Electrical Products</p>
            <p style="margin: 0; color: #6B6560; font-size: 11px; line-height: 1.6;">
                Need help? Visit our <a href="#" style="color: #E8AA42; text-decoration: none;">Support Page</a><br>
                This is an automated email. Please do not reply directly.
            </p>
        </div>

    </div>
</body>
</html>`;

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'ElectroMart'}" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `✅ Order Confirmed — #${order.orderNumber} | ElectroMart`,
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Invoice email sent to ${customerEmail} for order #${order.orderNumber}`);

    } catch (error) {
        // Never let email failure break the order flow
        console.error('❌ Failed to send invoice email:', error.message);
    }
};

export default { sendInvoiceEmail };
