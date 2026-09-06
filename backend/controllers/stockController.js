import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockReceipt from "../models/StockReceipt.js";
import { resolveRange } from "../utils/dateRange.js";

// GET /stock?period=month&date=&from=&to=&productId=&search=
export const listReceipts = async (req, res) => {
  try {
    const { productId, search, period, date, from, to } = req.query;
    const filter = {};

    if (productId && mongoose.isValidObjectId(productId)) {
      filter.product = productId;
    }
    if (search) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ brand: rx }, { volumeNo: rx }, { note: rx }];
    }
    if (period || date || from || to) {
      const { start, end } = resolveRange({ period, date, from, to });
      filter.receivedAt = { $gte: start, $lte: end };
    }

    const receipts = await StockReceipt.find(filter)
      .sort("-receivedAt")
      .limit(500)
      .lean();

    const totals = receipts.reduce(
      (acc, r) => {
        acc.quantity += r.quantity;
        acc.cost += r.totalCost;
        return acc;
      },
      { quantity: 0, cost: 0 }
    );

    res.json({ success: true, count: receipts.length, totals, receipts });
  } catch (error) {
    console.error("listReceipts error:", error);
    res.status(500).json({ success: false, message: "Could not load receipts" });
  }
};

/**
 * POST /stock  — record cloth received.
 * Body: { brand, volumeNo, quantity, costPrice, salePrice, description?, note?, receivedAt? }
 * Finds or creates the matching Product, then bumps its on-hand quantity and
 * refreshes its current prices.
 */
export const createReceipt = async (req, res) => {
  try {
    const {
      brand,
      volumeNo,
      quantity,
      costPrice,
      salePrice,
      description = "",
      note = "",
      receivedAt,
      lowStockThreshold,
    } = req.body;

    const qty = Number(quantity);
    const cost = Number(costPrice);
    const sale = Number(salePrice);

    if (!brand?.trim() || !volumeNo?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Brand and volume number are required" });
    }
    if (!Number.isFinite(qty) || qty < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(sale) || sale < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Enter valid cost and sale prices" });
    }

    let product = await Product.findOne({
      brand: brand.trim(),
      volumeNo: volumeNo.trim(),
    });

    if (product) {
      product.quantity += qty;
      product.costPrice = cost;
      product.salePrice = sale;
      if (description) product.description = description;
      if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
      await product.save();
    } else {
      product = await Product.create({
        brand: brand.trim(),
        volumeNo: volumeNo.trim(),
        description,
        costPrice: cost,
        salePrice: sale,
        quantity: qty,
        lowStockThreshold,
      });
    }

    const receipt = await StockReceipt.create({
      product: product._id,
      brand: product.brand,
      volumeNo: product.volumeNo,
      quantity: qty,
      costPrice: cost,
      salePrice: sale,
      totalCost: qty * cost,
      note,
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
    });

    res.status(201).json({ success: true, receipt, product });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid data";
      return res.status(400).json({ success: false, message });
    }
    console.error("createReceipt error:", error);
    res.status(500).json({ success: false, message: "Could not record receipt" });
  }
};

// DELETE /stock/:id  — reverses the stock it added (refuses to go negative)
export const deleteReceipt = async (req, res) => {
  try {
    const receipt = await StockReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    const product = await Product.findOneAndUpdate(
      { _id: receipt.product, quantity: { $gte: receipt.quantity } },
      { $inc: { quantity: -receipt.quantity } },
      { new: true }
    );

    if (!product) {
      return res.status(409).json({
        success: false,
        message:
          "Can't delete: some of this stock has already been sold. Adjust the product quantity manually instead.",
      });
    }

    await receipt.deleteOne();
    res.json({ success: true, message: "Receipt reversed", product });
  } catch (error) {
    console.error("deleteReceipt error:", error);
    res.status(500).json({ success: false, message: "Could not delete receipt" });
  }
};
