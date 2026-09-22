const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactRoutes = require("./routes/contactRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const publicRoutes = require("./routes/publicRoutes");
const publicSiteImageRoutes = require("./routes/publicSiteImageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscribe", subscriberRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/public", publicSiteImageRoutes);

// Serve the customer frontend (so pages load over http://localhost:5000, same-origin as the API).
// Place the User_frontend folder as a SIBLING of this backend folder, e.g.:
//   /squirrelnuts/User_backend
//   /squirrelnuts/User_frontend
// Override with FRONTEND_DIR in .env if you use a different folder name/location.
app.use(express.static(path.join(__dirname, "..", process.env.FRONTEND_DIR || "User_frontend")));

// 404 Handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});