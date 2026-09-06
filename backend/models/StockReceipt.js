import mongoose from "mongoose";

/**
 * A batch of cloth received into the shop. Creating one bumps the matching
 * Product's on-hand quantity; deleting one reverses that.
 */
const stockReceiptSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Denormalized so reports/filters don't need a join.
    brand: { type: String, required: true, trim: true },
    volumeNo: { type: String, required: true, trim: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Received quantity must be at least 1"],
    },
    costPrice: {
      type: Number,
      required: [true, "Receive (cost) price is required"],
      min: 0,
    },
    salePrice: {
      type: Number,
      required: [true, "Intended sale price is required"],
      min: 0,
    },
    totalCost: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, maxlength: 300, default: "" },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

stockReceiptSchema.index({ receivedAt: -1 });
stockReceiptSchema.index({ brand: 1, volumeNo: 1 });

const StockReceipt =
  mongoose.models.StockReceipt ||
  mongoose.model("StockReceipt", stockReceiptSchema);

export default StockReceipt;
