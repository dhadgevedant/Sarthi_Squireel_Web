const Contact = require("../models/Contact");

// POST /api/contact  (public — used by the contact.html form)
async function submitContact(req, res, next) {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    const contact = await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({ message: "Thanks for reaching out! We'll get back to you soon.", contact });
  } catch (err) {
    next(err);
  }
}

// GET /api/contact  (admin only)
async function getAllContacts(req, res, next) {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ count: contacts.length, contacts });
  } catch (err) {
    next(err);
  }
}

// PUT /api/contact/:id/resolve  (admin only)
async function markResolved(req, res, next) {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Message not found" });
    res.json({ contact });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact, getAllContacts, markResolved };
