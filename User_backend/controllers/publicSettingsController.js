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

module.exports = { getPublicSettings };
