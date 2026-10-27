import React from "react";
import { Card } from "../ui/ui";
import { formatDelta, formatMoney, formatPercent } from "../../util/format";

// "1 wydatek", "2 wydatki", "5 wydatków"
export const plural = (n, one, few, many) => {
  if (n === 1) return one;
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? few : many;
};

export const countLabel = (n) => `${n} ${plural(n, "wydatek", "wydatki", "wydatków")}`;

// a share that rounds to 0 is still something
export const percentLabel = (row) => (row.total > 0 && row.percent === 0 ? "<1%" : `${row.percent}%`);

// The change of a row against the baseline. For spending a rise is bad (red), a fall good (green).
export const Delta = ({ row }) => {
  if (!row || row.status === "none") return null;
  if (row.status === "same") return <span className="text-neutral-500">bez zmian</span>;
  if (row.status === "new") return <span className="font-bold text-brand">nowe</span>;
  if (row.status === "gone") return <span className="font-bold text-gain">zniknęło</span>;

  const up = row.status === "up";
  return (
    <span className={`whitespace-nowrap font-bold tabular-nums ${up ? "text-danger" : "text-gain"}`}>
      {up ? "▲" : "▼"} {formatDelta(row.diff)}
      {row.pct != null && ` (${Math.abs(row.pct) < 0.005 ? "<1%" : formatPercent(row.pct)})`}
    </span>
  );
};

// The rows that changed the most, each with what it was and what it is now.
export const MovesList = ({ moves }) => (
  <ul className="flex flex-col">
    {moves.map((row) => (
      <li
        key={row.id ?? "none"}
        className="flex items-baseline justify-between gap-3 border-b border-neutral-800 py-3 last:border-b-0"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">{row.name}</span>
          <span className="block text-sm text-neutral-500 tabular-nums">
            {formatMoney(row.prevTotal)} → {formatMoney(row.total)}
          </span>
        </span>
        <Delta row={row} />
      </li>
    ))}
  </ul>
);

export const EmptyState = ({ title = "Brak wydatków w tym okresie", children }) => (
  <Card>
    <p className="font-display text-xl font-bold">{title}</p>
    <p className="mt-2 text-neutral-400">
      {children ?? "Zmień okres albo usuń filtry, żeby zobaczyć dane."}
    </p>
  </Card>
);
