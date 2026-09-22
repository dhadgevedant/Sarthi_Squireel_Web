const Subscriber = require("../models/Subscriber");

const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ count: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) return res.status(404).json({ message: "Subscriber not found" });
    res.json({ message: "Subscriber deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllSubscribers, deleteSubscriber };
