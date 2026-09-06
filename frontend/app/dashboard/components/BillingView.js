"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/api/api";
import { useFetch } from "@/app/shared/useFetch";
import { money } from "@/app/shared/format";
import { Field } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import { PageHeader, Card, Spinner, ErrorNote, EmptyState } from "./ui";

const blankRow = () => ({
  key: Math.random().toString(36).slice(2),
  productId: "",
  description: "",
  quantity: 1,
  rate: "",
});

export default function BillingView() {
  const router = useRouter();
  const { data, loading, error } = useFetch("/products");
  const products = useMemo(() => data?.products || [], [data]);
  const byId = useMemo(
    () => new Map(products.map((p) => [p._id, p])),
    [products]
  );

  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [rows, setRows] = useState([blankRow()]);
  const [discount, setDiscount] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const setCustomerField = (e) =>
    setCustomer((c) => ({ ...c, [e.target.name]: e.target.value }));

  const updateRow = (key, patch) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const onPickProduct = (key, productId) => {
    const p = byId.get(productId);
    updateRow(key, {
      productId,
      rate: p ? p.salePrice : "",
      description: p ? p.description || `${p.brand} ${p.volumeNo}` : "",
    });
  };

  const addRow = () => setRows((rs) => [...rs, blankRow()]);
  const removeRow = (key) =>
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((r) => r.key !== key)));

  const lines = rows.map((r) => {
    const p = byId.get(r.productId);
    const quantity = Number(r.quantity) || 0;
    const rate = Number(r.rate) || 0;
    return {
      ...r,
      product: p,
      quantity,
      rate,
      lineTotal: quantity * rate,
      cost: p ? p.costPrice : 0,
      available: p ? p.quantity : 0,
      over: p ? quantity > p.quantity : false,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const disc = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - disc);
  const profit =
    lines.reduce((s, l) => s + (l.rate - l.cost) * l.quantity, 0) - disc;

  const canSubmit =
    customer.name.trim() &&
    lines.some((l) => l.productId && l.quantity > 0) &&
    !lines.some((l) => l.productId && (l.over || l.quantity < 1));

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const items = lines
      .filter((l) => l.productId && l.quantity > 0)
      .map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        rate: l.rate,
        description: l.description.trim(),
      }));

    if (!customer.name.trim()) return setFormError("Enter the customer name.");
    if (!items.length) return setFormError("Add at least one item with a quantity.");
    const over = lines.find((l) => l.over);
    if (over)
      return setFormError(
        `Only ${over.available} in stock for ${over.product.brand} vol ${over.product.volumeNo}.`
      );

    setSaving(true);
    try {
      const res = await api.post("/invoices", {
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        address: customer.address.trim(),
        notes: notes.trim(),
        discount: disc,
        amountReceived: amountReceived === "" ? undefined : Number(amountReceived),
        items,
      });
      router.push(`/dashboard/invoices/${res.data.invoice._id}?print=1`);
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not create the bill.");
      setSaving(false);
    }
  };

  if (loading && !data) return <Spinner />;

  return (
    <>
      <PageHeader title="New bill" subtitle="Sell suits and generate a printable invoice" />
      <ErrorNote>{error}</ErrorNote>

      {products.length === 0 ? (
        <EmptyState>
          Add stock in <strong>Inventory</strong> before creating a bill.
        </EmptyState>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-semibold">Customer</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Name" name="name" value={customer.name} onChange={setCustomerField} placeholder="Walk-in customer" />
              <Field label="Phone (optional)" name="phone" value={customer.phone} onChange={setCustomerField} placeholder="03xx…" />
              <Field label="Address (optional)" name="address" value={customer.address} onChange={setCustomerField} placeholder="Area / shop" />
            </div>
          </Card>

          <Card className="overflow-x-auto">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Items</h2>
              <button
                type="button"
                onClick={addRow}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                + Add row
              </button>
            </div>

            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Tafseel / description</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Rate</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.key} className="border-t border-neutral-100 dark:border-neutral-800">
                    <td className="py-2 pr-2">
                      <select
                        value={l.productId}
                        onChange={(e) => onPickProduct(l.key, e.target.value)}
                        className="w-44 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
                      >
                        <option value="">Select…</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                            {p.brand} — vol {p.volumeNo} ({p.quantity} left)
                          </option>
                        ))}
                      </select>
                      {l.productId ? (
                        <span
                          className={
                            "mt-1 block text-[11px] " +
                            (l.over
                              ? "text-red-600 dark:text-red-400"
                              : "text-neutral-400")
                          }
                        >
                          {l.available} in stock · cost {money(l.cost)}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        value={l.description}
                        onChange={(e) => updateRow(l.key, { description: e.target.value })}
                        placeholder="e.g. RmL 6"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
                      />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <input
                        type="number"
                        min="1"
                        value={l.quantity}
                        onChange={(e) => updateRow(l.key, { quantity: e.target.value })}
                        className="w-16 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-right text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
                      />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <input
                        type="number"
                        min="0"
                        value={l.rate}
                        onChange={(e) => updateRow(l.key, { rate: e.target.value })}
                        className="w-24 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-right text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
                      />
                    </td>
                    <td className="py-2 pr-2 text-right font-medium">
                      {money(l.lineTotal)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(l.key)}
                        className="text-neutral-400 hover:text-red-600"
                        aria-label="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-sm font-semibold">Payment</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
                <Field
                  label="Amount received"
                  type="number"
                  min="0"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={String(total)}
                />
              </div>
              <Field
                label="Notes (optional)"
                className="mt-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Len-den / remarks"
              />
            </Card>

            <Card>
              <h2 className="mb-3 text-sm font-semibold">Summary</h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Discount</dt>
                  <dd>− {money(disc)}</dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-1.5 text-base font-semibold dark:border-neutral-800">
                  <dt>Total</dt>
                  <dd>{money(total)}</dd>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <dt>Estimated profit</dt>
                  <dd>{money(profit)}</dd>
                </div>
              </dl>

              <ErrorNote>{formError}</ErrorNote>
              <div className="mt-4">
                <Button type="submit" loading={saving} disabled={!canSubmit}>
                  Generate bill &amp; print
                </Button>
              </div>
            </Card>
          </div>
        </form>
      )}
    </>
  );
}
