import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh, faPiggyBank } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import MonthSwitcher from "../../components/ui/MonthSwitcher";
import Logo from "../../components/ui/Logo";
import QuickAdd from "../../components/ui/QuickAdd";
import {
  Card,
  ErrorText,
  PageHeader,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchBudgetSummary } from "../../http/budget";
import { fetchPending } from "../../http/recurring";
import { fetchPendingDeposits } from "../../http/recurringDeposits";
import { formatMoney } from "../../util/format";
import { useMonthParam } from "../../util/useMonthParam";

// start and end of the three "click" dashes from the logo (fan out from the bottom-left corner)
const DASHES = [
  [19, 32.4, 26.6, 16.1],
  [29.3, 41.1, 44, 30.7],
  [33.9, 53.7, 51.8, 52.2],
];

const Dashes = () => (
  <svg
    viewBox="0 0 64 64"
    aria-hidden="true"
    className="absolute right-5 top-5 w-10 text-on-brand/30 lg:right-8 lg:top-6 lg:w-16"
    fill="none"
    stroke="currentColor"
    strokeWidth="7"
    strokeLinecap="round"
  >
    {DASHES.map(([x1, y1, x2, y2], position) => (
      <line
        key={position}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="dash-pop"
        style={{ animationDelay: `${260 + position * 90}ms`, transformBox: "fill-box" }}
      />
    ))}
  </svg>
);

const Part = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="font-medium opacity-75">{label}</dt>
    <dd className="mt-1 font-bold tabular-nums text-[13px] lg:text-lg">{value}</dd>
  </div>
);

// The balance: a yellow plate (like the logo tile) with the month's sum underneath, kept modest in size.
// A negative balance turns the plate dark so the warning does not fight the yellow.
const BalancePlate = ({ data }) => {
  const negative = data.balance < 0;
  const deposits = Number(data.monthlyDeposits) + Number(data.extraDeposits);

  return (
    <section
      className={`plate-rise relative overflow-hidden rounded-[1.75rem] p-5 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:p-8 ${
        negative ? "bg-surface border border-danger/40" : "bg-brand text-on-brand"
      }`}
    >
      {!negative && <Dashes />}

      <div>
        <p className={`text-sm font-bold ${negative ? "text-neutral-400" : "opacity-75"}`}>
          Pozostały wspólny budżet
        </p>
        <p
          className={`font-display text-[2.5rem] font-light leading-none mt-2 tabular-nums lg:mt-3 lg:text-6xl ${
            negative ? "text-danger" : ""
          }`}
        >
          {formatMoney(data.balance)}
        </p>
        {negative && (
          <p className="text-sm text-neutral-400 mt-3">
            Ujemne saldo nie przenosi się na następny miesiąc.
          </p>
        )}
      </div>

      <dl
        className={`mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-sm lg:mt-0 lg:min-w-[34rem] lg:gap-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 ${
          negative ? "border-neutral-700" : "border-on-brand/20"
        }`}
      >
        <Part label="Przeniesione" value={formatMoney(data.carriedOver)} />
        <Part label="Wpłaty" value={`+${formatMoney(deposits)}`} />
        <Part label="Wydatki" value={`−${formatMoney(data.sharedSpent)}`} />
      </dl>
    </section>
  );
};

const Row = ({ label, value, muted = false }) => (
  <div
    className={`flex items-center justify-between gap-4 py-2.5 ${
      muted ? "text-neutral-500" : ""
    }`}
  >
    <span>{label}</span>
    <span className="tabular-nums font-medium">{value}</span>
  </div>
);

const Budget = () => {
  const [month, setMonth] = useMonthParam();
  const location = useLocation();
  const navigate = useNavigate();

  // after saving a new expense the form sends us here with what was added
  const [notice, setNotice] = useState(location.state?.added ?? null);
  useEffect(() => {
    if (!notice) return undefined;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
    // runs once for the notice that arrived with the navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isPending, error } = useQuery({
    queryKey: ["budget", month],
    queryFn: () => fetchBudgetSummary(month),
  });

  const pendingQuery = useQuery({
    queryKey: ["recurring", "pending"],
    queryFn: fetchPending,
  });
  const pendingDepositsQuery = useQuery({
    queryKey: ["recurring", "pending-deposits"],
    queryFn: fetchPendingDeposits,
  });
  const pendingCount = (pendingQuery.data?.length ?? 0) + (pendingDepositsQuery.data?.length ?? 0);

  return (
    <div className="flex flex-col">
      {/* phone: the logo on top, always the current month */}
      <div className="px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-1 lg:hidden">
        <Logo />
      </div>

      <div className="hidden lg:block">
        <PageHeader title="Główna">
          <Link to="/deposits/new" className={`${secondaryButtonClass} flex items-center`}>
            + Wpłata
          </Link>
        </PageHeader>
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      <div className="px-4 flex flex-col gap-4 mt-4 lg:mt-4 lg:gap-6">
        {notice && (
          <p role="status" className="rounded-2xl border border-brand/60 bg-brand/10 px-4 py-3 text-brand">
            Dodano: {notice.title} · {formatMoney(notice.price)}
          </p>
        )}
        {isPending && <p className="text-neutral-400">Wczytywanie...</p>}
        <ErrorText>{error}</ErrorText>

        {data && (
          <>
            <BalancePlate data={data} />

            {pendingCount > 0 && (
              <Link
                to="/recurring"
                className="block rounded-2xl border border-brand/60 bg-brand/10 p-4"
              >
                Cykliczne do potwierdzenia: <strong className="text-brand">{pendingCount}</strong>
              </Link>
            )}

            <QuickAdd />

            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
              <Card>
                <h2 className="font-display text-xl font-bold mb-1">Rozliczenie miesiąca</h2>
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
                <hr className="border-neutral-800 my-1" />
                <Row
                  muted
                  label="Wydatki z kart prywatnych (poza budżetem)"
                  value={formatMoney(data.privateSpent)}
                />
              </Card>

              <Card>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h2 className="font-display text-xl font-bold">Wpłaty domowników</h2>
                  <Link to="/deposits" className="text-sm text-brand">
                    Wszystkie wpłaty
                  </Link>
                </div>
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
            </div>

            {/* phone: the way to the deposits and consumption screens (the desktop has the side menu) */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <Link to="/deposits" className={`${secondaryButtonClass} flex items-center justify-center gap-3`}>
                <FontAwesomeIcon icon={faPiggyBank} />
                Wpłaty
              </Link>
              <Link to="/usage" className={`${secondaryButtonClass} flex items-center justify-center gap-3`}>
                <FontAwesomeIcon icon={faGaugeHigh} />
                Zużycie
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Budget;
