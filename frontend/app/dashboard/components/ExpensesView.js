"use client";

import { useState } from "react";
import api from "@/app/api/api";
import { useFetch, qs } from "@/app/shared/useFetch";
import { money, num, fmtDate, dateInputValue } from "@/app/shared/format";
import { PageHeader, Card, StatCard, Spinner, ErrorNote, EmptyState } from "./ui";
import Modal from "./Modal";
import AddExpenseForm from "./AddExpenseForm";
import PeriodPicker from "./PeriodPicker";

export default function ExpensesView() {
  const [range, setRange] = useState({ period: "day", date: dateInputValue() });
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const { data, loading, error, reload } = useFetch(
    "/expenses" + qs({ ...range, search })
  );

  const expenses = data?.expenses || [];
  const total = data?.totals?.amount || 0;
  const byCategory = data?.byCategory || [];

  const periodWord =
    range.period === "day" ? "today" : `this ${range.period}`;

  const remove = async (e) => {
    if (!confirm(`Delete this expense of ${money(e.amount)} (${e.category})?`))
      return;
    setBusyId(e._id);
    setActionError("");
    try {
      await api.delete(`/expenses/${e._id}`);
      reload();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not delete expense.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Daily expenses"
        subtitle="Shop running costs — bills, food, rent, wages and more"
        actions={
          <button
            type="button"
            onClick={() => setShow(true)}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            + Add expense
          </button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodPicker period={range.period} date={range.date} onChange={setRange} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category / note…"
            className="min-w-[10rem] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-300"
          />
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label={`Spent ${periodWord}`} value={money(total)} tone="negative" />
        <StatCard label="Entries" value={num(expenses.length)} />
        <StatCard label="Categories" value={num(byCategory.length)} />
      </div>

      <ErrorNote>{error || actionError}</ErrorNote>

      {loading && !data ? (
        <Spinner />
      ) : expenses.length === 0 ? (
        <EmptyState>No expenses recorded in this period.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="overflow-x-auto p-0 lg:col-span-2">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Spent on</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr
                    key={e._id}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {fmtDate(e.spentAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {e.category}
                      {e.description ? (
                        <span className="block text-xs font-normal text-neutral-400">
                          {e.description}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {money(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(e)}
                        disabled={busyId === e._id}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-4 py-3 font-semibold" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {money(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold">By category</h2>
            <ul className="space-y-2">
              {byCategory.map((c) => (
                <li
                  key={c.category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{c.category}</span>
                  <span className="font-medium">{money(c.amount)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Modal open={show} onClose={() => setShow(false)} title="Add a daily expense">
        <AddExpenseForm
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
