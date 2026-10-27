import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import { ErrorText, PageHeader, primaryButtonClass } from "../../components/ui/ui";
import { fetchDeposits } from "../../http/deposits";
import { formatDay, formatMoney } from "../../util/format";
import { useMonthParam } from "../../util/useMonthParam";

const typeLabel = {
  MONTHLY: "miesięczna",
  EXTRA: "dodatkowa",
};

const Deposits = () => {
  const [month, setMonth] = useMonthParam();

  const { data, isPending, error } = useQuery({
    queryKey: ["deposits", month],
    queryFn: () => fetchDeposits(month),
  });

  const deposits = [...(data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const total = deposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0);

  return (
    <>
      <PageHeader title="Wpłaty">
        <Link to="/deposits/new" className={`${primaryButtonClass} flex items-center`}>
          + Dodaj
        </Link>
      </PageHeader>
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="px-4 mt-2">
        {isPending && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {data && (
          <p className="text-sm text-neutral-400 mb-3">
            {deposits.length} wpłat, razem {formatMoney(total)}
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {deposits.map((deposit) => (
            <li key={deposit.slug}>
              <Link
                to={`/deposits/${deposit.slug}`}
                className="block bg-surface rounded-2xl p-4 transition-colors hover:bg-neutral-900 active:bg-neutral-800 lg:grid lg:grid-cols-[7rem_1fr_16rem_10rem] lg:items-center lg:gap-6 lg:py-3.5"
              >
                <p className="hidden lg:block text-sm text-neutral-400">
                  {formatDay(deposit.date)}
                </p>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold break-words min-w-0">{deposit.title}</span>
                  <span className="font-semibold tabular-nums whitespace-nowrap text-brand lg:hidden">
                    {formatMoney(deposit.amount)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-1 lg:mt-0">
                  <span className="lg:hidden">{formatDay(deposit.date)} · </span>
                  {deposit.memberName ?? "?"} · {typeLabel[deposit.depositType] ?? "?"}
                </p>
                <span className="hidden lg:block text-right text-lg font-semibold tabular-nums text-brand">
                  {formatMoney(deposit.amount)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Deposits;
