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
import { formatMoney, monthLabel, parseMonth } from "../../util/format";

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
  const month = parseMonth(item.month);

  return (
    <li className="bg-thirdColor rounded-2xl p-4 flex flex-col gap-3">
      <div>
        <p className="font-semibold break-words">{item.title}</p>
        <p className="text-sm text-neutral-400 capitalize">
          {month ? monthLabel(month) : item.month}
        </p>
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

const Recurring = () => {
  const pendingQuery = useQuery({ queryKey: ["recurring", "pending"], queryFn: fetchPending });
  const rulesQuery = useQuery({ queryKey: ["recurring", "rules"], queryFn: fetchRecurring });

  const pending = pendingQuery.data ?? [];
  const rules = rulesQuery.data ?? [];

  return (
    <>
      <PageHeader title="Cykliczne">
        <Link to="/recurring/new" className={`${primaryButtonClass} flex items-center`}>
          + Dodaj
        </Link>
      </PageHeader>

      <div className="px-4 mt-2 flex flex-col gap-4">
        <ErrorText>{pendingQuery.error ?? rulesQuery.error}</ErrorText>

        <section>
          <h2 className="font-semibold mb-2">Do potwierdzenia</h2>
          {pendingQuery.isPending && <p className="text-neutral-400">Wczytywanie...</p>}
          {pendingQuery.data && pending.length === 0 && (
            <p className="text-neutral-500">Wszystko potwierdzone.</p>
          )}
          <ul className="flex flex-col gap-3">
            {pending.map((item) => (
              <PendingItem key={`${item.recurringId}-${item.month}`} item={item} />
            ))}
          </ul>
        </section>

        <Card>
          <h2 className="font-semibold mb-2">Reguły</h2>
          {rulesQuery.data && rules.length === 0 && (
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
      </div>
    </>
  );
};

export default Recurring;
