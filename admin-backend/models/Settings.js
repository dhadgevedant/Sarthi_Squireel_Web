const mongoose = require("mongoose");

// Singleton document — there is only ever ONE settings row (key: "main").
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },

    // Top announcement bar shown on every page of the customer site
    announcementText: {
      type: String,
      default: "Pan India delivery · Freshly baked in small batches",
    },

    // Festival / seasonal offer banner shown on the customer home page
    offerEnabled: { type: Boolean, default: false },
    offerTitle: { type: String, default: "Festival Special" },
    offerText: {
      type: String,
      default: "Enjoy a special discount on every product.",
    },
    offerPercent: { type: Number, default: 10, min: 0, max: 100 },
    offerValidTill: { type: Date },
    offerStartIcon: { type: String, default: "" },

    // Checkout / shipping settings
    codEnabled: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 499 },

    // Payment gateway (public key only — never store the secret key here)
    razorpayKeyId: { type: String, default: "" },

    // Contact / footer
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
