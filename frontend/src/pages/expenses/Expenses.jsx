import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import {
  ErrorText,
  PageHeader,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchCategoryTree } from "../../http/categories";
import { fetchExpenses } from "../../http/expenses";
import { fetchMembers } from "../../http/members";
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
  const [month, setMonth] = useMonthParam();
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isPending, error } = useQuery({
    queryKey: ["expenses", month],
    queryFn: () => fetchExpenses(month),
  });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });

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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Expenses;
