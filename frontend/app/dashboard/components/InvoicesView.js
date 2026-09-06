"use client";

import { useState } from "react";
import Link from "next/link";
import { useFetch, qs } from "@/app/shared/useFetch";
import { money, num, fmtDateTime, dateInputValue } from "@/app/shared/format";
import { PageHeader, Card, StatCard, Spinner, ErrorNote, EmptyState, Badge } from "./ui";
import PeriodPicker from "./PeriodPicker";

export default function InvoicesView() {
  const [range, setRange] = useState({ period: "month", date: dateInputValue() });
  const [search, setSearch] = useState("");

  const { data, loading, error } = useFetch("/invoices" + qs({ ...range, search }));
  const invoices = data?.invoices || [];
  const totals = data?.totals || { revenue: 0, profit: 0, count: 0, suits: 0, received: 0 };

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Sales history with day / month / year filters"
        actions={
          <Link
            href="/dashboard/billing"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            + New bill
          </Link>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodPicker period={range.period} date={range.date} onChange={setRange} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or bill #…"
            className="min-w-[10rem] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
          />
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Bills" value={num(totals.count)} hint={`${num(totals.suits)} suits`} />
        <StatCard label="Sales" value={money(totals.revenue)} />
        <StatCard label="Profit" value={money(totals.profit)} tone={totals.profit >= 0 ? "positive" : "negative"} />
        <StatCard label="Outstanding" value={money(totals.revenue - totals.received)} />
      </div>

      <ErrorNote>{error}</ErrorNote>

      {loading && !data ? (
        <Spinner />
      ) : invoices.length === 0 ? (
        <EmptyState>No invoices in this period.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-4 py-3 font-medium">Bill #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Suits</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Profit</th>
                <th className="px-4 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const bal = inv.total - inv.amountReceived;
                return (
                  <tr
                    key={inv._id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/dashboard/invoices/${inv._id}`} className="hover:underline">
                        #{inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{inv.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {fmtDateTime(inv.soldAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {num((inv.items || []).reduce((s, it) => s + it.quantity, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{money(inv.total)}</td>
                    <td className="px-4 py-3 text-right">{money(inv.profit)}</td>
                    <td className="px-4 py-3 text-right">
                      {bal <= 0 ? (
                        <Badge tone="success">Paid</Badge>
                      ) : (
                        <Badge tone="warning">{money(bal)} due</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
