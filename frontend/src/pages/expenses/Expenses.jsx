import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import {
  ErrorText,
  PageHeader,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchCategoryTree } from "../../http/categories";
import { deleteExpense, fetchExpenses } from "../../http/expenses";
import { fetchMembers } from "../../http/members";
import { fetchTags } from "../../http/tags";
import { fetchTemplates, applyTemplate } from "../../http/templates";
import { buildCategoryIndex } from "../../util/analysis";
import { applyExpenseFilters, emptyFilters, hasActiveFilters } from "../../util/filters";
import {
  flattenCategories,
  formatDay,
  formatMoney,
  formatUsage,
} from "../../util/format";
import { useMonthParam } from "../../util/useMonthParam";

const cardLabel = {
  SHARED_CARD: "wspólna",
  PRIVATE_CARD: "prywatna",
};

const Expenses = () => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useMonthParam();
  const [added, setAdded] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isPending, error } = useQuery({
    queryKey: ["expenses", month],
    queryFn: () => fetchExpenses(month),
  });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const templatesQuery = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });

  function refreshAfterChange() {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
  }

  // one tap adds an expense dated now; it can be undone right away
  const quickAdd = useMutation({
    mutationFn: applyTemplate,
    onSuccess: (expense) => {
      setAdded(expense);
      refreshAfterChange();
    },
  });

  const undo = useMutation({
    mutationFn: (slug) => deleteExpense(slug),
    onSuccess: () => {
      setAdded(null);
      refreshAfterChange();
    },
  });

  function handleQuickAdd(template) {
    setAdded(null);
    if (template.price != null) {
      quickAdd.mutate({ id: template.id });
      return;
    }
    const answer = window.prompt(`Kwota dla „${template.name}” (zł):`);
    const price = Number((answer ?? "").replace(",", "."));
    if (answer !== null && price > 0) {
      quickAdd.mutate({ id: template.id, changes: { price } });
    }
  }

  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );
  const index = useMemo(() => buildCategoryIndex(categories), [categories]);

  const expenses = applyExpenseFilters(data ?? [], index, filters).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const total = expenses.reduce((sum, expense) => sum + Number(expense.price), 0);
  const filtered = hasActiveFilters(filters);

  function setFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <PageHeader title="Wydatki">
        <Link to="/expenses/new" className={`${primaryButtonClass} flex items-center`}>
          + Dodaj
        </Link>
      </PageHeader>
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="px-4 mt-2">
        {(templatesQuery.data ?? []).length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-neutral-400 mb-2">Szybkie dodawanie</p>
            <div className="flex flex-wrap gap-2">
              {templatesQuery.data.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  disabled={quickAdd.isPending}
                  onClick={() => handleQuickAdd(template)}
                  className="h-11 px-4 rounded-full bg-thirdColor border border-neutral-700 text-sm active:bg-neutral-800 disabled:opacity-60"
                >
                  {template.name}
                  {template.price != null && ` · ${formatMoney(template.price)}`}
                </button>
              ))}
            </div>
            {added && (
              <p className="text-sm text-emerald-400 mt-2">
                Dodano: {added.title}, {formatMoney(added.price)}.{" "}
                <button
                  type="button"
                  className="underline"
                  disabled={undo.isPending}
                  onClick={() => undo.mutate(added.slug)}
                >
                  Cofnij
                </button>
              </p>
            )}
            <ErrorText>{quickAdd.error ?? undo.error}</ErrorText>
          </div>
        )}

        <div className="flex gap-4 text-sm mb-4">
          <Link to="/recurring" className="text-secondColor underline">
            Cykliczne
          </Link>
          <Link to="/templates" className="text-secondColor underline">
            Szablony
          </Link>
          <Link to="/tags" className="text-secondColor underline">
            Tagi
          </Link>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="search"
            aria-label="Szukaj"
            placeholder="Szukaj wydatku"
            value={filters.text}
            onChange={(e) => setFilter("text", e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`${secondaryButtonClass} px-4 shrink-0 ${filtered ? "outline outline-2 outline-secondColor" : ""}`}
          >
            Filtry
          </button>
        </div>

        {showFilters && (
          <div className="bg-thirdColor rounded-2xl p-4 mb-3 flex flex-col gap-3">
            <select
              aria-label="Kategoria"
              value={filters.categoryId}
              onChange={(e) => setFilter("categoryId", e.target.value)}
              className={inputClass}
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Domownik"
              value={filters.memberId}
              onChange={(e) => setFilter("memberId", e.target.value)}
              className={inputClass}
            >
              <option value="">Wszyscy domownicy</option>
              {(membersQuery.data ?? []).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Tag"
              value={filters.tag}
              onChange={(e) => setFilter("tag", e.target.value)}
              className={inputClass}
            >
              <option value="">Wszystkie tagi</option>
              {(tagsQuery.data ?? []).map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            <select
              aria-label="Karta"
              value={filters.source}
              onChange={(e) => setFilter("source", e.target.value)}
              className={inputClass}
            >
              <option value="">Obie karty</option>
              <option value="SHARED_CARD">Karta wspólna</option>
              <option value="PRIVATE_CARD">Karta prywatna</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                aria-label="Kwota od"
                placeholder="Kwota od"
                value={filters.min}
                onChange={(e) => setFilter("min", e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                aria-label="Kwota do"
                placeholder="Kwota do"
                value={filters.max}
                onChange={(e) => setFilter("max", e.target.value)}
                className={inputClass}
              />
            </div>

            {filtered && (
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className={secondaryButtonClass}
              >
                Wyczyść filtry
              </button>
            )}
          </div>
        )}

        {isPending && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {data && (
          <p className="text-sm text-neutral-400 mb-3">
            {expenses.length} wydatków, razem {formatMoney(total)}
            {filtered && ` (po filtrach, z ${data.length})`}
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <li key={expense.slug}>
              <Link
                to={`/expenses/${expense.slug}`}
                className="block bg-thirdColor rounded-2xl p-4 active:bg-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold break-words min-w-0">{expense.title}</span>
                  <span className="font-semibold tabular-nums whitespace-nowrap">
                    {formatMoney(expense.price)}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  {expense.categoryPath.join(" › ") || "Bez kategorii"}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {formatDay(expense.date)} · {expense.memberName ?? "?"} · karta{" "}
                  {cardLabel[expense.paymentSource] ?? "?"}
                  {expense.usageAmount != null &&
                    ` · ${formatUsage(expense.usageAmount, expense.unit)}`}
                </p>
                {expense.tags?.length > 0 && (
                  <p className="text-xs text-secondColor mt-1">
                    {expense.tags.map((tag) => `#${tag}`).join(" ")}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Expenses;
