const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { calculateShippingFee } = require("./shippingController");

// POST /api/orders  (checkout — builds order from the user's current cart)
async function createOrder(req, res, next) {
  try {
    const { shippingAddress, paymentMethod, items: frontendItems } = req.body;

    // All shipping fields are mandatory (client requirement)
    const requiredFields = ["fullName", "phone", "line1", "city", "state", "pincode"];
    const missing = requiredFields.filter((f) => !shippingAddress || !String(shippingAddress[f] || "").trim());
    if (missing.length) {
      return res.status(400).json({ message: `Missing required shipping field(s): ${missing.join(", ")}` });
    }

    let orderItems = [];
    let totalAmount = 0;
    let totalWeightGrams = 0;
    let cart = null; // only populated when we load the saved cart below

    if (frontendItems && frontendItems.length > 0) {
      const productIds = frontendItems.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds } });

      orderItems = frontendItems.map((i) => {
        const product =
          products.find((p) => p._id.toString() === i.productId) ||
          products.find((p) => p.name.toLowerCase() === i.name?.toLowerCase());
        return {
          product: product?._id || i.productId,
          name: product?.name || i.name || "Unknown",
          image: product?.images?.primary || "",
          price: product?.priceNew || i.price || 0,
          qty: i.qty,
          _weightGrams: product?.weightGrams || 250,
        };
      });
      totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      totalWeightGrams = orderItems.reduce((sum, i) => sum + i._weightGrams * i.qty, 0);
    } else {
      cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }

      orderItems = cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images?.primary || "",
        price: i.product.priceNew || i.product.price,
        qty: i.quantity,
        _weightGrams: i.product.weightGrams || 250,
      }));
      totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      totalWeightGrams = orderItems.reduce((sum, i) => sum + i._weightGrams * i.qty, 0);
    }

    // strip the internal weight field before saving (not part of the Order schema)
    orderItems = orderItems.map(({ _weightGrams, ...rest }) => rest);

    const { fee: shippingFee } = await calculateShippingFee(totalWeightGrams, totalAmount);
    const grandTotal = totalAmount + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      itemsTotal: totalAmount,
      shippingFee,
      grandTotal,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/my
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to view this order" });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders  (admin only — all orders)
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id/status  (admin only)
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
