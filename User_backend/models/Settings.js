const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    announcementText: {
      type: String,
      default: "Pan India delivery · Freshly baked in small batches",
    },
    offerEnabled: { type: Boolean, default: false },
    offerTitle: { type: String, default: "Festival Special" },
    offerText: {
      type: String,
      default: "Enjoy a special discount on every product.",
    },
    offerPercent: { type: Number, default: 10, min: 0, max: 100 },
    offerValidTill: { type: Date },
    offerStartIcon: { type: String, default: "" },
    codEnabled: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 499 },
    razorpayKeyId: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    supportEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ key: "main" });
  if (!settings) {
    settings = await this.create({ key: "main" });
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
