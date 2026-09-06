"use client";

import { useMemo, useState } from "react";
import api from "@/app/api/api";
import { useFetch, qs } from "@/app/shared/useFetch";
import { money, num } from "@/app/shared/format";
import { PageHeader, Card, StatCard, Spinner, ErrorNote, Badge, EmptyState } from "./ui";
import Modal from "./Modal";
import ReceiveStockForm from "./ReceiveStockForm";
import EditProductForm from "./EditProductForm";

export default function InventoryView() {
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const path = useMemo(
    () => "/products" + qs({ search, lowStock: lowOnly ? 1 : "" }),
    [search, lowOnly]
  );
  const { data, loading, error, reload } = useFetch(path);

  const products = data?.products || [];
  const totals = data?.totals || { quantity: 0, stockValue: 0, retailValue: 0 };

  const remove = async (p) => {
    if (!confirm(`Delete ${p.brand} vol ${p.volumeNo}? Only possible if it has no history.`))
      return;
    setBusyId(p._id);
    setActionError("");
    try {
      await api.delete(`/products/${p._id}`);
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not delete.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Every brand & volume, with live stock"
        actions={
          <button
            type="button"
            onClick={() => setShowReceive(true)}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            + Receive cloth
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Designs" value={num(products.length)} />
        <StatCard label="Suits in stock" value={num(totals.quantity)} />
        <StatCard label="Stock value (cost)" value={money(totals.stockValue)} />
        <StatCard
          label="If all sold"
          value={money(totals.retailValue)}
          hint={`potential profit ${money(totals.retailValue - totals.stockValue)}`}
          tone="positive"
        />
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, volume, description…"
            className="min-w-[12rem] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
              className="h-4 w-4"
            />
            Low stock only
          </label>
        </div>
      </Card>

      <ErrorNote>{error || actionError}</ErrorNote>

      {loading && !data ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState>
          No products yet. Click <strong>Receive cloth</strong> to add your first
          stock.
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Volume</th>
                <th className="px-4 py-3 text-right font-medium">In stock</th>
                <th className="px-4 py-3 text-right font-medium">Cost</th>
                <th className="px-4 py-3 text-right font-medium">Sale</th>
                <th className="px-4 py-3 text-right font-medium">Margin</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.quantity <= (p.lowStockThreshold ?? 3);
                return (
                  <tr
                    key={p._id}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                  >
                    <td className="px-4 py-3 font-medium">
                      {p.brand}
                      {p.description ? (
                        <span className="block text-xs font-normal text-neutral-400">
                          {p.description}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {p.volumeNo}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {low ? (
                        <Badge tone={p.quantity === 0 ? "danger" : "warning"}>
                          {num(p.quantity)}
                        </Badge>
                      ) : (
                        num(p.quantity)
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{money(p.costPrice)}</td>
                    <td className="px-4 py-3 text-right">{money(p.salePrice)}</td>
                    <td className="px-4 py-3 text-right">
                      {money(p.salePrice - p.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {money(p.quantity * p.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="text-xs font-medium text-neutral-700 hover:underline dark:text-neutral-300"
                      >
                        Edit
                      </button>
                      <span className="mx-2 text-neutral-300 dark:text-neutral-700">|</span>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        disabled={busyId === p._id}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={showReceive}
        onClose={() => setShowReceive(false)}
        title="Receive cloth into inventory"
      >
        <ReceiveStockForm
          onCancel={() => setShowReceive(false)}
          onDone={() => {
            setShowReceive(false);
            reload();
          }}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.brand} — vol ${editing.volumeNo}` : "Edit"}
      >
        {editing ? (
          <EditProductForm
            product={editing}
            onCancel={() => setEditing(null)}
            onDone={() => {
              setEditing(null);
              reload();
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}
