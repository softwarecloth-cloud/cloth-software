"use client";

import { useState } from "react";
import api from "@/app/api/api";
import { Field } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import { ErrorNote } from "./ui";
import { dateInputValue, money } from "@/app/shared/format";

// Common running costs — one tap fills the category, but the owner can type
// anything they like.
const QUICK = [
  "Food / Tea",
  "Electricity bill",
  "Gas bill",
  "Water bill",
  "Shop rent",
  "Staff salary",
  "Transport",
  "Packing / Bags",
  "Repairs",
  "Other",
];

const empty = {
  category: "",
  amount: "",
  description: "",
  spentAt: dateInputValue(),
};

export default function AddExpenseForm({ preset, onDone, onCancel }) {
  const [values, setValues] = useState({ ...empty, ...preset });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const amount = Number(values.amount) || 0;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!values.category.trim())
      return setError("Enter what the money was spent on.");
    if (amount <= 0) return setError("Enter an amount greater than zero.");

    setSaving(true);
    try {
      const res = await api.post("/expenses", {
        category: values.category.trim(),
        amount,
        description: values.description.trim(),
        spentAt: values.spentAt,
      });
      onDone?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setValues((v) => ({ ...v, category: q }))}
            className={
              "rounded-full border px-2.5 py-1 text-xs font-medium transition " +
              (values.category === q
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800")
            }
          >
            {q}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Spent on"
          name="category"
          value={values.category}
          onChange={set}
          placeholder="Electricity bill"
        />
        <Field
          label="Amount (Rs)"
          name="amount"
          type="number"
          min="0"
          step="1"
          value={values.amount}
          onChange={set}
          placeholder="140"
        />
      </div>

      {amount > 0 ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Recording <strong>{money(amount)}</strong>
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Date"
          name="spentAt"
          type="date"
          value={values.spentAt}
          onChange={set}
        />
        <Field
          label="Note (optional)"
          name="description"
          value={values.description}
          onChange={set}
          placeholder="e.g. LESCO May bill"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={saving}>
          Add expense
        </Button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
