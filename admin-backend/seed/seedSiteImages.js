require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SiteImage = require("../models/SiteImage");

const siteImages = [
  { key: "logo-mascot", url: "icons/main_home_page_cookie.png", alt: "Squirrel Nuts Logo", belongsTo: "Navbar logo (all pages)", category: "Logo" },
  { key: "logo-favicon", url: "https://squirrelnuts.in/wp-content/uploads/2024/07/cropped-Black-and-Yellow-Grunge-Financial-Logo-270x270.png", alt: "Squirrel Nuts Favicon", belongsTo: "Browser tab icon", category: "Logo" },
  { key: "feature-all-natural", url: "icons/all_natural.png", alt: "All-Natural", belongsTo: "Homepage feature card + About page", category: "Feature" },
  { key: "feature-healthier-alternatives", url: "icons/Healthier Alternatives.png", alt: "Healthier Alternatives", belongsTo: "Homepage feature card + About page", category: "Feature" },
  { key: "feature-small-batch-baked", url: "icons/small-batch-baked.png", alt: "Small-Batch Baked", belongsTo: "Homepage feature card", category: "Feature" },
  { key: "feature-pan-india-delivery", url: "icons/pan_india_delivery_logo.png", alt: "Pan India Delivery", belongsTo: "Homepage feature card + About page", category: "Feature" },
  { key: "feature-guilt-free", url: "icons/Guilt-free.png", alt: "Guilt-Free", belongsTo: "Homepage feature card", category: "Feature" },
  { key: "trust-fssai", url: "icons/fssai_badge.png", alt: "FSSAI Licensed", belongsTo: "Homepage trust badges strip", category: "Trust Badge" },
  { key: "trust-vegetarian", url: "icons/100_percent_vegetarian.png", alt: "100% Vegetarian", belongsTo: "Homepage trust badges strip", category: "Trust Badge" },
  { key: "trust-small-batches", url: "icons/made_in_small_batches_logo.png", alt: "Made in Small Batches", belongsTo: "Homepage trust badges strip", category: "Trust Badge" },
  { key: "social-facebook", url: "icons/Facebook-removebg-preview.png", alt: "Facebook", belongsTo: "Navbar + Footer (all pages)", category: "Social" },
  { key: "social-instagram", url: "icons/Instagram_icon-removebg-preview.png", alt: "Instagram", belongsTo: "Navbar + Footer (all pages)", category: "Social" },
  { key: "admin-avatar", url: "icons/user_profile.png", alt: "Admin Avatar", belongsTo: "Admin dashboard topbar", category: "Admin" },
];

const run = async () => {
  await connectDB();
  try {
    await SiteImage.deleteMany({});
    await SiteImage.insertMany(siteImages);
    console.log(`Seeded ${siteImages.length} site images successfully`);
  } catch (err) {
    console.error("Seeding error:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

run();
