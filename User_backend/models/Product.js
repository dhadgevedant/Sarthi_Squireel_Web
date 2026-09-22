const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    priceOld: { type: Number },
    priceNew: { type: Number, required: true },
    weight: { type: String, default: "" }, // display label, e.g. "550g"
    weightGrams: { type: Number, required: true, default: 250 }, // used for shipping calculation
    images: {
      primary: { type: String, required: true },
      secondary: { type: String },
    },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.virtual("discountPercent").get(function () {
  if (!this.priceOld || this.priceOld <= this.priceNew) return 0;
  return Math.round(((this.priceOld - this.priceNew) / this.priceOld) * 100);
});

// Storefront should show availability, not the exact count (client requirement)
productSchema.virtual("stockStatus").get(function () {
  return this.stock > 0 ? "in_stock" : "out_of_stock";
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
