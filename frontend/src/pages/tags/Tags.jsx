import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BarRow from "../../components/analysis/BarRow";
import { Card, ErrorText, PageHeader } from "../../components/ui/ui";
import { fetchCategoryTree } from "../../http/categories";
import { fetchExpenses } from "../../http/expenses";
import { fetchTags } from "../../http/tags";
import TagsSection from "../settings/TagsSection";
import {
  buildCategoryIndex,
  expensesWithTag,
  rollupByDepth,
  tagTotals,
  totalOf,
} from "../../util/analysis";
import { flattenCategories, formatDay, formatMoney } from "../../util/format";

const TagList = ({ expenses }) => {
  const totals = tagTotals(expenses);
  const largest = totals.length === 0 ? 0 : totals[0].total;

  return (
    <Card>
      {totals.length === 0 && (
        <p className="text-neutral-500">
          Żaden wydatek nie ma jeszcze tagu. Dodaj tag poniżej, a potem wybierz go w formularzu wydatku.
        </p>
      )}
      {totals.map((tag) => (
        <Link key={tag.id} to={`/tags?tag=${encodeURIComponent(tag.id)}`} className="block">
          <BarRow
            label={`#${tag.name}`}
            value={formatMoney(tag.total)}
            ratio={largest === 0 ? 0 : tag.total / largest}
            hint={`${tag.count} ${tag.count === 1 ? "wydatek" : "wydatków"}`}
          />
        </Link>
      ))}
    </Card>
  );
};

const TagDetails = ({ tag, expenses, index }) => {
  const tagged = expensesWithTag(expenses, tag).sort((a, b) => b.date.localeCompare(a.date));
  // the whole tree flattened to the deepest level: where did the money go
  const byCategory = rollupByDepth(tagged, index, 99);
  const largest = byCategory.length === 0 ? 0 : byCategory[0].total;

  return (
    <>
      <Card>
        <p className="text-sm text-neutral-400">Razem #{tag}</p>
        <p className="text-3xl font-semibold mt-1 tabular-nums">
          {formatMoney(totalOf(tagged))}
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          {tagged.length} {tagged.length === 1 ? "wydatek" : "wydatków"}
          {tagged.length > 0 &&
            `, od ${formatDay(tagged[tagged.length - 1].date)} do ${formatDay(tagged[0].date)}`}
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-bold mb-1">Wg kategorii</h2>
        {byCategory.map((item) => (
          <BarRow
            key={item.id ?? "none"}
            label={item.name}
            value={`${formatMoney(item.total)} · ${Math.round(item.share * 100)}%`}
            ratio={largest === 0 ? 0 : item.total / largest}
          />
        ))}
      </Card>

      <Card>
        <h2 className="font-display text-xl font-bold mb-2">Wydatki</h2>
        <ul className="flex flex-col">
          {tagged.map((expense) => (
            <li key={expense.slug} className="border-b border-neutral-800 last:border-b-0">
              <Link to={`/expenses/${expense.slug}`} className="flex justify-between gap-3 py-3">
                <span className="min-w-0 break-words">
                  {expense.title}
                  <span className="block text-sm text-neutral-500">
                    {formatDay(expense.date)} · {expense.categoryPath.join(" › ")}
                  </span>
                </span>
                <span className="tabular-nums whitespace-nowrap">
                  {formatMoney(expense.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
};

// Tags follow a project across categories and months, so this looks at all expenses ever.
const Tags = () => {
  const [params] = useSearchParams();
  const tag = params.get("tag");

  const expensesQuery = useQuery({
    queryKey: ["expenses", "all"],
    queryFn: () => fetchExpenses(),
  });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  const index = useMemo(
    () => buildCategoryIndex(flattenCategories(categoriesQuery.data ?? [])),
    [categoriesQuery.data]
  );

  const ready = expensesQuery.data && categoriesQuery.data;

  return (
    <>
      <PageHeader title={tag ? `#${tag}` : "Tagi"}>
        {tag && (
          <Link to="/tags" className="text-brand underline">
            Wszystkie tagi
          </Link>
        )}
      </PageHeader>

      <div className="px-4 mt-2 flex flex-col gap-4 lg:max-w-4xl">
        {!ready && !expensesQuery.error && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{expensesQuery.error ?? categoriesQuery.error}</ErrorText>

        {ready && !tag && <TagList expenses={expensesQuery.data} />}
        {ready && !tag && (
          <Card>
            <h2 className="font-display text-xl font-bold mb-3">Dodaj i usuń tagi</h2>
            <TagsSection tags={tagsQuery.data ?? []} />
          </Card>
        )}
        {ready && tag && (
          <TagDetails tag={tag} expenses={expensesQuery.data} index={index} />
        )}
      </div>
    </>
  );
};

export default Tags;
