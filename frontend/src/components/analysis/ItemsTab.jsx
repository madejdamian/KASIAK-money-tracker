import React, { useState } from "react";
import { Card, Segmented, secondaryButtonClass } from "../ui/ui";
import { EmptyState, countLabel } from "./Changes";
import { ExpenseRow } from "./CategoryDetail";
import { totalOf } from "../../util/analysis";
import { topExpenses } from "../../util/analytics";
import { formatMoney } from "../../util/format";

const sortOptions = [
  { value: "largest", label: "Największe" },
  { value: "latest", label: "Najnowsze" },
];

const PAGE = 30;

// Every expense of the period, biggest first or newest first.
const ItemsTab = ({ current }) => {
  const [sort, setSort] = useState("largest");
  const [limit, setLimit] = useState(PAGE);

  if (current.length === 0) return <EmptyState />;

  const sorted =
    sort === "largest"
      ? topExpenses(current, current.length)
      : [...current].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-neutral-300">
          {countLabel(current.length)}, razem <strong className="text-neutral-50">{formatMoney(totalOf(current))}</strong>
        </p>
        <div className="lg:w-72">
          <Segmented name="sort" value={sort} onChange={setSort} options={sortOptions} />
        </div>
      </div>

      <ul className="mt-2 lg:grid lg:grid-cols-2 lg:gap-x-10">
        {sorted.slice(0, limit).map((expense) => (
          <ExpenseRow key={expense.slug} expense={expense} />
        ))}
      </ul>

      {sorted.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((value) => value + PAGE)}
          className={`${secondaryButtonClass} mt-3 w-full`}
        >
          Pokaż więcej ({sorted.length - limit})
        </button>
      )}
    </Card>
  );
};

export default ItemsTab;
