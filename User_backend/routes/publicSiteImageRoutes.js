const express = require('express');
const router = express.Router();
const { getPublicSiteImages } = require('../controllers/publicSiteImageController');

router.get('/site-images', getPublicSiteImages);

module.exports = router;
