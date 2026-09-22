const express = require("express");
const router = express.Router();
const { getCalculatedFee, getPublicRules } = require("../controllers/shippingController");

router.get("/calculate", getCalculatedFee);
router.get("/rules", getPublicRules);

module.exports = router;
