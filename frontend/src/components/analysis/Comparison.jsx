import React from "react";
import { compare } from "../../util/analysis";
import { formatDelta, formatMoney, formatPercent } from "../../util/format";

// For spending, a rise is bad (red) and a fall is good (green).
const toneOf = (diff) =>
  diff > 0 ? "text-danger" : diff < 0 ? "text-brand" : "text-neutral-400";

// `format` / `formatDiff` default to money; usage passes its own (e.g. kWh)
export const DeltaLine = ({
  label,
  current,
  previous,
  format = formatMoney,
  formatDiff = formatDelta,
}) => {
  const result = compare(current, previous);
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-neutral-300">{label}</span>
      <span className="text-right tabular-nums">
        <span className="text-neutral-500 mr-2">{format(previous)}</span>
        <span className={toneOf(result.diff)}>
          {formatDiff(result.diff)} ({formatPercent(result.pct)})
        </span>
      </span>
    </div>
  );
};

export const ChangesList = ({ changes }) => (
  <ul className="flex flex-col">
    {changes.length === 0 && (
      <li className="text-neutral-500 py-2">Bez zmian względem poprzedniego miesiąca.</li>
    )}
    {changes.map((change) => (
      <li
        key={change.id ?? "none"}
        className="flex items-baseline justify-between gap-3 py-2 border-b border-neutral-800 last:border-b-0"
      >
        <span className="min-w-0 break-words">{change.name}</span>
        <span className="text-right tabular-nums whitespace-nowrap">
          <span className="text-neutral-500 mr-2">
            {formatMoney(change.previous)} → {formatMoney(change.current)}
          </span>
          <span className={toneOf(change.diff)}>{formatDelta(change.diff)}</span>
        </span>
      </li>
    ))}
  </ul>
);
