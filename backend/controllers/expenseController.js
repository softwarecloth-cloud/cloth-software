import Expense from "../models/Expense.js";
import { resolveRange } from "../utils/dateRange.js";

/**
 * GET /expenses?period=month&date=&from=&to=&search=
 * Every recorded running cost, newest first, with the period total and a
 * per-category breakdown for the selected window.
 */
export const listExpenses = async (req, res) => {
  try {
    const { search, period, date, from, to } = req.query;
    const filter = {};

    if (search) {
      const rx = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [{ category: rx }, { description: rx }];
    }
    if (period || date || from || to) {
      const { start, end } = resolveRange({ period, date, from, to });
      filter.spentAt = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter)
      .sort("-spentAt")
      .limit(500)
      .lean();

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategoryMap = new Map();
    for (const e of expenses) {
      byCategoryMap.set(e.category, (byCategoryMap.get(e.category) || 0) + e.amount);
    }
    const byCategory = [...byCategoryMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      count: expenses.length,
      totals: { amount: total },
      byCategory,
      expenses,
    });
  } catch (error) {
    console.error("listExpenses error:", error);
    res.status(500).json({ success: false, message: "Could not load expenses" });
  }
};

// POST /expenses  — record a running cost
// Body: { category, amount, description?, spentAt? }
export const createExpense = async (req, res) => {
  try {
    const { category, amount, description = "", spentAt } = req.body;
    const value = Number(amount);

    if (!category?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Enter what the money was spent on" });
    }
    if (!Number.isFinite(value) || value < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid amount" });
    }

    const expense = await Expense.create({
      category: category.trim(),
      amount: value,
      description: String(description || "").trim(),
      spentAt: spentAt ? new Date(spentAt) : new Date(),
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid data";
      return res.status(400).json({ success: false, message });
    }
    console.error("createExpense error:", error);
    res.status(500).json({ success: false, message: "Could not save the expense" });
  }
};

// DELETE /expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    console.error("deleteExpense error:", error);
    res.status(500).json({ success: false, message: "Could not delete expense" });
  }
};
