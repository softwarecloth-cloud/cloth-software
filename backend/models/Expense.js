import mongoose from "mongoose";

/**
 * A shop running cost — rent, electricity bill, tea/food, transport, wages,
 * anything the owner spends money on that isn't buying stock (those are
 * StockReceipts). Kept deliberately free-form: `category` is just a label the
 * owner types or picks, so new kinds of expense never need a code change.
 */
const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Expense category is required"],
      trim: true,
      maxlength: 60,
    },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    spentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

expenseSchema.index({ spentAt: -1 });
expenseSchema.index({ category: 1 });

const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
