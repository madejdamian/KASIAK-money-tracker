import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Delta, countLabel, percentLabel } from "./Changes";
import { formatMoney } from "../../util/format";

// Rows of one level: colour, name, amount, a bar for the share of the whole, and the change.
// `onSelect(row)` makes a row tappable; `colorOf(row)` picks its colour.
const CategoryList = ({ rows, colorOf, onSelect }) => (
  <ul className="flex flex-col">
    {rows.map((row) => {
      const gone = row.status === "gone";
      const color = colorOf(row);
      const inner = (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className={`truncate font-medium ${gone ? "text-neutral-500" : ""}`}>
                {row.name}
              </span>
              {onSelect && row.expandable && (
                <FontAwesomeIcon icon={faChevronRight} className="text-xs text-neutral-500" />
              )}
            </span>
            <span className={`font-bold tabular-nums ${gone ? "text-neutral-500" : ""}`}>
              {gone ? formatMoney(row.prevTotal) : formatMoney(row.total)}
            </span>
          </div>
          {!gone && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(row.share * 100, row.total > 0 ? 1 : 0)}%`, backgroundColor: color }}
              />
            </div>
          )}
          <div className="mt-1 flex items-baseline justify-between gap-3 text-sm text-neutral-400">
            <span>{gone ? "w poprzednim okresie" : `${percentLabel(row)} · ${countLabel(row.count)}`}</span>
            <Delta row={row} />
          </div>
        </>
      );

      return (
        <li key={row.id ?? "none"} className="border-b border-neutral-800 last:border-b-0">
          {onSelect && row.id != null && !row.direct && !gone ? (
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="block w-full rounded-xl px-2 py-3 -mx-2 text-left transition-colors hover:bg-neutral-800/60"
            >
              {inner}
            </button>
          ) : (
            <div className="py-3">{inner}</div>
          )}
        </li>
      );
    })}
  </ul>
);

export default CategoryList;
