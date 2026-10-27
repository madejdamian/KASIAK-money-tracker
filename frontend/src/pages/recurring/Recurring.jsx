import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  ErrorText,
  PageHeader,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import {
  confirmRecurring,
  fetchPending,
  fetchRecurring,
  skipRecurring,
} from "../../http/recurring";
import {
  confirmRecurringDeposit,
  fetchPendingDeposits,
  fetchRecurringDeposits,
  skipRecurringDeposit,
} from "../../http/recurringDeposits";
import { formatMoney, monthLabel, parseMonth } from "../../util/format";

const monthText = (key) => {
  const month = parseMonth(key);
  return month ? monthLabel(month) : key;
};

const PendingItem = ({ item }) => {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState(String(item.price));
  const [usage, setUsage] = useState(item.usageAmount == null ? "" : String(item.usageAmount));

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
  }

  const confirm = useMutation({
    mutationFn: confirmRecurring,
    onSuccess: refresh,
  });

  const skip = useMutation({
    mutationFn: skipRecurring,
    onSuccess: refresh,
  });

  function handleConfirm() {
    const changes = { price: Number(price) };
    if (usage !== "") changes.usageAmount = Number(usage);
    confirm.mutate({ id: item.recurringId, month: item.month, changes });
  }

  const busy = confirm.isPending || skip.isPending;

  return (
    <li className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div>
        <p className="font-semibold break-words">{item.title}</p>
        <p className="text-sm text-neutral-400 first-letter:uppercase">{monthText(item.month)}</p>
        <p className="text-sm text-neutral-500 normal-case">
          {item.categoryPath.join(" › ")} · {item.memberName}
        </p>
      </div>

      <div className="flex gap-3">
        <label className="flex-1 text-sm text-neutral-400">
          Kwota (zł)
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        {item.unit && (
          <label className="flex-1 text-sm text-neutral-400">
            Zużycie ({item.unit})
            <input
              type="number"
              inputMode="decimal"
              step="0.001"
              min="0"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className={`${inputClass} mt-1`}
            />
          </label>
        )}
      </div>

      <ErrorText>{confirm.error ?? skip.error}</ErrorText>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy || price === "" || Number(price) <= 0}
          onClick={handleConfirm}
          className={primaryButtonClass}
        >
          Potwierdź
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => skip.mutate({ id: item.recurringId, month: item.month })}
          className={secondaryButtonClass}
        >
          Pomiń
        </button>
      </div>
    </li>
  );
};

// A recurring deposit waiting for a month: confirming adds a deposit (optionally with another amount).
const PendingDepositItem = ({ item }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(String(item.amount));

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    queryClient.invalidateQueries({ queryKey: ["deposits"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
  }

  const confirm = useMutation({ mutationFn: confirmRecurringDeposit, onSuccess: refresh });
  const skip = useMutation({ mutationFn: skipRecurringDeposit, onSuccess: refresh });

  const busy = confirm.isPending || skip.isPending;

  return (
    <li className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div>
        <p className="font-semibold break-words">
          {item.title}{" "}
          <span className="ml-1 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand">
            wpłata
          </span>
        </p>
        <p className="text-sm text-neutral-400 first-letter:uppercase">{monthText(item.month)}</p>
        <p className="text-sm text-neutral-500">{item.memberName}</p>
      </div>

      <label className="text-sm text-neutral-400">
        Kwota (zł)
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </label>

      <ErrorText>{confirm.error ?? skip.error}</ErrorText>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy || amount === "" || Number(amount) <= 0}
          onClick={() =>
            confirm.mutate({
              id: item.recurringId,
              month: item.month,
              changes: { amount: Number(amount) },
            })
          }
          className={primaryButtonClass}
        >
          Potwierdź
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => skip.mutate({ id: item.recurringId, month: item.month })}
          className={secondaryButtonClass}
        >
          Pomiń
        </button>
      </div>
    </li>
  );
};

const Recurring = () => {
  const pendingQuery = useQuery({ queryKey: ["recurring", "pending"], queryFn: fetchPending });
  const rulesQuery = useQuery({ queryKey: ["recurring", "rules"], queryFn: fetchRecurring });
  const pendingDepositsQuery = useQuery({
    queryKey: ["recurring", "pending-deposits"],
    queryFn: fetchPendingDeposits,
  });
  const depositRulesQuery = useQuery({
    queryKey: ["recurring", "deposit-rules"],
    queryFn: fetchRecurringDeposits,
  });

  const pending = [
    ...(pendingQuery.data ?? []).map((item) => ({ kind: "expense", item })),
    ...(pendingDepositsQuery.data ?? []).map((item) => ({ kind: "deposit", item })),
  ].sort(
    (a, b) =>
      a.item.month.localeCompare(b.item.month) || a.item.title.localeCompare(b.item.title, "pl")
  );
  const rules = rulesQuery.data ?? [];
  const depositRules = depositRulesQuery.data ?? [];

  const loadingPending = pendingQuery.isPending || pendingDepositsQuery.isPending;
  const loadedPending = pendingQuery.data && pendingDepositsQuery.data;
  const loadedRules = rulesQuery.data && depositRulesQuery.data;

  return (
    <>
      <PageHeader title="Cykliczne" />

      <div className="px-4 mt-2 flex flex-col gap-4 lg:max-w-4xl">
        <div className="grid grid-cols-2 gap-3 lg:max-w-md">
          <Link to="/recurring/new" className={`${secondaryButtonClass} flex items-center justify-center`}>
            + Wydatek
          </Link>
          <Link
            to="/recurring/deposit/new"
            className={`${secondaryButtonClass} flex items-center justify-center`}
          >
            + Wpłata
          </Link>
        </div>

        <ErrorText>
          {pendingQuery.error ??
            rulesQuery.error ??
            pendingDepositsQuery.error ??
            depositRulesQuery.error}
        </ErrorText>

        <section>
          <h2 className="font-display text-xl font-bold mb-2">Do potwierdzenia</h2>
          {loadingPending && <p className="text-neutral-400">Wczytywanie...</p>}
          {loadedPending && pending.length === 0 && (
            <p className="text-neutral-500">Wszystko potwierdzone.</p>
          )}
          <ul className="flex flex-col gap-3">
            {pending.map(({ kind, item }) =>
              kind === "expense" ? (
                <PendingItem key={`e-${item.recurringId}-${item.month}`} item={item} />
              ) : (
                <PendingDepositItem key={`d-${item.recurringId}-${item.month}`} item={item} />
              )
            )}
          </ul>
        </section>

        <Card>
          <h2 className="font-display text-xl font-bold mb-2">Reguły wydatków</h2>
          {loadedRules && rules.length === 0 && (
            <p className="text-neutral-500">
              Brak reguł. Dodaj np. czynsz, kredyt albo abonament.
            </p>
          )}
          <ul className="flex flex-col">
            {rules.map((rule) => (
              <li key={rule.id} className="border-b border-neutral-800 last:border-b-0">
                <Link to={`/recurring/${rule.id}`} className="flex justify-between gap-3 py-3">
                  <span className="min-w-0 break-words">
                    {rule.title}
                    <span className="block text-sm text-neutral-500">
                      {rule.dayOfMonth}. dnia miesiąca
                      {!rule.active && " · wstrzymane"}
                    </span>
                  </span>
                  <span className="tabular-nums whitespace-nowrap">{formatMoney(rule.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-bold mb-2">Reguły wpłat</h2>
          {loadedRules && depositRules.length === 0 && (
            <p className="text-neutral-500">
              Brak reguł. Dodaj np. miesięczną wpłatę każdego domownika.
            </p>
          )}
          <ul className="flex flex-col">
            {depositRules.map((rule) => (
              <li key={rule.id} className="border-b border-neutral-800 last:border-b-0">
                <Link
                  to={`/recurring/deposit/${rule.id}`}
                  className="flex justify-between gap-3 py-3"
                >
                  <span className="min-w-0 break-words">
                    {rule.title}
                    <span className="block text-sm text-neutral-500">
                      {rule.memberName} · {rule.dayOfMonth}. dnia miesiąca
                      {!rule.active && " · wstrzymane"}
                    </span>
                  </span>
                  <span className="tabular-nums whitespace-nowrap text-brand">
                    +{formatMoney(rule.amount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default Recurring;
