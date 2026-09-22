const Subscriber = require("../models/Subscriber");

// POST /api/subscribe  (public)
const subscribe = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }
    const subscriber = await Subscriber.create({ email, name });
    res.status(201).json({ message: "Subscribed successfully!", subscriber });
  } catch (err) {
    next(err);
  }
};

// GET /api/subscribe  (admin only)
const getAllSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ count: subscribers.length, subscribers });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe, getAllSubscribers };
