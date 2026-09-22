require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const { ShippingRule, ShippingSettings } = require("../models/ShippingRule");

const products = [
  {
    name: "Dark Chocolate Peanut Butter",
    slug: "dark-chocolate-peanut-butter-550g",
    category: "spreads",
    weight: "550g",
    weightGrams: 550,
    priceOld: 449,
    priceNew: 299,
    description:
      "Slow-roasted peanuts churned into silky butter, blended with premium dark chocolate. High protein, no palm oil, no preservatives. Perfect on toast, in smoothies, or straight off the spoon.",
    images: {
      primary: "https://squirrelnuts.in/wp-content/uploads/2025/03/IMG-20250307-WA0004-450x450.jpg",
      secondary: "https://squirrelnuts.in/wp-content/uploads/2025/03/IMG-20250307-WA0005-450x450.jpg",
    },
    isFeatured: true,
  },
  {
    name: "Cashew Delight Cookies",
    slug: "cashew-delight-cookies-200g",
    category: "cookies",
    weight: "200g",
    weightGrams: 200,
    priceOld: 299,
    priceNew: 249,
    description: "Buttery cookies loaded with premium cashews, baked fresh in small batches.",
    images: {
      primary:
        "https://squirrelnuts.in/wp-content/uploads/2025/03/a-jar-filled-with-cashew-cookies-and-van_Z3yke5jZR72gIvI9osyfuA_W96Q6IyOQVyjMyzKob5e-Q-450x360.jpeg",
      secondary:
        "https://squirrelnuts.in/wp-content/uploads/2024/12/protIen-Chocolate-Brownies_20250228_221134_0000-450x450.png",
    },
    isFeatured: true,
  },
  {
    name: "Chocolate Almond Spread",
    slug: "chocolate-almond-spread-550g",
    category: "spreads",
    weight: "550g",
    weightGrams: 550,
    priceOld: 559,
    priceNew: 499,
    description: "Velvety almond spread with real cocoa — no maida, no refined sugar, no palm oil.",
    images: {
      primary: "https://squirrelnuts.in/wp-content/uploads/2024/12/1_20250228_220922_0000-450x450.png",
      secondary:
        "https://squirrelnuts.in/wp-content/uploads/2024/09/a-photo-of-cookie-pet-jars-there-is-a-ja_x94Sd3e6RVygDg08IFqaOQ_gOCAAaMqQS2VAlWg_4N41Q-450x450.jpeg",
    },
    isFeatured: true,
  },
  {
    name: "Chocolate Chip Cookies",
    slug: "chocolate-chip-cookies-200g",
    category: "cookies",
    weight: "200g",
    weightGrams: 200,
    priceOld: 359,
    priceNew: 299,
    description: "Classic choco-chip cookies, baked to perfection with whole wheat flour.",
    images: {
      primary:
        "https://squirrelnuts.in/wp-content/uploads/2024/09/a-photo-of-cookie-pet-jars-there-is-a-ja_x94Sd3e6RVygDg08IFqaOQ_gOCAAaMqQS2VAlWg_4N41Q-450x450.jpeg",
      secondary: "https://squirrelnuts.in/wp-content/uploads/2024/09/Soft-Chocolate-Chip-Cookies-3-450x630.webp",
    },
    isFeatured: true,
  },
  {
    name: "Chocolate Almond Cake",
    slug: "chocolate-almond-cake-300g",
    category: "cakes",
    weight: "300g",
    weightGrams: 300,
    priceOld: 359,
    priceNew: 299,
    description: "Rich chocolate tea cake topped with almonds — a guilt-free indulgence.",
    images: {
      primary:
        "https://squirrelnuts.in/wp-content/uploads/2024/09/a-photo-of-three-jars-labeled-squirrel-n_MBRdVdChSaCW5d9KGsXIPA_WKYhub1RRmmskA1mO9Njhg-450x450.png",
    },
    isFeatured: true,
  },
  {
    name: "Fruity-Delight Cookies",
    slug: "fruity-delight-cookies-200g",
    category: "cookies",
    weight: "200g",
    weightGrams: 200,
    priceOld: null,
    priceNew: 299,
    description: "Cookies with candied fruit jewels — a fun, fruity twist on our classic recipe.",
    images: {
      primary:
        "https://squirrelnuts.in/wp-content/uploads/2024/07/a-plate-of-cookies-with-small-jelly-like-squares-o-A8H3MOHpQruFvbcM-Q7wiQ-0yWDGLh4TUqgjWtb4-mXsw-450x450.jpeg",
    },
    isFeatured: false,
  },
  {
    name: "Double Chocolate Cookies",
    slug: "double-chocolate-cookies-200g",
    category: "cookies",
    weight: "200g",
    weightGrams: 200,
    priceOld: 299,
    priceNew: 249,
    description: "Dark cocoa cookies with chocolate chunks — for the serious chocoholic.",
    images: {
      primary:
        "https://squirrelnuts.in/wp-content/uploads/2024/09/a-photo-of-cookie-pet-jars-there-is-a-ja_Eqr-GmRPTmGFw9WPB5WQ2g_w7IqjfVTR_WVCUUWpwQAHg-450x450.jpeg",
      secondary: "https://squirrelnuts.in/wp-content/uploads/2024/03/protIen-Chocolate-Brownies-450x450.png",
    },
    isFeatured: false,
  },
];

const shippingRules = [
  { label: "Up to 500g", minWeightGrams: 0, maxWeightGrams: 500, fee: 49 },
  { label: "501g – 1kg", minWeightGrams: 501, maxWeightGrams: 1000, fee: 79 },
  { label: "1kg – 2kg", minWeightGrams: 1001, maxWeightGrams: 2000, fee: 119 },
  { label: "Above 2kg", minWeightGrams: 2001, maxWeightGrams: 999999, fee: 179 },
];

const run = async () => {
  await connectDB();
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products successfully`);

    await ShippingRule.deleteMany({});
    await ShippingRule.insertMany(shippingRules);
    await ShippingSettings.findOneAndUpdate(
      { key: "default" },
      { $set: { freeShippingThreshold: 499, fallbackFee: 99 } },
      { upsert: true }
    );
    console.log(`Seeded ${shippingRules.length} shipping rules + settings (free shipping over ₹499)`);
  } catch (err) {
    console.error("Seeding error:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

run();
