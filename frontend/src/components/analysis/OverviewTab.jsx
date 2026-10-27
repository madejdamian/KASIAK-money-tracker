import React from "react";
import { Card, secondaryButtonClass } from "../ui/ui";
import StackedBar from "./StackedBar";
import { Delta, EmptyState, MovesList, percentLabel } from "./Changes";
import { ExpenseRow } from "./CategoryDetail";
import {
  biggestMoves,
  categoryRows,
  compareValues,
  compositionParts,
  siblingIds,
  summarize,
  topExpenses,
} from "../../util/analytics";
import { REST_COLOR, colorFor } from "../../util/palette";
import { formatMoney } from "../../util/format";

const Stat = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-sm text-neutral-400">{label}</dt>
    <dd className="mt-0.5 truncate font-bold tabular-nums">{value}</dd>
  </div>
);

// The answer in one look: how much, compared with what, where it went, what changed most.
const Overview = ({ set, index, current, baselineExpenses, period, baseline, today }) => {
  if (current.length === 0) return <EmptyState />;

  const summary = summarize(current, period, today);
  const baseSummary = baselineExpenses ? summarize(baselineExpenses, baseline, today) : null;
  const change = baseSummary
    ? { ...compareValues(summary.total, baseSummary.total), prevTotal: baseSummary.total }
    : null;

  const rows = categoryRows(current, baselineExpenses, index, null);
  const top = siblingIds(index, null);
  const colorOf = (row) => (row.id == null ? REST_COLOR : colorFor(top, row.id));
  const moves = baselineExpenses ? biggestMoves(rows, 5) : [];

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4 lg:col-span-7">
        <Card>
          <p className="text-sm text-neutral-400">Wydatki · {period.label}</p>
          <p className="mt-1 font-display text-5xl font-light tabular-nums">{formatMoney(summary.total)}</p>
          {change && (
            <p className="mt-2">
              <Delta row={change} />{" "}
              <span className="text-sm text-neutral-500">
                vs {formatMoney(baseSummary.total)} ({baseline.label})
              </span>
            </p>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-neutral-800 pt-4">
            <Stat label="Średnio / mies." value={formatMoney(summary.avgPerMonth)} />
            <Stat label="Wydatków" value={summary.count} />
            <Stat label="Największy" value={formatMoney(summary.largest)} />
          </dl>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-bold">Na co idą pieniądze</h2>
          <div className="mt-4">
            <StackedBar parts={compositionParts(rows, colorOf, REST_COLOR)} label="Struktura wydatków" />
          </div>
          <ul className="mt-3">
            {rows.filter((row) => row.total > 0).slice(0, 6).map((row) => (
              <li key={row.id ?? "none"} className="border-b border-neutral-800 last:border-b-0">
                <button
                  type="button"
                  disabled={row.id == null}
                  onClick={() => set({ tab: "categories", cat: String(row.id) })}
                  className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-neutral-800/60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colorOf(row) }} aria-hidden="true" />
                    <span className="truncate font-medium">{row.name}</span>
                  </span>
                  <span className="whitespace-nowrap tabular-nums">
                    <span className="mr-3 text-neutral-400">{percentLabel(row)}</span>
                    <span className="font-bold">{formatMoney(row.total)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => set({ tab: "categories", cat: "" })}
            className={`${secondaryButtonClass} mt-3 w-full`}
          >
            Wszystkie kategorie
          </button>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-5">
        {moves.length > 0 && (
          <Card>
            <h2 className="font-display text-xl font-bold">Największe zmiany</h2>
            <p className="mb-1 text-sm text-neutral-500">vs {baseline.label}, kategorie główne</p>
            <MovesList moves={moves} />
          </Card>
        )}

        <Card>
          <h2 className="font-display text-xl font-bold">Największe wydatki</h2>
          <ul className="mt-1">
            {topExpenses(current, 3).map((expense) => (
              <ExpenseRow key={expense.slug} expense={expense} />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => set({ tab: "items" })}
            className={`${secondaryButtonClass} mt-3 w-full`}
          >
            Wszystkie pozycje
          </button>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
