import Invoice from "../models/Invoice.js";
import StockReceipt from "../models/StockReceipt.js";
import Product from "../models/Product.js";
import { resolveRange } from "../utils/dateRange.js";

/**
 * GET /reports/dashboard?period=day|month|year&date=YYYY-MM-DD
 *
 * Everything the dashboard needs in one round trip:
 *  - sales, profit, invoice count, suits sold for the selected period
 *  - cloth received (qty + cost) for the period
 *  - current stock position (all-time): units, cost value, retail value, low stock
 *  - a per-bucket breakdown for charting (day buckets for day/month, month for year)
 *  - top selling products in the period
 *  - the most recent invoices
 */
export const dashboard = async (req, res) => {
  try {
    const { period = "month", date, from, to } = req.query;
    const { start, end, period: resolved } = resolveRange({ period, date, from, to });

    const bucketUnit = resolved === "year" ? "month" : "day";
    const bucketFormat = resolved === "year" ? "%Y-%m" : "%Y-%m-%d";

    const [salesAgg, receiptAgg, products, breakdown, topProducts, recentInvoices] =
      await Promise.all([
        Invoice.aggregate([
          { $match: { soldAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$total" },
              profit: { $sum: "$profit" },
              received: { $sum: "$amountReceived" },
              invoices: { $sum: 1 },
              suits: { $sum: { $sum: "$items.quantity" } },
              discount: { $sum: "$discount" },
            },
          },
        ]),
        StockReceipt.aggregate([
          { $match: { receivedAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: null,
              quantity: { $sum: "$quantity" },
              cost: { $sum: "$totalCost" },
              batches: { $sum: 1 },
            },
          },
        ]),
        Product.find().lean(),
        Invoice.aggregate([
          { $match: { soldAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: { $dateToString: { format: bucketFormat, date: "$soldAt" } },
              revenue: { $sum: "$total" },
              profit: { $sum: "$profit" },
              invoices: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Invoice.aggregate([
          { $match: { soldAt: { $gte: start, $lte: end } } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              brand: { $first: "$items.brand" },
              volumeNo: { $first: "$items.volumeNo" },
              quantity: { $sum: "$items.quantity" },
              revenue: { $sum: "$items.lineTotal" },
              profit: {
                $sum: {
                  $multiply: [
                    { $subtract: ["$items.rate", "$items.costPrice"] },
                    "$items.quantity",
                  ],
                },
              },
            },
          },
          { $sort: { quantity: -1 } },
          { $limit: 5 },
        ]),
        Invoice.find().sort("-soldAt").limit(6).lean(),
      ]);

    const sales = salesAgg[0] || {
      revenue: 0,
      profit: 0,
      received: 0,
      invoices: 0,
      suits: 0,
      discount: 0,
    };
    const received = receiptAgg[0] || { quantity: 0, cost: 0, batches: 0 };

    const stock = products.reduce(
      (acc, p) => {
        acc.units += p.quantity;
        acc.costValue += p.quantity * p.costPrice;
        acc.retailValue += p.quantity * p.salePrice;
        acc.skus += 1;
        if (p.quantity <= (p.lowStockThreshold ?? 3)) acc.lowStock.push(p);
        return acc;
      },
      { units: 0, costValue: 0, retailValue: 0, skus: 0, lowStock: [] }
    );

    res.json({
      success: true,
      range: { start, end, period: resolved, bucketUnit },
      sales: {
        revenue: sales.revenue,
        profit: sales.profit,
        received: sales.received,
        outstanding: sales.revenue - sales.received,
        invoices: sales.invoices,
        suitsSold: sales.suits,
        discount: sales.discount,
        avgInvoice: sales.invoices ? sales.revenue / sales.invoices : 0,
      },
      received: {
        quantity: received.quantity,
        cost: received.cost,
        batches: received.batches,
      },
      stock: {
        units: stock.units,
        costValue: stock.costValue,
        retailValue: stock.retailValue,
        potentialProfit: stock.retailValue - stock.costValue,
        skus: stock.skus,
        lowStockCount: stock.lowStock.length,
        lowStock: stock.lowStock
          .sort((a, b) => a.quantity - b.quantity)
          .slice(0, 8),
      },
      breakdown: breakdown.map((b) => ({
        key: b._id,
        revenue: b.revenue,
        profit: b.profit,
        invoices: b.invoices,
      })),
      topProducts,
      recentInvoices,
    });
  } catch (error) {
    console.error("dashboard error:", error);
    res.status(500).json({ success: false, message: "Could not build the dashboard" });
  }
};

/**
 * GET /reports/profit?period=day|month|year&date=
 * Compact profit figures for the three headline periods around a date, so the
 * UI can show "today / this month / this year" side by side.
 */
export const profitSnapshot = async (req, res) => {
  try {
    const { date } = req.query;

    const periods = ["day", "month", "year"];
    const results = await Promise.all(
      periods.map(async (period) => {
        const { start, end } = resolveRange({ period, date });
        const agg = await Invoice.aggregate([
          { $match: { soldAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$total" },
              profit: { $sum: "$profit" },
              invoices: { $sum: 1 },
              suits: { $sum: { $sum: "$items.quantity" } },
            },
          },
        ]);
        const r = agg[0] || { revenue: 0, profit: 0, invoices: 0, suits: 0 };
        return [period, { ...r, start, end }];
      })
    );

    res.json({ success: true, snapshot: Object.fromEntries(results) });
  } catch (error) {
    console.error("profitSnapshot error:", error);
    res.status(500).json({ success: false, message: "Could not load profit snapshot" });
  }
};
