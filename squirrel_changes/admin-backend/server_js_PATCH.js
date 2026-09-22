/**
 * PATCHES for admin-backend/server.js
 *
 * 1. Mount the new category routes
 * 2. Seed default categories on startup
 */

// ── Add near the top with your other require() calls ──
const categoryRoutes = require('./routes/categoryRoutes');
const { seedDefaultCategories } = require('./controllers/categoryController');

// ── Mount the router (add alongside your existing route mounts) ──
app.use('/api/admin/categories', categoryRoutes);

// ── Seed on startup — add inside your mongoose.connect().then() callback ──
mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  await seedDefaultCategories(); // safe to run repeatedly — skips existing slugs
  app.listen(PORT, () => console.log(`Admin server running on port ${PORT}`));
});

/**
 * ALSO: mount the public categories route in User_backend/server.js:
 *
 *   const publicCategoryRoutes = require('./routes/categoryRoutes');
 *   app.use('/api/categories', publicCategoryRoutes);
 */
