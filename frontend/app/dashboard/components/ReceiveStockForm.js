"use client";

import { useState } from "react";
import api from "@/app/api/api";
import { Field } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import { ErrorNote } from "./ui";
import { dateInputValue, money } from "@/app/shared/format";

const empty = {
  brand: "",
  volumeNo: "",
  quantity: "",
  costPrice: "",
  salePrice: "",
  description: "",
  note: "",
  receivedAt: dateInputValue(),
};

export default function ReceiveStockForm({ preset, onDone, onCancel }) {
  const [values, setValues] = useState({ ...empty, ...preset });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const qty = Number(values.quantity) || 0;
  const cost = Number(values.costPrice) || 0;
  const sale = Number(values.salePrice) || 0;
  const marginEach = sale - cost;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!values.brand.trim() || !values.volumeNo.trim())
      return setError("Brand and volume number are required.");
    if (qty < 1) return setError("Quantity must be at least 1.");
    if (cost < 0 || sale < 0) return setError("Prices can't be negative.");

    setSaving(true);
    try {
      const res = await api.post("/stock", {
        brand: values.brand.trim(),
        volumeNo: values.volumeNo.trim(),
        quantity: qty,
        costPrice: cost,
        salePrice: sale,
        description: values.description.trim(),
        note: values.note.trim(),
        receivedAt: values.receivedAt,
      });
      onDone?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the receipt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNote>{error}</ErrorNote>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand" name="brand" value={values.brand} onChange={set} placeholder="Rimal" />
        <Field label="Volume no." name="volumeNo" value={values.volumeNo} onChange={set} placeholder="6" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Quantity" name="quantity" type="number" min="1" value={values.quantity} onChange={set} placeholder="8" />
        <Field label="Cost / suit" name="costPrice" type="number" min="0" value={values.costPrice} onChange={set} placeholder="3000" />
        <Field label="Sale / suit" name="salePrice" type="number" min="0" value={values.salePrice} onChange={set} placeholder="3495" />
      </div>

      {qty > 0 && cost > 0 ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Total cost <strong>{money(qty * cost)}</strong>
          {sale > 0 ? (
            <>
              {" "}
              · margin <strong>{money(marginEach)}</strong>/suit ·{" "}
              potential profit <strong>{money(marginEach * qty)}</strong>
            </>
          ) : null}
        </p>
      ) : null}

      <Field label="Description (optional)" name="description" value={values.description} onChange={set} placeholder="Embroidered lawn 3pc" />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Received on" name="receivedAt" type="date" value={values.receivedAt} onChange={set} />
        <Field label="Note (optional)" name="note" value={values.note} onChange={set} placeholder="Supplier / bill no." />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={saving}>
          Add to inventory
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
