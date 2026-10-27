import React from "react";
import { Card } from "../ui/ui";
import ColumnChart, { useIsDesktop } from "./ColumnChart";
import {
  axisLabel,
  earliestDate,
  monthKeyOfMonth,
  monthlyStack,
  monthlyTotals,
  siblingIds,
  trimLeadingEmpty,
} from "../../util/analytics";
import { REST_COLOR, colorFor } from "../../util/palette";
import { formatDelta, formatMoney, monthLabel } from "../../util/format";
import { monthsEndingAt, monthsOfPeriod } from "../../util/period";

// Month by month: spending split by category (tap a month to open its breakdown), and how the
// deposits compare with what was spent from the shared card.
const TimeTab = ({ set, index, scoped, allExpenses, deposits, period, today }) => {
  const desktop = useIsDesktop();

  const end = period.to < today ? period.to : today;
  const periodMonths = monthsOfPeriod(period).length;
  // 12 months on the phone; up to 24 (or the whole period) on the big screen
  const count = desktop ? Math.min(24, Math.max(12, periodMonths)) : 12;
  const months = trimLeadingEmpty(monthsOfPeriod(monthsEndingAt(end, count)), earliestDate(scoped));

  const top = siblingIds(index, null);
  const colorOf = (id) => (id == null ? REST_COLOR : colorFor(top, id));
  const stack = monthlyStack(scoped, index, null, months);
  const columns = stack.map((month, position) => ({
    key: month.key,
    label: axisLabel(month, position),
    total: month.total,
    parts: month.parts.map((part) => ({ value: part.total, color: colorOf(part.id) })),
  }));
  const highlighted = new Set(monthsOfPeriod(period).map(monthKeyOfMonth));

  const legend = new Map();
  for (const month of stack) {
    for (const part of month.parts) {
      const entry = legend.get(part.id ?? "none") ?? { id: part.id, name: part.name, total: 0 };
      entry.total += part.total;
      legend.set(part.id ?? "none", entry);
    }
  }
  const legendItems = [...legend.values()].sort((a, b) => b.total - a.total).slice(0, 8);
  const grand = stack.reduce((sum, month) => sum + month.total, 0);

  const sharedExpenses = allExpenses.filter((expense) => expense.paymentSource === "SHARED_CARD");
  const spent = monthlyTotals(sharedExpenses, (expense) => expense.price, months);
  const paidIn = monthlyTotals(deposits, (deposit) => deposit.amount, months);
  const budgetRows = months
    .map((month, position) => ({
      key: monthKeyOfMonth(month),
      label: monthLabel(month),
      paidIn: paidIn[position],
      spent: spent[position],
    }))
    .reverse();
  const sum = (field) => budgetRows.reduce((total, row) => total + row[field], 0);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Card>
        <h2 className="font-display text-xl font-bold">Wydatki miesiąc po miesiącu</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Średnio {formatMoney(grand / (months.length || 1))} na miesiąc. Dotknij miesiąca, żeby zobaczyć, z czego się składał.
        </p>
        <ColumnChart
          columns={columns}
          highlighted={highlighted}
          onSelect={(key) => set({ p: key, tab: "categories", cat: "" })}
          formatValue={formatMoney}
          full={desktop}
        />
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {legendItems.map((item) => (
            <li key={item.id ?? "none"} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colorOf(item.id) }} aria-hidden="true" />
              {item.name}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-bold">Wpłaty i wydatki z karty wspólnej</h2>
        <p className="mb-3 text-sm text-neutral-400">
          Czy z wpłat starcza na wydatki. Nie zależy od filtrów ani od wybranego okresu.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] text-right tabular-nums">
            <thead className="text-sm text-neutral-400">
              <tr className="border-b border-neutral-800">
                <th className="py-2 text-left font-medium">Miesiąc</th>
                <th className="py-2 font-medium">Wpłaty</th>
                <th className="py-2 font-medium">Wydatki</th>
                <th className="py-2 font-medium">Różnica</th>
              </tr>
            </thead>
            <tbody>
              {budgetRows.map((row) => {
                const diff = Math.round((row.paidIn - row.spent) * 100) / 100;
                return (
                  <tr key={row.key} className="border-b border-neutral-800">
                    <td className="py-2.5 text-left capitalize">{row.label}</td>
                    <td className="py-2.5">{formatMoney(row.paidIn)}</td>
                    <td className="py-2.5">{formatMoney(row.spent)}</td>
                    <td className={`py-2.5 font-bold ${diff < 0 ? "text-danger" : "text-gain"}`}>
                      {diff === 0 ? formatMoney(0) : formatDelta(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="py-3 text-left">Razem</td>
                <td className="py-3">{formatMoney(sum("paidIn"))}</td>
                <td className="py-3">{formatMoney(sum("spent"))}</td>
                <td className="py-3">{formatDelta(Math.round((sum("paidIn") - sum("spent")) * 100) / 100)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TimeTab;
