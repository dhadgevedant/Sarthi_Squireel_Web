const { ShippingRule, ShippingSettings } = require("../models/ShippingRule");

async function getSettings() {
  let settings = await ShippingSettings.findOne({ key: "default" });
  if (!settings) settings = await ShippingSettings.create({ key: "default" });
  return settings;
}

// Core calculator used by both the public endpoint and order checkout.
// weightGrams = total weight of everything in the cart, amount = cart subtotal.
async function calculateShippingFee(weightGrams, amount) {
  const settings = await getSettings();

  if (settings.freeShippingThreshold > 0 && amount >= settings.freeShippingThreshold) {
    return { fee: 0, reason: "free_shipping_threshold", threshold: settings.freeShippingThreshold };
  }

  const rules = await ShippingRule.find({ isActive: true }).sort({ minWeightGrams: 1 });
  const match = rules.find(
    (r) => weightGrams >= r.minWeightGrams && weightGrams <= r.maxWeightGrams
  );

  if (match) {
    return { fee: match.fee, reason: "weight_rule", rule: match };
  }

  return { fee: settings.fallbackFee, reason: "fallback" };
}

// GET /api/shipping/calculate?weightGrams=800&amount=450  (public — used by cart page)
async function getCalculatedFee(req, res, next) {
  try {
    const weightGrams = Number(req.query.weightGrams) || 0;
    const amount = Number(req.query.amount) || 0;
    const result = await calculateShippingFee(weightGrams, amount);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/shipping/rules (public — read-only, so the cart page can show a shipping chart)
async function getPublicRules(req, res, next) {
  try {
    const rules = await ShippingRule.find({ isActive: true }).sort({ minWeightGrams: 1 });
    const settings = await getSettings();
    res.json({ rules, freeShippingThreshold: settings.freeShippingThreshold });
  } catch (err) {
    next(err);
  }
}

// ---- Admin ----

// GET /api/admin/shipping
async function getAllRules(req, res, next) {
  try {
    const rules = await ShippingRule.find().sort({ minWeightGrams: 1 });
    const settings = await getSettings();
    res.json({ rules, settings });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/shipping
async function createRule(req, res, next) {
  try {
    const rule = await ShippingRule.create(req.body);
    res.status(201).json({ rule });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/shipping/:id
async function updateRule(req, res, next) {
  try {
    const rule = await ShippingRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) return res.status(404).json({ message: "Shipping rule not found" });
    res.json({ rule });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/shipping/:id
async function deleteRule(req, res, next) {
  try {
    const rule = await ShippingRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: "Shipping rule not found" });
    res.json({ message: "Shipping rule deleted" });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/shipping/settings
async function updateSettings(req, res, next) {
  try {
    const settings = await ShippingSettings.findOneAndUpdate(
      { key: "default" },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateShippingFee,
  getCalculatedFee,
  getPublicRules,
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
  updateSettings,
};
