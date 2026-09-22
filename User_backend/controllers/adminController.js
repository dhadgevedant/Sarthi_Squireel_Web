const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Contact = require("../models/Contact");

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const [userCount, productCount, orderCount, pendingOrders, unresolvedMessages, revenueAgg] =
      await Promise.all([
        User.countDocuments({ isAdmin: false }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: "pending" }),
        Contact.countDocuments({ isResolved: false }),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$grandTotal" } } },
        ]),
      ]);

    res.json({
      userCount,
      productCount,
      orderCount,
      pendingOrders,
      unresolvedMessages,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users
async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({ isAdmin: false }).sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getAllUsers };
