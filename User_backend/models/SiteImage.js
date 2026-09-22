const mongoose = require('mongoose');

const siteImageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '' },
    belongsTo: { type: String, default: '' },
    category: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteImage', siteImageSchema);
