const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const categoryColors = {
  cookies: "#f59e0b",
  spreads: "#8b5cf6",
  bars: "#10b981",
  cakes: "#ec4899",
  trailmix: "#f97316",
  giftbox: "#6366f1",
};

const randomAccent = (color) => {
  const lighter = color + "33";
  return { bg: color, accent: lighter };
};

const createSvg = (product) => {
  const color = categoryColors[product.category] || "#999";
  const { bg, accent } = randomAccent(color);
  const words = (product.name || "Product").split(" ");
  const lines = [];
  let current = "";
  words.forEach((w) => {
    if ((current + " " + w).trim().length <= 12) {
      current = (current + " " + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  });
  if (current) lines.push(current);
  while (lines.length < 2) lines.push("");

  const y1 = 220 - (lines.length - 1) * 30;

  const textElements = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${y1 + i * 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">${line}</text>`
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}" rx="16"/>
  <circle cx="300" cy="180" r="100" fill="${accent}" opacity="0.6"/>
  <text x="50%" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" opacity="0.9">${(product.category || "").toUpperCase()}</text>
  ${textElements}
</svg>`;
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const Product = require("../models/Product");
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      const id = product._id.toString();
      const svg = createSvg(product);
      const filename = `primary-${id}.svg`;
      const outPath = path.join(uploadsDir, filename);
      fs.writeFileSync(outPath, svg);
      product.images.primary = `/uploads/${filename}`;

      if (product.images?.secondary) {
        const secSvg = createSvg({ ...product, name: product.name + " Side" });
        const secFilename = `secondary-${id}.svg`;
        const secPath = path.join(uploadsDir, secFilename);
        fs.writeFileSync(secPath, secSvg);
        product.images.secondary = `/uploads/${secFilename}`;
      }

      await product.save();
      console.log(`Updated: ${product.name}`);
    }

    console.log("Done generating product images");
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
