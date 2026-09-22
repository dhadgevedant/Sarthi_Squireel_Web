const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    source: {
      type: String,
      enum: ["contact_form", "product_inquiry", "order_support", "other"],
      default: "contact_form",
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "resolved", "closed"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    tags: [{ type: String }],
    ipAddress: { type: String },
    userAgent: { type: String },
    readAt: { type: Date },
    repliedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
