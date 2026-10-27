import React from "react";
import { Card } from "../ui/ui";
import CategoryList from "./CategoryList";
import CategoryDetail from "./CategoryDetail";
import StackedBar from "./StackedBar";
import { EmptyState } from "./Changes";
import { chainOf } from "../../util/analysis";
import { categoryRows, compositionParts, siblingIds } from "../../util/analytics";
import { PALETTE, REST_COLOR, colorFor } from "../../util/palette";
import { formatMoney } from "../../util/format";

// Where the money went: the categories level by level (tap one to go inside it). The category
// being looked at shows its details next to the list.
const CategoriesTab = ({ state, set, index, scoped, current, baselineExpenses, period, today }) => {
  const focusId = state.cat !== "" && index.has(Number(state.cat)) ? Number(state.cat) : null;

  if (current.length === 0) return <EmptyState />;

  const rows = categoryRows(current, baselineExpenses, index, focusId);

  const siblings = siblingIds(index, focusId);
  const colorOf = (row) => (row.direct || row.id == null ? REST_COLOR : colorFor(siblings, row.id));
  const hasChildren = focusId == null || index.get(focusId).children.length > 0;
  const chain = chainOf(index, focusId);
  const focusColor = focusId == null ? PALETTE[0] : colorFor(siblingIds(index, index.get(focusId).parentId), focusId);

  // what the rows below add up to (the chosen category, or everything on the top level)
  const levelTotal = rows.reduce((sum, row) => sum + Math.round(row.total * 100), 0) / 100;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4 lg:col-span-7">
        <Card>
          <nav aria-label="Ścieżka kategorii" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <button
                type="button"
                onClick={() => set({ cat: "" })}
                className={focusId == null ? "font-bold" : "text-brand underline"}
              >
                Wszystko
              </button>
              {chain.map((id, position) => (
                <React.Fragment key={id}>
                  <span className="text-neutral-600">›</span>
                  <button
                    type="button"
                    onClick={() => set({ cat: String(id) })}
                    className={position === chain.length - 1 ? "font-bold" : "text-brand underline"}
                  >
                    {index.get(id).name}
                  </button>
                </React.Fragment>
              ))}
            </nav>

          {hasChildren ? (
            <>
              <StackedBar
                parts={compositionParts(rows, colorOf, REST_COLOR)}
                label="Struktura wydatków"
              />
              <p className="mt-2 text-sm text-neutral-400">
                Razem {formatMoney(levelTotal)}
              </p>
              <div className="mt-2">
                <CategoryList
                  rows={rows}
                  colorOf={colorOf}
                  onSelect={(row) => set({ cat: String(row.id) })}
                />
              </div>
            </>
          ) : (
            <p className="text-neutral-400">
              Ta kategoria nie ma podkategorii. Jej wydatki są obok (na telefonie poniżej).
            </p>
          )}
        </Card>
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-6">
          <CategoryDetail
            focusId={focusId}
            index={index}
            scoped={scoped}
            periodExpenses={current}
            baselineExpenses={baselineExpenses}
            period={period}
            today={today}
            color={focusColor}
            onPickMonth={(key) => set({ p: key, cat: state.cat })}
          />
      </div>
    </div>
  );
};

export default CategoriesTab;
