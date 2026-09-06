"use client";

import { useState } from "react";
import api from "@/app/api/api";
import { useFetch, qs } from "@/app/shared/useFetch";
import { money, num, fmtDate, dateInputValue } from "@/app/shared/format";
import { PageHeader, Card, StatCard, Spinner, ErrorNote, EmptyState } from "./ui";
import Modal from "./Modal";
import ReceiveStockForm from "./ReceiveStockForm";
import PeriodPicker from "./PeriodPicker";

export default function ReceiptsView() {
  const [range, setRange] = useState({ period: "month", date: dateInputValue() });
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const { data, loading, error, reload } = useFetch(
    "/stock" + qs({ ...range, search })
  );

  const receipts = data?.receipts || [];
  const totals = data?.totals || { quantity: 0, cost: 0 };

  const remove = async (r) => {
    if (!confirm(`Reverse this receipt of ${r.quantity} × ${r.brand} vol ${r.volumeNo}?`))
      return;
    setBusyId(r._id);
    setActionError("");
    try {
      await api.delete(`/stock/${r._id}`);
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not reverse receipt.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Cloth received"
        subtitle="Every stock-in batch, filterable by date"
        actions={
          <button
            type="button"
            onClick={() => setShow(true)}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            + Receive cloth
          </button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodPicker period={range.period} date={range.date} onChange={setRange} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand / volume / note…"
            className="min-w-[10rem] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
          />
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Batches" value={num(receipts.length)} />
        <StatCard label="Suits received" value={num(totals.quantity)} />
        <StatCard label="Amount spent" value={money(totals.cost)} />
      </div>

      <ErrorNote>{error || actionError}</ErrorNote>

      {loading && !data ? (
        <Spinner />
      ) : receipts.length === 0 ? (
        <EmptyState>No stock received in this period.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Brand / volume</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Cost/suit</th>
                <th className="px-4 py-3 text-right font-medium">Sale/suit</th>
                <th className="px-4 py-3 text-right font-medium">Total cost</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr
                  key={r._id}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                    {fmtDate(r.receivedAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {r.brand} <span className="text-neutral-400">vol {r.volumeNo}</span>
                    {r.note ? (
                      <span className="block text-xs font-normal text-neutral-400">
                        {r.note}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">{num(r.quantity)}</td>
                  <td className="px-4 py-3 text-right">{money(r.costPrice)}</td>
                  <td className="px-4 py-3 text-right">{money(r.salePrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {money(r.totalCost)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(r)}
                      disabled={busyId === r._id}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                    >
                      Reverse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Receive cloth into inventory">
        <ReceiveStockForm
          onCancel={() => setShow(false)}
          onDone={() => {
            setShow(false);
            reload();
          }}
        />
      </Modal>
    </>
  );
}
