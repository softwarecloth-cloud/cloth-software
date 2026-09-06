"use client";

import { useState } from "react";
import api from "@/app/api/api";
import { Field } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import { ErrorNote } from "./ui";
import { money } from "@/app/shared/format";

/**
 * Edit an existing inventory line. Stock corrections are allowed here (e.g.
 * shrinkage / a miscount) but the normal way to add stock is a receipt.
 */
export default function EditProductForm({ product, onDone, onCancel }) {
  const [values, setValues] = useState({
    brand: product.brand,
    volumeNo: product.volumeNo,
    description: product.description || "",
    costPrice: String(product.costPrice),
    salePrice: String(product.salePrice),
    quantity: String(product.quantity),
    lowStockThreshold: String(product.lowStockThreshold ?? 3),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const cost = Number(values.costPrice) || 0;
  const sale = Number(values.salePrice) || 0;
  const qty = Number(values.quantity) || 0;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!values.brand.trim() || !values.volumeNo.trim())
      return setError("Brand and volume number are required.");
    if (cost < 0 || sale < 0) return setError("Prices can't be negative.");
    if (qty < 0) return setError("Quantity can't be negative.");

    setSaving(true);
    try {
      const res = await api.patch(`/products/${product._id}`, {
        brand: values.brand.trim(),
        volumeNo: values.volumeNo.trim(),
        description: values.description.trim(),
        costPrice: cost,
        salePrice: sale,
        quantity: qty,
        lowStockThreshold: Number(values.lowStockThreshold) || 0,
      });
      onDone?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNote>{error}</ErrorNote>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand" name="brand" value={values.brand} onChange={set} />
        <Field label="Volume no." name="volumeNo" value={values.volumeNo} onChange={set} />
      </div>

      <Field label="Description" name="description" value={values.description} onChange={set} placeholder="Embroidered lawn 3pc" />

      <div className="grid grid-cols-3 gap-3">
        <Field label="Cost / suit" name="costPrice" type="number" min="0" value={values.costPrice} onChange={set} />
        <Field label="Sale / suit" name="salePrice" type="number" min="0" value={values.salePrice} onChange={set} />
        <Field label="Low-stock at" name="lowStockThreshold" type="number" min="0" value={values.lowStockThreshold} onChange={set} />
      </div>

      <Field
        label="Quantity in stock"
        name="quantity"
        type="number"
        min="0"
        value={values.quantity}
        onChange={set}
      />
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Adjust quantity only to correct a miscount — use “Receive cloth” to add a
        new batch. Margin {money(sale - cost)}/suit.
      </p>

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={saving}>
          Save changes
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
