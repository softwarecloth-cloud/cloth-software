"use client";

import { useState } from "react";
import Link from "next/link";
import { useFetch, qs } from "@/app/shared/useFetch";
import { money, num, fmtDateTime, dateInputValue } from "@/app/shared/format";
import {
  PageHeader,
  Card,
  StatCard,
  Spinner,
  ErrorNote,
  Badge,
} from "./ui";
import PeriodPicker from "./PeriodPicker";
import TrendChart from "./TrendChart";

export default function OverviewDashboard() {
  const [range, setRange] = useState({
    period: "month",
    date: dateInputValue(),
  });

  const { data, loading, error } = useFetch(
    "/reports/dashboard" + qs(range)
  );

  const periodWord =
    range.period === "day" ? "today" : `this ${range.period}`;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Sales, profit and stock at a glance"
        actions={
          <PeriodPicker
            period={range.period}
            date={range.date}
            onChange={setRange}
          />
        }
      />

      <ErrorNote>{error}</ErrorNote>

      {loading && !data ? (
        <Spinner />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={`Sales ${periodWord}`}
              value={money(data.sales.revenue)}
              hint={`${num(data.sales.invoices)} bills · ${num(
                data.sales.suitsSold
              )} suits`}
            />
            <StatCard
              label={`Profit ${periodWord}`}
              value={money(data.sales.profit)}
              tone={data.sales.profit >= 0 ? "positive" : "negative"}
              hint={
                data.sales.discount
                  ? `after ${money(data.sales.discount)} discount`
                  : "sell price − cost price"
              }
            />
            <StatCard
              label={`Cloth received ${periodWord}`}
              value={`${num(data.received.quantity)} suits`}
              hint={`${money(data.received.cost)} spent`}
            />
            <StatCard
              label="Stock on hand"
              value={`${num(data.stock.units)} suits`}
              hint={`${money(data.stock.costValue)} at cost · ${num(
                data.stock.skus
              )} designs`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Sales &amp; profit trend</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  avg bill {money(data.sales.avgInvoice)}
                </span>
              </div>
              <TrendChart data={data.breakdown} />
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Low stock</h2>
                <Badge tone={data.stock.lowStockCount ? "warning" : "success"}>
                  {data.stock.lowStockCount}
                </Badge>
              </div>
              {data.stock.lowStock.length ? (
                <ul className="space-y-2">
                  {data.stock.lowStock.map((p) => (
                    <li
                      key={p._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate">
                        {p.brand}{" "}
                        <span className="text-neutral-400">vol {p.volumeNo}</span>
                      </span>
                      <Badge tone={p.quantity === 0 ? "danger" : "warning"}>
                        {p.quantity} left
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Everything is well stocked.
                </p>
              )}
              <Link
                href="/dashboard/inventory"
                className="mt-3 inline-block text-xs font-medium text-neutral-900 underline dark:text-neutral-100"
              >
                Manage inventory →
              </Link>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-sm font-semibold">
                Top sellers {periodWord}
              </h2>
              {data.topProducts.length ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                      <th className="pb-2 font-medium">Design</th>
                      <th className="pb-2 text-right font-medium">Sold</th>
                      <th className="pb-2 text-right font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p) => (
                      <tr
                        key={p._id}
                        className="border-t border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="py-2">
                          {p.brand}{" "}
                          <span className="text-neutral-400">vol {p.volumeNo}</span>
                        </td>
                        <td className="py-2 text-right">{num(p.quantity)}</td>
                        <td className="py-2 text-right">{money(p.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No sales recorded in this period.
                </p>
              )}
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent bills</h2>
                <Link
                  href="/dashboard/invoices"
                  className="text-xs font-medium text-neutral-900 underline dark:text-neutral-100"
                >
                  All invoices →
                </Link>
              </div>
              {data.recentInvoices.length ? (
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {data.recentInvoices.map((inv) => (
                    <li key={inv._id}>
                      <Link
                        href={`/dashboard/invoices/${inv._id}`}
                        className="flex items-center justify-between py-2 text-sm hover:opacity-70"
                      >
                        <span>
                          <span className="font-medium">#{inv.invoiceNumber}</span>{" "}
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {inv.customerName}
                          </span>
                          <span className="block text-xs text-neutral-400">
                            {fmtDateTime(inv.soldAt)}
                          </span>
                        </span>
                        <span className="text-right font-medium">
                          {money(inv.total)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No bills yet — create one from “New bill”.
                </p>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
