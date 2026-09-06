import mongoose from "mongoose";

/**
 * A customer bill. Each line snapshots the sale rate AND the cost price at the
 * moment of sale, so profit stays correct forever even if the product's prices
 * change later. Creating an invoice decrements product stock; deleting it
 * (a return / mistake) puts the stock back.
 */
const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    brand: { type: String, required: true },
    volumeNo: { type: String, required: true },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 }, // sale price / unit
    costPrice: { type: Number, required: true, min: 0 }, // snapshot for profit
    lineTotal: { type: Number, required: true, min: 0 }, // quantity * rate
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: Number, unique: true, index: true },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: 120,
    },
    customerPhone: { type: String, trim: true, maxlength: 30, default: "" },
    address: { type: String, trim: true, maxlength: 200, default: "" },
    items: {
      type: [invoiceItemSchema],
      validate: [(v) => v.length > 0, "An invoice needs at least one item"],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    amountReceived: { type: Number, default: 0, min: 0 },
    profit: { type: Number, required: true }, // sum((rate-cost)*qty) - discount
    notes: { type: String, trim: true, maxlength: 300, default: "" },
    soldAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

invoiceSchema.index({ soldAt: -1 });

invoiceSchema.virtual("balance").get(function () {
  return (this.total || 0) - (this.amountReceived || 0);
});

invoiceSchema.virtual("totalQuantity").get(function () {
  return (this.items || []).reduce((sum, it) => sum + it.quantity, 0);
});

invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
