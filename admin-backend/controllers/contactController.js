const Message = require("../models/Message");

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markResolved = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMessages, markResolved, deleteMessage };
