const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const messageRoutes = require("./routes/contactRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const publicRoutes = require("./routes/publicRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Product images live inside this project (self-contained, no sibling folders needed).
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

connectDB();

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/messages", messageRoutes);
app.use("/api/admin/subscribers", subscriberRoutes);
app.use("/api/admin/settings", settingsRoutes);

// Public, no-auth API — meant to be consumed by the customer-facing website
// (product catalog, stock check, festival offer / announcement banner).
app.use("/api/public", publicRoutes);

// Redirect root to dashboard (which will handle auth check and redirect to login if needed)
app.get('/', (req, res) => res.redirect('/dashboard.html'));

// Serve the admin frontend (so pages load over http://localhost:5001, same-origin as the API)
app.use(express.static(path.join(__dirname, "..", "admin-frontend")));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Admin Server running on port ${PORT}`);
});
