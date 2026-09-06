"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/app/api/api";
import { useFetch } from "@/app/shared/useFetch";
import { money, num, fmtDateTime } from "@/app/shared/format";
import { Spinner, ErrorNote } from "./ui";

export default function InvoiceDetail({ id }) {
  const router = useRouter();
  const autoPrint = useSearchParams().get("print") === "1";
  const { data, loading, error } = useFetch(`/invoices/${id}`);
  const invoice = data?.invoice;

  useEffect(() => {
    if (invoice && autoPrint) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [invoice, autoPrint]);

  const onDelete = async () => {
    if (!confirm("Cancel this invoice? The suits go back into stock.")) return;
    try {
      await api.delete(`/invoices/${id}`);
      router.push("/dashboard/invoices");
    } catch (e) {
      alert(e.response?.data?.message || "Could not cancel invoice.");
    }
  };

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!invoice) return null;

  const balance = invoice.total - invoice.amountReceived;

  return (
    <div>
      {/* Print rules: hide the app chrome, show only #bill */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #bill, #bill * { visibility: visible !important; }
          #bill { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: 0 !important; }
          .no-print { display: none !important; }
          @page { margin: 12mm; }
        }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/invoices"
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← All invoices
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Print bill
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Cancel invoice
          </button>
        </div>
      </div>

      {/* The bill itself — kept intentionally plain / high-contrast for thermal
          and inkjet printers alike. */}
      <div
        id="bill"
        className="mx-auto max-w-2xl rounded-xl border border-neutral-300 bg-white p-6 text-neutral-900 sm:p-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Cloth Shop</h2>
          <p className="text-xs text-neutral-500">
            Rimal Center, Kashmiri Gate — Lahore · 042-37658388
          </p>
        </div>

        <div className="mt-5 flex justify-between border-y border-neutral-300 py-2 text-sm">
          <span>
            Bill No: <strong>#{invoice.invoiceNumber}</strong>
          </span>
          <span>{fmtDateTime(invoice.soldAt)}</span>
        </div>

        <div className="mt-3 text-sm">
          <p>
            <span className="text-neutral-500">Name:</span>{" "}
            <strong>{invoice.customerName}</strong>
          </p>
          {invoice.customerPhone ? (
            <p>
              <span className="text-neutral-500">Phone:</span> {invoice.customerPhone}
            </p>
          ) : null}
          {invoice.address ? (
            <p>
              <span className="text-neutral-500">Address:</span> {invoice.address}
            </p>
          ) : null}
        </div>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y-2 border-neutral-800 text-left">
              <th className="py-1.5 pr-2 font-semibold">Qty</th>
              <th className="py-1.5 pr-2 font-semibold">Tafseel / Description</th>
              <th className="py-1.5 pr-2 text-right font-semibold">Rate</th>
              <th className="py-1.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i} className="border-b border-neutral-200">
                <td className="py-1.5 pr-2 align-top">{num(it.quantity)}</td>
                <td className="py-1.5 pr-2 align-top">
                  {it.description || `${it.brand} vol ${it.volumeNo}`}
                </td>
                <td className="py-1.5 pr-2 text-right align-top">{money(it.rate)}</td>
                <td className="py-1.5 text-right align-top">{money(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 ml-auto w-56 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span>{money(invoice.subtotal)}</span>
          </div>
          {invoice.discount ? (
            <div className="flex justify-between">
              <span className="text-neutral-500">Discount</span>
              <span>− {money(invoice.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-neutral-800 pt-1 text-base font-bold">
            <span>Total</span>
            <span>{money(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Received</span>
            <span>{money(invoice.amountReceived)}</span>
          </div>
          {balance > 0 ? (
            <div className="flex justify-between font-semibold">
              <span>Balance due</span>
              <span>{money(balance)}</span>
            </div>
          ) : null}
        </div>

        {invoice.notes ? (
          <p className="mt-4 text-xs text-neutral-500">Note: {invoice.notes}</p>
        ) : null}

        <p className="mt-6 text-center text-xs text-neutral-500">
          Thank you — goods once sold are exchangeable within 3 days with the bill.
        </p>
      </div>

      <p className="no-print mx-auto mt-3 max-w-2xl text-xs text-neutral-400">
        Internal only — profit on this bill: {money(invoice.profit)}
      </p>
    </div>
  );
}
