import mongoose from "mongoose";

/**
 * A distinct sellable line of cloth in the shop, identified by brand + volume
 * number. `quantity` is the live on-hand stock: stock receipts add to it,
 * invoices subtract from it.
 *
 * `costPrice`  = what the shop paid per suit (receive price)
 * `salePrice`  = default price charged to the customer per suit (sell price)
 * Both are also snapshotted onto each stock receipt / invoice line so past
 * records stay accurate when the current prices change.
 */
const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: 80,
    },
    volumeNo: {
      type: String,
      required: [true, "Volume number is required"],
      trim: true,
      maxlength: 60,
    },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    // Reference photos of the cloth — brand catalogue shots, fabric close-ups,
    // whatever helps identify the design on the shelf. Entirely optional and
    // uploaded straight to Cloudinary from the browser; we only keep the URL and
    // its public_id here. Any image format the browser can produce is allowed.
    images: {
      type: [
        {
          _id: false,
          url: { type: String, required: true, trim: true },
          publicId: { type: String, trim: true, default: "" },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => !Array.isArray(arr) || arr.length <= 12,
        message: "A product can have at most 12 images",
      },
    },
    costPrice: {
      type: Number,
      required: [true, "Receive (cost) price is required"],
      min: [0, "Cost price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
  },
  { timestamps: true }
);

// One inventory row per brand + volume number.
productSchema.index({ brand: 1, volumeNo: 1 }, { unique: true });

productSchema.virtual("stockValue").get(function () {
  return (this.quantity || 0) * (this.costPrice || 0);
});

productSchema.virtual("isLowStock").get(function () {
  return (this.quantity || 0) <= (this.lowStockThreshold ?? 3);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
