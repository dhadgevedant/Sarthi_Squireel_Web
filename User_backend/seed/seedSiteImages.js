require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const SiteImage = require('../models/SiteImage');

const siteImages = [
  {
    key: 'home_cookie_image',
    url: 'icons/main_home_page_cookie.png',
    alt: 'Homepage cookie pouch',
    belongsTo: 'Homepage cookie pouch',
    category: 'Homepage',
  },
  {
    key: 'category_cookies',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/09/a-photo-of-cookie-pet-jars-there-is-a-ja_x94Sd3e6RVygDg08IFqaOQ_gOCAAaMqQS2VAlWg_4N41Q-450x450.jpeg',
    alt: 'Cookies',
    belongsTo: 'Homepage category tile - Cookies',
    category: 'Homepage',
  },
  {
    key: 'category_spreads',
    url: 'https://squirrelnuts.in/wp-content/uploads/2025/03/IMG-20250307-WA0004-450x450.jpg',
    alt: 'Spreads & Butters',
    belongsTo: 'Homepage category tile - Spreads & Butters',
    category: 'Homepage',
  },
  {
    key: 'category_bars',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/07/cooik-3.png',
    alt: 'Bars',
    belongsTo: 'Homepage category tile - Bars',
    category: 'Homepage',
  },
  {
    key: 'category_cakes',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/03/protIen-Chocolate-Brownies-450x450.png',
    alt: 'Brownies & Cakes',
    belongsTo: 'Homepage category tile - Brownies & Cakes',
    category: 'Homepage',
  },
  {
    key: 'category_gift_hampers',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/09/a-photo-of-three-jars-labeled-squirrel-n_MBRdVdChSaCW5d9KGsXIPA_WKYhub1RRmmskA1mO9Njhg-450x450.png',
    alt: 'Gift Hampers',
    belongsTo: 'Homepage category tile - Gift Hampers',
    category: 'Homepage',
  },
  {
    key: 'category_trail_mix',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/07/cookies-removebg-preview.png',
    alt: 'Trail Mix & Seeds',
    belongsTo: 'Homepage category tile - Trail Mix & Seeds',
    category: 'Homepage',
  },
  {
    key: 'home_jar_image',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/07/cookies-removebg-preview.png',
    alt: 'Homepage story teaser jar image',
    belongsTo: 'Homepage story teaser — jar image',
    category: 'Homepage',
  },
  {
    key: 'home_protein_image',
    url: 'https://squirrelnuts.in/wp-content/uploads/2024/07/cooik-3.png',
    alt: 'Homepage story teaser protein overlay',
    belongsTo: 'Homepage story teaser — protein overlay',
    category: 'Homepage',
  },
  {
    key: 'story_jar_image',
    url: 'icons/about_us_jar_image.jpeg',
    alt: 'About page jar image',
    belongsTo: 'Our Story page — Why Choose Squirrel Nuts jar image',
    category: 'About Page',
  },
  {
    key: 'story_protein_image',
    url: 'icons/about_us_high_protien_image.jpeg',
    alt: 'About page protein overlay',
    belongsTo: 'Our Story page — Why Choose Squirrel Nuts protein overlay',
    category: 'About Page',
  },
  {
    key: 'about_story_image_main',
    url: 'https://squirrelnuts.in/wp-content/uploads/2025/03/a-jar-filled-with-cashew-cookies-and-van_Z3yke5jZR72gIvI9osyfuA_W96Q6IyOQVyjMyzKob5e-Q-450x360.jpeg',
    alt: 'About story main image',
    belongsTo: 'Homepage about story image',
    category: 'Homepage',
  },
  {
    key: 'about_story_image_over',
    url: 'https://squirrelnuts.in/wp-content/uploads/2025/03/IMG-20250307-WA0005-450x450.jpg',
    alt: 'About story overlay image',
    belongsTo: 'Homepage about story overlay',
    category: 'Homepage',
  },
];

const run = async () => {
  await connectDB();
  try {
    for (const img of siteImages) {
      await SiteImage.updateOne(
        { key: img.key },
        { $setOnInsert: img, $set: { isActive: true } },
        { upsert: true }
      );
    }
    console.log(`Seeded ${siteImages.length} default site image records.`);
  } catch (err) {
    console.error('Seeding site images error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

run();
