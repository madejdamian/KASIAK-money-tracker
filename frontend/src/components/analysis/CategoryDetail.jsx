import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, secondaryButtonClass } from "../ui/ui";
import ColumnChart, { useIsDesktop } from "./ColumnChart";
import { Delta, countLabel } from "./Changes";
import { expensesInCategory, labelOf, totalOf } from "../../util/analysis";
import {
  axisLabel,
  compareValues,
  earliestDate,
  monthKeyOfMonth,
  monthlyTotals,
  summarize,
  topExpenses,
  trimLeadingEmpty,
} from "../../util/analytics";
import { formatDay, formatMoney } from "../../util/format";
import { monthsEndingAt, monthsOfPeriod } from "../../util/period";

const Stat = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-sm text-neutral-400">{label}</p>
    <p className="mt-0.5 truncate font-bold tabular-nums">{value}</p>
  </div>
);

export const ExpenseRow = ({ expense }) => (
  <li className="border-b border-neutral-800 last:border-b-0">
    <Link
      to={`/expenses/${expense.slug}`}
      className="-mx-2 flex items-baseline justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-neutral-800/60"
    >
      <span className="min-w-0">
        <span className="block truncate font-medium">{expense.description || expense.title}</span>
        <span className="block truncate text-sm text-neutral-400">
          {formatDay(expense.date)} · {expense.memberName ?? "?"}
          {expense.categoryPath?.length > 0 && ` · ${expense.categoryPath[expense.categoryPath.length - 1]}`}
        </span>
      </span>
      <span className="whitespace-nowrap font-bold tabular-nums">{formatMoney(expense.price)}</span>
    </Link>
  </li>
);

// One category (or everything, when `focusId` is null): totals, how it compares, its trend over
// the last months (24 on the big screen, 12 on the phone) and the expenses behind the number.
const CategoryDetail = ({
  focusId,
  index,
  scoped,
  periodExpenses,
  baselineExpenses,
  period,
  today,
  color,
  onPickMonth,
}) => {
  const desktop = useIsDesktop();
  const [showAll, setShowAll] = useState(false);

  const inside = expensesInCategory(periodExpenses, index, focusId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const summary = summarize(inside, period, today);
  const baseTotal = baselineExpenses ? totalOf(expensesInCategory(baselineExpenses, index, focusId)) : null;
  const change = baseTotal == null ? null : { ...compareValues(summary.total, baseTotal), prevTotal: baseTotal };
  const overall = totalOf(periodExpenses);

  const end = period.to < today ? period.to : today;
  const months = trimLeadingEmpty(
    monthsOfPeriod(monthsEndingAt(end, desktop ? 24 : 12)),
    earliestDate(scoped)
  );
  const totals = monthlyTotals(expensesInCategory(scoped, index, focusId), (e) => e.price, months);
  const columns = months.map((month, position) => ({
    key: monthKeyOfMonth(month),
    label: axisLabel(month, position),
    total: totals[position],
    parts: [{ value: totals[position], color }],
  }));
  const highlighted = new Set(monthsOfPeriod(period).map(monthKeyOfMonth));
  const average = totals.reduce((sum, value) => sum + value, 0) / (months.length || 1);

  const listed = showAll ? inside.slice(0, 100) : topExpenses(inside, 5);

  return (
    <Card>
      <h2 className="font-display text-xl font-bold">
        {focusId == null ? "Wszystkie kategorie" : labelOf(index, focusId)}
      </h2>
      <p className="mt-2 font-display text-4xl font-light tabular-nums">{formatMoney(summary.total)}</p>
      {change && (
        <p className="mt-1 text-sm">
          <Delta row={change} /> <span className="text-neutral-500">vs {formatMoney(baseTotal)}</span>
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4 lg:grid-cols-4">
        <Stat label="Udział w wydatkach" value={overall > 0 ? `${Math.round((summary.total / overall) * 100)}%` : "–"} />
        <Stat label="Średnio / mies." value={formatMoney(summary.avgPerMonth)} />
        <Stat label="Liczba wydatków" value={summary.count} />
        <Stat label="Największy" value={formatMoney(summary.largest)} />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-neutral-400">
          Miesiąc po miesiącu · średnio {formatMoney(average)}
        </p>
        <ColumnChart
          columns={columns}
          highlighted={highlighted}
          onSelect={onPickMonth}
          formatValue={formatMoney}
          full={desktop}
        />
      </div>

      <div className="mt-6">
        <p className="mb-1 text-sm font-medium text-neutral-400">
          {showAll ? `Wszystkie wydatki (${countLabel(inside.length)})` : "Największe wydatki"}
        </p>
        {inside.length === 0 ? (
          <p className="py-2 text-neutral-500">Brak wydatków w tym okresie.</p>
        ) : (
          <ul>
            {listed.map((expense) => (
              <ExpenseRow key={expense.slug} expense={expense} />
            ))}
          </ul>
        )}
        {inside.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className={`${secondaryButtonClass} mt-3 w-full`}
          >
            {showAll ? "Pokaż tylko największe" : `Pokaż wszystkie (${inside.length})`}
          </button>
        )}
      </div>
    </Card>
  );
};

export default CategoryDetail;
