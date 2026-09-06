import mongoose from "mongoose";

// Atomic sequence generator — used for human-friendly invoice numbers.
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

counterSchema.statics.next = async function next(key, start = 0) {
  const doc = await this.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 }, $setOnInsert: {} },
    { new: true, upsert: true }
  );
  return start + doc.seq;
};

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export default Counter;
