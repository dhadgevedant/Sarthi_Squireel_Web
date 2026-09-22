const mongoose = require("mongoose");

// A weight-band shipping rule, e.g. "0-500g => ₹49", "501-1000g => ₹79".
// Admin can add/edit/delete these from the (future) admin panel via /api/admin/shipping.
const shippingRuleSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true }, // e.g. "Up to 500g"
    minWeightGrams: { type: Number, required: true, min: 0 },
    maxWeightGrams: { type: Number, required: true }, // use a very large number for "and above"
    fee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Free-shipping threshold + fallback fee live in a single settings document
// so the storefront always has one source of truth to read from.
const shippingSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    freeShippingThreshold: { type: Number, default: 0 }, // 0 = disabled
    fallbackFee: { type: Number, default: 79 }, // used if no rule matches the weight
  },
  { timestamps: true }
);

const ShippingRule = mongoose.model("ShippingRule", shippingRuleSchema);
const ShippingSettings = mongoose.model("ShippingSettings", shippingSettingsSchema);

module.exports = { ShippingRule, ShippingSettings };
