import React from "react";
import { Segmented } from "../ui/ui";
import BarRow from "./BarRow";
import { childrenBreakdown, labelOf, rollupByDepth, totalOf } from "../../util/analysis";
import { formatMoney } from "../../util/format";

const modeOptions = [
  { value: "drill", label: "Drzewo" },
  { value: "0", label: "Poz. 1" },
  { value: "1", label: "Poz. 2" },
  { value: "2", label: "Poz. 3" },
];

// Spending by category. "Drzewo" lets the user open a category and look inside it;
// "Poz. N" shows a flat list rolled up to the N-th level of the category tree.
const CategoryBreakdown = ({
  expenses,
  index,
  mode,
  onModeChange,
  path,
  onPathChange,
}) => {
  const openedId = path.length === 0 ? null : path[path.length - 1];

  const items =
    mode === "drill"
      ? childrenBreakdown(expenses, index, openedId)
      : rollupByDepth(expenses, index, Number(mode));

  const total = totalOf(expenses);
  const largest = items.length === 0 ? 0 : items[0].total;

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        name="breakdownMode"
        value={mode}
        onChange={onModeChange}
        options={modeOptions}
      />

      {mode === "drill" && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => onPathChange([])}
            className={path.length === 0 ? "text-white" : "text-secondColor underline"}
          >
            Wszystko
          </button>
          {path.map((id, position) => (
            <React.Fragment key={id}>
              <span className="text-neutral-600">›</span>
              <button
                type="button"
                onClick={() => onPathChange(path.slice(0, position + 1))}
                className={
                  position === path.length - 1
                    ? "text-white"
                    : "text-secondColor underline"
                }
              >
                {index.get(id)?.name ?? labelOf(index, id)}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-neutral-500 py-2">Brak wydatków w tym okresie.</p>
      )}

      <div>
        {items.map((item) => (
          <BarRow
            key={item.id ?? "none"}
            label={item.name}
            value={`${formatMoney(item.total)} · ${Math.round(item.share * 100)}%`}
            ratio={largest === 0 ? 0 : item.total / largest}
            hint={`${item.count} ${item.count === 1 ? "wydatek" : "wydatków"}`}
            tone={item.direct ? "muted" : "default"}
            onClick={
              mode === "drill" && item.id != null && !item.direct
                ? () => onPathChange([...path, item.id])
                : undefined
            }
          />
        ))}
      </div>

      {items.length > 0 && (
        <p className="text-sm text-neutral-400 border-t border-neutral-800 pt-3 flex justify-between">
          <span>Razem</span>
          <span className="tabular-nums">{formatMoney(total)}</span>
        </p>
      )}
    </div>
  );
};

export default CategoryBreakdown;
