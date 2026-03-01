import Activity from '../models/Activity.js';

// Log activity helper function
export const logActivity = async (req, type, description, details = {}) => {
    try {
        const activity = new Activity({
            type,
            user: req.user?._id || null,
            userName: req.user?.name || 'Guest',
            userEmail: req.user?.email || 'N/A',
            description,
            details,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
            isAdmin: req.user?.role === 'admin'
        });
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// @desc    Get all activities (Admin only)
// @route   GET /api/admin/activities
// @access  Private/Admin
export const getActivities = async (req, res) => {
    try {
        const { page = 1, limit = 50, type, startDate, endDate } = req.query;

        let query = {};

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const activities = await Activity.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email');

        const total = await Activity.countDocuments(query);

        res.json({
            activities,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get dashboard stats (Admin only)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Import models
        const User = (await import('../models/User.js')).default;
        const Product = (await import('../models/Product.js')).default;
        const Order = (await import('../models/Order.js')).default;
        const Category = (await import('../models/Category.js')).default;

        // Get counts
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            todayOrders,
            monthOrders,
            recentActivities,
            lowStockProducts,
            pendingOrders
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Product.countDocuments(),
            Order.countDocuments(),
            Category.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ createdAt: { $gte: thisMonth } }),
            Activity.find().sort({ createdAt: -1 }).limit(10),
            Product.find({ stock: { $lte: 10 } }).select('name stock'),
            Order.countDocuments({ orderStatus: 'Pending' })
        ]);

        // Calculate revenue (use totalAmount which exists on the Order model)
        const revenueData = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const monthlyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: thisMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // --- CHART DATA ---

        // 1. Revenue Trend — last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const revenueByMonth = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Fill in missing months with 0
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueTrend = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const found = revenueByMonth.find(r => r._id.year === year && r._id.month === month);
            revenueTrend.push({
                label: monthNames[month - 1],
                revenue: found?.revenue || 0,
                orders: found?.orders || 0
            });
        }

        // 2. Order Status Distribution
        const orderStatusCounts = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 3. Products per Category
        const productsByCategory = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 4. Stock Overview — top products by stock
        const stockOverview = await Product.find({ isActive: true })
            .select('name stock')
            .sort({ stock: -1 })
            .limit(8);

        // Activity breakdown
        const activityBreakdown = await Activity.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 5. Recent Orders (last 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber totalAmount orderStatus paymentMethod createdAt user')
            .populate('user', 'name');

        // 6. Top Products (by stock sold — approximated by reviewCount or just popular ones)
        const topProducts = await Product.find({ isActive: true })
            .sort({ reviewCount: -1, averageRating: -1 })
            .limit(5)
            .select('name price stock brand images');

        res.json({
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalCategories,
                todayOrders,
                monthOrders,
                totalRevenue: revenueData[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                pendingOrders
            },
            lowStockProducts,
            recentActivities,
            activityBreakdown,
            recentOrders,
            topProducts,
            charts: {
                revenueTrend,
                orderStatusCounts,
                productsByCategory,
                stockOverview
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin user' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Log activity
        await logActivity(req, 'admin_action', `Deleted user: ${user.email}`, { userId: user._id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get report data (Admin only)
// @route   GET /api/admin/reports?type=sales&startDate=...&endDate=...
// @access  Private/Admin
export const getReportData = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const User = (await import('../models/User.js')).default;
        const Product = (await import('../models/Product.js')).default;
        const Order = (await import('../models/Order.js')).default;
        const Category = (await import('../models/Category.js')).default;

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
        }
        const hasDateFilter = Object.keys(dateFilter).length > 0;

        if (type === 'sales') {
            const matchStage = hasDateFilter ? { $match: { createdAt: dateFilter } } : { $match: {} };

            const [summary, dailyBreakdown] = await Promise.all([
                Order.aggregate([
                    matchStage,
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$totalAmount' },
                            totalOrders: { $sum: 1 },
                            avgOrderValue: { $avg: '$totalAmount' },
                        }
                    }
                ]),
                Order.aggregate([
                    matchStage,
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            revenue: { $sum: '$totalAmount' },
                            orders: { $sum: 1 },
                        }
                    },
                    { $sort: { _id: 1 } }
                ])
            ]);

            return res.json({
                type: 'sales',
                summary: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
                data: dailyBreakdown
            });
        }

        if (type === 'products') {
            const products = await Product.find()
                .populate('category', 'name')
                .select('name price stock brand category isActive createdAt')
                .sort({ createdAt: -1 });

            return res.json({
                type: 'products',
                data: products.map(p => ({
                    name: p.name,
                    brand: p.brand,
                    price: p.price,
                    stock: p.stock,
                    category: p.category?.name || 'Uncategorized',
                    status: p.isActive ? 'Active' : 'Inactive',
                }))
            });
        }

        if (type === 'customers') {
            const customers = await User.aggregate([
                { $match: { role: 'user' } },
                {
                    $lookup: {
                        from: 'orders',
                        localField: '_id',
                        foreignField: 'user',
                        as: 'orders'
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        createdAt: 1,
                        totalOrders: { $size: '$orders' },
                        totalSpend: { $sum: '$orders.totalAmount' }
                    }
                },
                { $sort: { totalSpend: -1 } }
            ]);

            return res.json({ type: 'customers', data: customers });
        }

        if (type === 'orders') {
            const filter = {};
            if (hasDateFilter) filter.createdAt = dateFilter;

            const orders = await Order.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 });

            return res.json({
                type: 'orders',
                data: orders.map(o => ({
                    orderNumber: o.orderNumber,
                    customer: o.user?.name || '—',
                    email: o.user?.email || '—',
                    items: o.items?.length || 0,
                    subtotal: o.subtotal,
                    shipping: o.shippingCharge,
                    total: o.totalAmount,
                    payment: o.paymentMethod,
                    paymentStatus: o.paymentStatus,
                    status: o.orderStatus,
                    date: o.createdAt,
                }))
            });
        }

        return res.status(400).json({ message: 'Invalid report type' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
