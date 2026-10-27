import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorText, PageHeader, Segmented } from "../../components/ui/ui";
import PeriodBar from "../../components/analysis/PeriodBar";
import OverviewTab from "../../components/analysis/OverviewTab";
import CategoriesTab from "../../components/analysis/CategoriesTab";
import TagsTab from "../../components/analysis/TagsTab";
import TimeTab from "../../components/analysis/TimeTab";
import ItemsTab from "../../components/analysis/ItemsTab";
import { fetchCategoryTree } from "../../http/categories";
import { fetchAllDeposits } from "../../http/deposits";
import { fetchExpenses } from "../../http/expenses";
import { fetchMembers } from "../../http/members";
import { fetchTags } from "../../http/tags";
import { buildCategoryIndex } from "../../util/analysis";
import { earliestDate, expensesOfPeriod, scopeExpenses } from "../../util/analytics";
import { flattenCategories, toInputDateTime } from "../../util/format";
import { baselinePeriod, resolvePeriod } from "../../util/period";
import { useAnalysisParams } from "../../util/useAnalysisParams";

const tabOptions = [
  { value: "overview", label: "Przegląd" },
  { value: "categories", label: "Kategorie" },
  { value: "time", label: "W czasie" },
  { value: "items", label: "Pozycje" },
  { value: "tags", label: "Tagi" },
];

const NONE = [];

// The analysis screen. All the numbers are worked out here from every expense, so any period,
// comparison and filter is just a different way of slicing the same data.
const Analysis = () => {
  const [state, set] = useAnalysisParams();

  const expensesQuery = useQuery({ queryKey: ["expenses", "all"], queryFn: () => fetchExpenses() });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  const depositsQuery = useQuery({ queryKey: ["deposits", "all"], queryFn: fetchAllDeposits });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  const today = toInputDateTime().slice(0, 10);
  const expenses = expensesQuery.data ?? NONE;

  const index = useMemo(
    () => buildCategoryIndex(flattenCategories(categoriesQuery.data ?? NONE)),
    [categoriesQuery.data]
  );

  // member, card and tag filters apply to everything; the category is chosen by drilling down
  const scoped = useMemo(
    () => scopeExpenses(expenses, index, { memberId: state.member, source: state.card, tag: state.tag }),
    [expenses, index, state.member, state.card, state.tag]
  );

  const period = useMemo(
    () =>
      resolvePeriod(state.p, {
        today,
        earliest: earliestDate(scoped),
        from: state.from,
        to: state.to,
      }),
    [state.p, state.from, state.to, today, scoped]
  );
  const baseline = useMemo(() => baselinePeriod(period, state.cmp), [period, state.cmp]);

  const current = useMemo(() => expensesOfPeriod(scoped, period), [scoped, period]);
  const baselineExpenses = useMemo(
    () => (baseline ? expensesOfPeriod(scoped, baseline) : null),
    [scoped, baseline]
  );

  const loading =
    expensesQuery.isPending || categoriesQuery.isPending || depositsQuery.isPending;
  const error =
    expensesQuery.error ?? categoriesQuery.error ?? depositsQuery.error ?? membersQuery.error;

  const shared = { state, set, index, current, baselineExpenses, period, baseline, today };

  return (
    <>
      <PageHeader title="Analizy" />

      <div className="px-4 mt-2 flex flex-col gap-4 lg:mt-4 lg:gap-6">
        <PeriodBar
          state={state}
          set={set}
          period={period}
          baseline={baseline}
          members={membersQuery.data ?? NONE}
          tags={tagsQuery.data ?? NONE}
          today={today}
        />

        <div className="lg:max-w-2xl">
          <Segmented
            name="tab"
            value={state.tab}
            onChange={(value) => set({ tab: value })}
            options={tabOptions}
          />
        </div>

        {loading && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {!loading && !error && state.tab === "overview" && <OverviewTab {...shared} />}
        {!loading && !error && state.tab === "categories" && (
          <CategoriesTab {...shared} scoped={scoped} />
        )}
        {!loading && !error && state.tab === "tags" && (
          <TagsTab
            set={set}
            current={current}
            baselineExpenses={baselineExpenses}
            tagCount={(tagsQuery.data ?? NONE).length}
          />
        )}
        {!loading && !error && state.tab === "time" && (
          <TimeTab
            set={set}
            index={index}
            scoped={scoped}
            allExpenses={expenses}
            deposits={depositsQuery.data ?? NONE}
            period={period}
            today={today}
          />
        )}
        {!loading && !error && state.tab === "items" && <ItemsTab current={current} />}
      </div>
    </>
  );
};

export default Analysis;
