const SiteImage = require('../models/SiteImage');

const getPublicSiteImages = async (req, res) => {
  try {
    const images = await SiteImage.find({ isActive: true }).sort({ key: 1 });
    const map = images.reduce((acc, img) => {
      let url = img.url || '';
      if (/^https?:\/\/[\w.-]+:\d+\/uploads\//i.test(url)) {
        const pathPart = url.replace(/^https?:\/\/[\w.-]+:\d+/i, '');
        url = pathPart;
      }
      acc[img.key] = url;
      return acc;
    }, {});
    res.json({ images: map });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPublicSiteImages };
