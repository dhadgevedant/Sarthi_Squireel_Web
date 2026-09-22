const Settings = require("../models/Settings");

// GET /api/public/settings  (no auth — consumed by the customer-facing site)
const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({
      announcementText: settings.announcementText,
      offerEnabled: settings.offerEnabled,
      offerTitle: settings.offerTitle,
      offerText: settings.offerText,
      offerPercent: settings.offerPercent,
      offerValidTill: settings.offerValidTill,
      offerStartIcon: settings.offerStartIcon || "",
      codEnabled: settings.codEnabled,
      freeShippingThreshold: settings.freeShippingThreshold,
      razorpayKeyId: settings.razorpayKeyId,
      supportPhone: settings.supportPhone,
      supportEmail: settings.supportEmail,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/settings/site  (admin only — includes everything)
const getSiteSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/settings/site  (admin only)
const updateSiteSettings = async (req, res) => {
  try {
    const allowed = [
      "announcementText",
      "offerEnabled",
      "offerTitle",
      "offerText",
      "offerPercent",
      "offerValidTill",
      "offerStartIcon",
      "codEnabled",
      "freeShippingThreshold",
      "razorpayKeyId",
      "supportPhone",
      "supportEmail",
    ];
    const updates = {};
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "main" },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPublicSettings, getSiteSettings, updateSiteSettings };
