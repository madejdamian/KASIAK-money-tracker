import React, { useEffect, useState } from "react";

// true on the Full HD layout (the `lg` breakpoint), so charts can show more there than on the phone
export function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return matches;
}

const compact = new Intl.NumberFormat("pl-PL", { notation: "compact", maximumFractionDigits: 1 });

// a round number at or above the maximum, so the grid lines land on tidy values
function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= value / 4) ?? magnitude;
  return Math.ceil(value / step) * step;
}

/**
 * Columns over time, each split into coloured parts; tapping a column selects it.
 * columns: [{ key, label, total, parts: [{ value, color }] }]; highlighted: Set of keys (others dimmed).
 * `full` is the expanded version (Full HD): a value axis with grid lines and the amount over each column.
 */
const ColumnChart = ({ columns, highlighted, onSelect, formatValue, full = false }) => {
  const top = full ? niceMax(Math.max(0, ...columns.map((c) => c.total))) : Math.max(0, ...columns.map((c) => c.total));
  const dimOthers = highlighted && highlighted.size > 0;
  const height = full ? 300 : 150;
  const showValues = full && columns.length <= 16;
  const ticks = full ? [1, 0.75, 0.5, 0.25, 0] : [];

  return (
    <div className={full ? "flex gap-3" : ""}>
      {full && (
        <div className="relative w-14 shrink-0 text-right text-xs text-neutral-500 tabular-nums" style={{ height }}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${(1 - tick) * 100}%` }}
            >
              {compact.format(top * tick)}
            </span>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {full &&
            ticks.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-neutral-800"
                style={{ top: `${(1 - tick) * 100}%` }}
              />
            ))}

          <div className="relative flex h-full items-end justify-around gap-1.5">
            {columns.map((column) => {
              const dimmed = dimOthers && !highlighted.has(column.key);
              return (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => onSelect?.(column.key)}
                  title={`${column.label}: ${formatValue(column.total)}`}
                  aria-label={`${column.label}: ${formatValue(column.total)}`}
                  className={`group flex h-full min-w-0 flex-1 flex-col justify-end ${full ? "max-w-28" : ""}`}
                >
                  {showValues && column.total > 0 && (
                    <span className="mb-1 whitespace-nowrap text-center text-xs tabular-nums text-neutral-300">
                      {compact.format(column.total)}
                    </span>
                  )}
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-t-md transition-opacity group-hover:opacity-100"
                    style={{
                      height: top === 0 ? 0 : `${(column.total / top) * 100}%`,
                      minHeight: column.total > 0 ? 3 : 0,
                      opacity: dimmed ? 0.45 : 1,
                    }}
                  >
                    {column.parts
                      .filter((part) => part.value > 0)
                      .map((part, position) => (
                        <div
                          key={position}
                          style={{
                            height: `${(part.value / column.total) * 100}%`,
                            backgroundColor: part.color,
                          }}
                        />
                      ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex justify-around gap-1.5">
          {columns.map((column) => (
            <span
              key={column.key}
              className={`min-w-0 flex-1 truncate text-center ${full ? "max-w-28 text-xs" : "text-[10px]"} ${
                dimOthers && highlighted.has(column.key) ? "font-bold text-neutral-50" : "text-neutral-400"
              }`}
            >
              {column.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColumnChart;
