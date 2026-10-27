import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import { ErrorText, PageHeader, primaryButtonClass } from "../../components/ui/ui";
import { fetchExpenses } from "../../http/expenses";
import { formatDay, formatMoney, formatUsage } from "../../util/format";
import { useMonthParam } from "../../util/useMonthParam";

const cardLabel = {
  SHARED_CARD: "wspólna",
  PRIVATE_CARD: "prywatna",
};

const Expenses = () => {
  const [month, setMonth] = useMonthParam();

  const { data, isPending, error } = useQuery({
    queryKey: ["expenses", month],
    queryFn: () => fetchExpenses(month),
  });

  const expenses = [...(data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const total = expenses.reduce((sum, expense) => sum + Number(expense.price), 0);

  return (
    <>
      <PageHeader title="Wydatki">
        <Link to="/expenses/new" className={`${primaryButtonClass} flex items-center`}>
          + Dodaj
        </Link>
      </PageHeader>
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="px-4 mt-2">
        {isPending && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {data && (
          <p className="text-sm text-neutral-400 mb-3">
            {expenses.length} wydatków, razem {formatMoney(total)}
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
