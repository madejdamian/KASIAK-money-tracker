import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import UtilityCard from "../../components/usage/UtilityCard";
import {
  ErrorText,
  PageHeader,
  inputClass,
  primaryButtonClass,
} from "../../components/ui/ui";
import { fetchCategoryTree } from "../../http/categories";
import { fetchExpenses } from "../../http/expenses";
import { deleteReading, fetchReadings, saveReading } from "../../http/usage";
import { buildCategoryIndex } from "../../util/analysis";
import { flattenCategories } from "../../util/format";
import { UTILITIES, utilitySeries } from "../../util/usage";
import { useMonthParam } from "../../util/useMonthParam";

// The field for one hand-entered medium. An empty value removes the reading of the month.
const ReadingEntry = ({ utility, month, saved }) => {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(saved == null ? "" : String(saved));
  const [done, setDone] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      value === ""
        ? deleteReading({ utility: utility.key, year: month.year, month: month.month })
        : saveReading({
            utility: utility.key,
            year: month.year,
            month: month.month,
            amount: Number(value),
          }),
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    setDone(false);
    // nothing to remove when the month never had a reading
    if (value === "" && saved == null) return;
    save.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={`usage-${utility.key}`} className="text-sm font-medium text-neutral-400">
        Zużycie w tym miesiącu ({utility.unit})
      </label>
      <div className="flex gap-2">
        <input
          id={`usage-${utility.key}`}
          type="number"
          inputMode="decimal"
          step="0.001"
          min="0"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setDone(false);
          }}
          className={inputClass}
        />
        <button type="submit" disabled={save.isPending} className={`${primaryButtonClass} shrink-0`}>
          {save.isPending ? "..." : "Zapisz"}
        </button>
      </div>
      {done && <p className="text-sm text-brand">Zapisano.</p>}
      <ErrorText>{save.error}</ErrorText>
    </form>
  );
};

const Usage = () => {
  const [month, setMonth] = useMonthParam();

  const readingsQuery = useQuery({ queryKey: ["usage"], queryFn: fetchReadings });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  // electricity comes from expenses; 12 months back can reach into the previous year
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
  const expenses = useMemo(
    () => yearQueries.flatMap((query) => query.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [yearQueries[0].data, yearQueries[1].data]
  );

  const loading =
    readingsQuery.isPending || categoriesQuery.isPending || yearQueries.some((q) => q.isPending);
  const error = readingsQuery.error ?? categoriesQuery.error ?? yearQueries.find((q) => q.error)?.error;
  const readings = readingsQuery.data ?? [];

  return (
    <>
      <PageHeader title="Zużycie" />
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="px-4 mt-2 flex flex-col gap-4 lg:mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        {loading && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {!loading &&
          !error &&
          UTILITIES.map((utility) => {
            const series = utilitySeries(utility, { readings, expenses, index }, month, 13);
            const current = series[series.length - 1];
            return (
              <UtilityCard
                key={utility.key}
                utility={utility}
                series={series}
                month={month}
                trendLength={6}
              >
                {utility.source === "readings" ? (
                  <ReadingEntry
                    // starts over when another month is opened or the saved value changes
                    key={`${utility.key}-${current.key}-${current.count ? current.value : "none"}`}
                    utility={utility}
                    month={month}
                    saved={current.count ? current.value : null}
                  />
                ) : (
                  <p className="text-sm text-neutral-400">
                    Prąd to wydatek miesięczny: zużycie wpisujesz przy dodawaniu wydatku.{" "}
                    <Link to="/expenses/new" className="text-brand underline">
                      Dodaj wydatek
                    </Link>
                  </p>
                )}
              </UtilityCard>
            );
          })}
      </div>
    </>
  );
};

export default Usage;
