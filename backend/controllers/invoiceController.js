import mongoose from "mongoose";
import Product from "../models/Product.js";
import Invoice from "../models/Invoice.js";
import Counter from "../models/Counter.js";
import { resolveRange } from "../utils/dateRange.js";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// GET /invoices?period=&date=&from=&to=&search=&limit=
export const listInvoices = async (req, res) => {
  try {
    const { search, period, date, from, to, limit } = req.query;
    const filter = {};

    if (search) {
      const term = search.trim();
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ customerName: rx }, { customerPhone: rx }];
      if (/^\d+$/.test(term)) filter.$or.push({ invoiceNumber: Number(term) });
    }
    if (period || date || from || to) {
      const { start, end } = resolveRange({ period, date, from, to });
      filter.soldAt = { $gte: start, $lte: end };
    }

    const invoices = await Invoice.find(filter)
      .sort("-soldAt")
      .limit(Math.min(Number(limit) || 200, 500))
      .lean();

    const totals = invoices.reduce(
      (acc, inv) => {
        acc.revenue += inv.total;
        acc.profit += inv.profit;
        acc.received += inv.amountReceived;
        acc.count += 1;
        acc.suits += (inv.items || []).reduce((s, it) => s + it.quantity, 0);
        return acc;
      },
      { revenue: 0, profit: 0, received: 0, count: 0, suits: 0 }
    );

    res.json({ success: true, count: invoices.length, totals, invoices });
  } catch (error) {
    console.error("listInvoices error:", error);
    res.status(500).json({ success: false, message: "Could not load invoices" });
  }
};

// GET /invoices/:id
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).lean();
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid invoice id" });
  }
};

/**
 * POST /invoices  — create a bill and reduce stock.
 * Body: {
 *   customerName, customerPhone?, address?, notes?, discount?, amountReceived?,
 *   soldAt?,
 *   items: [{ productId, quantity, rate? }]   // rate defaults to product.salePrice
 * }
 *
 * Stock is decremented with a conditional update per line so two concurrent
 * bills can't oversell; if any line fails, the earlier decrements are rolled
 * back before returning an error.
 */
export const createInvoice = async (req, res) => {
  const applied = []; // { productId, quantity } already decremented
  try {
    const {
      customerName,
      customerPhone = "",
      address = "",
      notes = "",
      discount = 0,
      amountReceived,
      soldAt,
      items,
    } = req.body;

    if (!customerName?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Customer name is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Add at least one item to the bill" });
    }

    // Load every referenced product up front.
    const ids = items.map((it) => it.productId);
    if (ids.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ success: false, message: "Invalid product in items" });
    }
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const lines = [];
    for (const raw of items) {
      const product = byId.get(String(raw.productId));
      if (!product) {
        return res
          .status(400)
          .json({ success: false, message: "One of the items no longer exists" });
      }
      const quantity = Number(raw.quantity);
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Enter a valid quantity for ${product.brand} ${product.volumeNo}`,
        });
      }
      const rate =
        raw.rate !== undefined && raw.rate !== "" && Number.isFinite(Number(raw.rate))
          ? Number(raw.rate)
          : product.salePrice;
      if (rate < 0) {
        return res.status(400).json({
          success: false,
          message: `Rate can't be negative for ${product.brand} ${product.volumeNo}`,
        });
      }

      lines.push({
        product: product._id,
        brand: product.brand,
        volumeNo: product.volumeNo,
        description:
          (raw.description && String(raw.description).trim()) ||
          product.description ||
          `${product.brand} ${product.volumeNo}`,
        quantity,
        rate: round2(rate),
        costPrice: product.costPrice,
        lineTotal: round2(quantity * rate),
      });
    }

    // Reduce stock line by line, guarding against overselling.
    for (const line of lines) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product, quantity: { $gte: line.quantity } },
        { $inc: { quantity: -line.quantity } },
        { new: true }
      );
      if (!updated) {
        await rollback(applied);
        const current = byId.get(String(line.product));
        return res.status(409).json({
          success: false,
          message: `Not enough stock for ${line.brand} ${line.volumeNo} — only ${
            current ? current.quantity : 0
          } left`,
        });
      }
      applied.push({ productId: line.product, quantity: line.quantity });
    }

    const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
    const disc = Math.max(0, round2(Number(discount) || 0));
    const total = round2(Math.max(0, subtotal - disc));
    const grossProfit = lines.reduce(
      (s, l) => s + (l.rate - l.costPrice) * l.quantity,
      0
    );
    const profit = round2(grossProfit - disc);

    const invoiceNumber = await Counter.next("invoice", 1000);

    const invoice = await Invoice.create({
      invoiceNumber,
      customerName: customerName.trim(),
      customerPhone,
      address,
      notes,
      items: lines,
      subtotal,
      discount: disc,
      total,
      amountReceived:
        amountReceived === undefined || amountReceived === ""
          ? total
          : Math.max(0, round2(Number(amountReceived))),
      profit,
      soldAt: soldAt ? new Date(soldAt) : new Date(),
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    await rollback(applied);
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid data";
      return res.status(400).json({ success: false, message });
    }
    console.error("createInvoice error:", error);
    res.status(500).json({ success: false, message: "Could not create the bill" });
  }
};

// DELETE /invoices/:id  — cancels a bill and returns its items to stock
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    await Promise.all(
      invoice.items.map((it) =>
        Product.updateOne({ _id: it.product }, { $inc: { quantity: it.quantity } })
      )
    );
    await invoice.deleteOne();

    res.json({ success: true, message: "Invoice cancelled and stock restored" });
  } catch (error) {
    console.error("deleteInvoice error:", error);
    res.status(500).json({ success: false, message: "Could not delete invoice" });
  }
};

async function rollback(applied) {
  if (!applied.length) return;
  await Promise.all(
    applied.map((a) =>
      Product.updateOne({ _id: a.productId }, { $inc: { quantity: a.quantity } })
    )
  );
  applied.length = 0;
}
