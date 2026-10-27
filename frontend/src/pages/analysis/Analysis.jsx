import React, { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import { Card, ErrorText, PageHeader, Segmented } from "../../components/ui/ui";
import CategoryBreakdown from "../../components/analysis/CategoryBreakdown";
import TrendBars from "../../components/analysis/TrendBars";
import { ChangesList, DeltaLine } from "../../components/analysis/Comparison";
import { fetchCategoryTree } from "../../http/categories";
import { fetchExpenses } from "../../http/expenses";
import {
  biggestChanges,
  buildCategoryIndex,
  expensesBySource,
  expensesInCategory,
  expensesInMonth,
  monthKeyOf,
  monthlySeries,
  totalOf,
} from "../../util/analysis";
import {
  flattenCategories,
  formatMoney,
  formatUsage,
  shiftMonth,
} from "../../util/format";
import { useMonthParam } from "../../util/useMonthParam";

const sourceOptions = [
  { value: "ALL", label: "Wszystkie" },
  { value: "SHARED_CARD", label: "Wspólna" },
  { value: "PRIVATE_CARD", label: "Prywatna" },
];

const Analysis = () => {
  const [month, setMonth] = useMonthParam();
  const [source, setSource] = useState("ALL");
  const [mode, setMode] = useState("drill");
  const [path, setPath] = useState([]);
  const [trendField, setTrendField] = useState("price");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoryTree,
  });

  // 12 months back from the selected one can reach into the previous year
  const yearQueries = useQueries({
    queries: [month.year, month.year - 1].map((year) => ({
      queryKey: ["expenses", "year", year],
      queryFn: () => fetchExpenses({ year }),
    })),
  });

  const index = useMemo(
    () => buildCategoryIndex(flattenCategories(categoriesQuery.data ?? [])),
    [categoriesQuery.data]
  );

  const thisYear = yearQueries[0].data;
  const previousYear = yearQueries[1].data;
  const allExpenses = useMemo(
    () => [...(thisYear ?? []), ...(previousYear ?? [])],
    [thisYear, previousYear]
  );

  const scoped = expensesBySource(allExpenses, source);
  const current = expensesInMonth(scoped, month);
  const previous = expensesInMonth(scoped, shiftMonth(month, -1));
  const lastYear = expensesInMonth(scoped, shiftMonth(month, -12));

  const openedId = mode === "drill" && path.length > 0 ? path[path.length - 1] : null;
  const openedCategory = openedId == null ? null : index.get(openedId);
  const trendScope = expensesInCategory(scoped, index, openedId);
  const usageUnit = openedCategory?.unit ?? null;
  const field = usageUnit ? trendField : "price";

  const series = monthlySeries(trendScope, month, 12, { field });
  const changeDepth = mode === "drill" ? 0 : Number(mode);
  const changes = biggestChanges(current, previous, index, changeDepth);

  const loading = categoriesQuery.isPending || yearQueries.some((q) => q.isPending);
  const error = categoriesQuery.error ?? yearQueries.find((q) => q.error)?.error;

  function changeMonth(next) {
    setMonth(next);
    setPath([]);
  }

  return (
    <>
      <PageHeader title="Analizy" />
      <MonthSwitcher value={month} onChange={changeMonth} />

      <div className="px-4 flex flex-col gap-4 mt-2">
        <Segmented
          name="source"
          value={source}
          onChange={setSource}
          options={sourceOptions}
        />

        {loading && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {!loading && !error && (
          <>
            <Card>
              <p className="text-sm text-neutral-400">Wydatki w tym miesiącu</p>
              <p className="text-3xl font-semibold mt-1 tabular-nums">
                {formatMoney(totalOf(current))}
              </p>
              <div className="mt-3 border-t border-neutral-800 pt-2">
                <DeltaLine
                  label="Poprzedni miesiąc"
                  current={totalOf(current)}
                  previous={totalOf(previous)}
                />
                <DeltaLine
                  label="Rok temu"
                  current={totalOf(current)}
                  previous={totalOf(lastYear)}
                />
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold mb-3">Wydatki wg kategorii</h2>
              <CategoryBreakdown
                expenses={current}
                index={index}
                mode={mode}
                onModeChange={(value) => {
                  setMode(value);
                  setPath([]);
                }}
                path={path}
                onPathChange={setPath}
              />
            </Card>

            <Card>
              <h2 className="font-semibold mb-1">Największe zmiany</h2>
              <p className="text-sm text-neutral-500 mb-2">
                Względem poprzedniego miesiąca, wg wybranego poziomu kategorii.
              </p>
              <ChangesList changes={changes} />
            </Card>

            <Card>
              <h2 className="font-semibold">
                Ostatnie 12 miesięcy
                {openedCategory ? `: ${openedCategory.name}` : ""}
              </h2>
              {usageUnit && (
                <div className="my-3">
                  <Segmented
                    name="trendField"
                    value={field}
                    onChange={setTrendField}
                    options={[
                      { value: "price", label: "Kwota" },
                      { value: "usage", label: `Zużycie (${usageUnit})` },
                    ]}
                  />
                </div>
              )}
              <TrendBars
                series={series}
                highlightKey={monthKeyOf(month)}
                formatValue={(value) =>
                  field === "usage" ? formatUsage(value, usageUnit) : formatMoney(value)
                }
              />
              {!usageUnit && (
                <p className="text-xs text-neutral-500 mt-2">
                  Otwórz w drzewie kategorię z jednostką (np. Prąd), aby zobaczyć trend
                  zużycia.
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default Analysis;
