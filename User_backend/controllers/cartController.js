const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// GET /api/cart
async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart  { productId, quantity }
async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((i) => i.product && i.product._id.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.json({ cart: populated });
  } catch (err) {
    next(err);
  }
}

// PUT /api/cart/:productId  { quantity }
async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product && i.product._id.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product && i.product._id.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/:productId
async function removeFromCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i.product && i.product._id.toString() !== req.params.productId);
    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart
async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ cart });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
