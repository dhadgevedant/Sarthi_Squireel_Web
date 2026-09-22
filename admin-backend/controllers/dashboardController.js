const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Message = require("../models/Message");
const Subscriber = require("../models/Subscriber");

const getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      userCount,
      productCount,
      orderCount,
      pendingOrders,
      unresolvedMessages,
      totalRevenueAgg,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      recentOrders,
      subscriberCount,
      dailyOrders,
      weeklyOrders,
      monthlyOrders,
      yearlyOrders,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }).exec(),
      Product.countDocuments().exec(),
      Order.countDocuments().exec(),
      Order.countDocuments({ status: "pending" }).exec(),
      Message.countDocuments({ status: { $ne: "resolved" } }).exec(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]).exec(),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]).exec(),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]).exec(),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]).exec(),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]).exec(),
      Order.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
      Subscriber.countDocuments().exec(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }).exec(),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }).exec(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }).exec(),
      Order.countDocuments({ createdAt: { $gte: startOfYear } }).exec(),
    ]);

    const safeNumber = (v) => (typeof v === 'number' && Number.isFinite(v)) ? v : 0;
    const safeString = (v) => (typeof v === 'string') ? v : (v ? String(v) : '');
    const safeDate = (v) => (v instanceof Date) ? v.toISOString() : (v ? new Date(v).toISOString() : null);

    const response = {
      userCount: safeNumber(userCount),
      productCount: safeNumber(productCount),
      orderCount: safeNumber(orderCount),
      pendingOrders: safeNumber(pendingOrders),
      unresolvedMessages: safeNumber(unresolvedMessages),
      totalRevenue: safeNumber(totalRevenueAgg[0]?.total),
      recentOrders: [],
      analysis: {
        daily: { orders: safeNumber(dailyOrders), revenue: safeNumber(dailyRevenue[0]?.total) },
        weekly: { orders: safeNumber(weeklyOrders), revenue: safeNumber(weeklyRevenue[0]?.total) },
        monthly: { orders: safeNumber(monthlyOrders), revenue: safeNumber(monthlyRevenue[0]?.total) },
        yearly: { orders: safeNumber(yearlyOrders), revenue: safeNumber(yearlyRevenue[0]?.total) },
      },
      subscriberCount: safeNumber(subscriberCount),
    };

    try {
      const leanOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean().exec();
      response.recentOrders = leanOrders.map(o => ({
        _id: safeString(o._id),
        user: typeof o.user === 'object' ? { name: safeString(o.user?.name), email: safeString(o.user?.email) } : safeString(o.user),
        grandTotal: safeNumber(o.grandTotal),
        status: safeString(o.status),
        createdAt: safeDate(o.createdAt),
      }));
    } catch (e) {
      console.error('Recent orders error:', e.message);
    }

    const seen = new WeakSet();
    const cleanJSON = JSON.stringify(response, (key, value) => {
      if (value && typeof value === 'object') {
        if (seen.has(value)) return undefined;
        seen.add(value);
      }
      return value;
    });

    res.send(Buffer.from(cleanJSON));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
