import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import {
  Card,
  ErrorText,
  PageHeader,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchBudgetSummary } from "../../http/budget";
import { fetchPending } from "../../http/recurring";
import { formatMoney } from "../../util/format";
import { useMonthParam } from "../../util/useMonthParam";

const Row = ({ label, value, muted = false }) => (
  <div
    className={`flex items-center justify-between gap-4 py-2 ${
      muted ? "text-neutral-500" : ""
    }`}
  >
    <span>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

const Budget = () => {
  const [month, setMonth] = useMonthParam();

  const { data, isPending, error } = useQuery({
    queryKey: ["budget", month],
    queryFn: () => fetchBudgetSummary(month),
  });

  const pendingQuery = useQuery({
    queryKey: ["recurring", "pending"],
    queryFn: fetchPending,
  });
  const pendingCount = pendingQuery.data?.length ?? 0;

  return (
    <>
      <PageHeader title="Budżet" />
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="px-4 flex flex-col gap-4 mt-2">
        {isPending && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {pendingCount > 0 && (
          <Link
            to="/recurring"
            className="block rounded-2xl bg-secondColor/20 border border-secondColor p-4"
          >
            Wydatki cykliczne do potwierdzenia: <strong>{pendingCount}</strong>
          </Link>
        )}

        {data && (
          <>
            <Card>
              <p className="text-sm text-neutral-400">Pozostało na wspólnym koncie</p>
              <p
                className={`text-4xl font-semibold mt-1 tabular-nums ${
                  data.balance < 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {formatMoney(data.balance)}
              </p>
              {data.balance < 0 && (
                <p className="text-sm text-neutral-400 mt-2">
                  Ujemne saldo nie przenosi się na następny miesiąc.
                </p>
              )}
            </Card>

            <Card>
              <Row
                label="Przeniesione z poprzedniego miesiąca"
                value={formatMoney(data.carriedOver)}
              />
              <Row label="Wpłaty miesięczne" value={formatMoney(data.monthlyDeposits)} />
              <Row label="Wpłaty dodatkowe" value={formatMoney(data.extraDeposits)} />
              <Row
                label="Wydatki ze wspólnej karty"
                value={`− ${formatMoney(data.sharedSpent)}`}
              />
              <hr className="border-neutral-700 my-1" />
              <Row
                muted
                label="Wydatki z kart prywatnych (poza budżetem)"
                value={formatMoney(data.privateSpent)}
              />
            </Card>

            <Card>
              <h2 className="font-semibold mb-1">Wpłaty domowników</h2>
              {data.depositsByMember.length === 0 && (
                <p className="text-neutral-500 py-2">Brak wpłat w tym miesiącu.</p>
              )}
              {data.depositsByMember.map((deposit) => (
                <Row
                  key={deposit.memberId ?? "none"}
                  label={deposit.memberName ?? "Nieznany"}
                  value={formatMoney(deposit.total)}
                />
              ))}
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/expenses/new" className={`${primaryButtonClass} flex items-center justify-center`}>
                + Wydatek
              </Link>
              <Link to="/deposits/new" className={`${secondaryButtonClass} flex items-center justify-center`}>
                + Wpłata
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Budget;
