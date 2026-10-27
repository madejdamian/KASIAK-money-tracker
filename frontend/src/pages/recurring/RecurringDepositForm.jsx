import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ErrorText,
  Field,
  PageHeader,
  Segmented,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import { fetchMembers } from "../../http/members";
import {
  createRecurringDeposit,
  deleteRecurringDeposit,
  fetchRecurringDeposits,
  updateRecurringDeposit,
} from "../../http/recurringDeposits";
import { currentMonth, monthKey } from "../../util/format";

const typeOptions = [
  { value: "MONTHLY", label: "Miesięczna" },
  { value: "EXTRA", label: "Dodatkowa" },
];

const RecurringDepositEditor = ({ rule, members }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !rule;
  const [form, setForm] = useState(() => ({
    title: rule?.title ?? "",
    amount: rule?.amount == null ? "" : String(rule.amount),
    memberId: rule?.memberId == null ? String(members[0]?.id ?? "") : String(rule.memberId),
    depositType: rule?.depositType ?? "MONTHLY",
    description: rule?.description ?? "",
    dayOfMonth: String(rule?.dayOfMonth ?? 1),
    startMonth: rule?.startMonth ?? monthKey(currentMonth()),
    active: rule?.active ?? true,
  }));

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function finish() {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    navigate("/recurring");
  }

  const save = useMutation({
    mutationFn: (values) =>
      isNew ? createRecurringDeposit(values) : updateRecurringDeposit({ id: rule.id, values }),
    onSuccess: finish,
  });

  const remove = useMutation({
    mutationFn: () => deleteRecurringDeposit(rule.id),
    onSuccess: finish,
  });

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({
      title: form.title.trim(),
      amount: Number(form.amount),
      memberId: Number(form.memberId),
      depositType: form.depositType,
      description: form.description.trim() || null,
      dayOfMonth: Number(form.dayOfMonth),
      startMonth: form.startMonth,
      active: form.active,
    });
  }

  function handleDelete() {
    if (window.confirm("Usunąć tę regułę? Dodane już wpłaty zostaną.")) {
      remove.mutate();
    }
  }

  const busy = save.isPending || remove.isPending;

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-5 lg:max-w-3xl">
      <Field label="Nazwa (np. Wpłata miesięczna)" htmlFor="deposit-title">
        <input
          id="deposit-title"
          type="text"
          required
          autoFocus={isNew}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Kwota (zł)" htmlFor="deposit-amount">
        <input
          id="deposit-amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div>
        <p className="text-sm font-medium text-neutral-400 mb-2">Kto wpłaca</p>
        <Segmented
          name="memberId"
          value={form.memberId}
          onChange={(value) => update("memberId", value)}
          options={members.map((member) => ({ value: String(member.id), label: member.name }))}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-400 mb-2">Rodzaj wpłaty</p>
        <Segmented
          name="depositType"
          value={form.depositType}
          onChange={(value) => update("depositType", value)}
          options={typeOptions}
        />
      </div>

      <Field label="Opis (opcjonalnie)" htmlFor="deposit-description">
        <textarea
          id="deposit-description"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
      </Field>

      <Field label="Dzień miesiąca" htmlFor="deposit-day">
        <input
          id="deposit-day"
          type="number"
          inputMode="numeric"
          min="1"
          max="31"
          required
          value={form.dayOfMonth}
          onChange={(e) => update("dayOfMonth", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Od miesiąca" htmlFor="deposit-start">
        <input
          id="deposit-start"
          type="month"
          required
          value={form.startMonth}
          onChange={(e) => update("startMonth", e.target.value)}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-3 text-base">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => update("active", e.target.checked)}
          className="w-6 h-6"
        />
        Aktywna (proponuj co miesiąc)
      </label>

      <ErrorText>{save.error ?? remove.error}</ErrorText>

      <div className="flex flex-col gap-3">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {save.isPending ? "Zapisywanie..." : "Zapisz"}
        </button>
        <Link to="/recurring" className={`${secondaryButtonClass} flex items-center justify-center`}>
          Anuluj
        </Link>
        {!isNew && (
          <button type="button" disabled={busy} onClick={handleDelete} className={dangerButtonClass}>
            Usuń regułę
          </button>
        )}
      </div>
    </form>
  );
};

const RecurringDepositForm = () => {
  const { id } = useParams();
  const isNew = id === "new";

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });
  const rulesQuery = useQuery({
    queryKey: ["recurring", "deposit-rules"],
    queryFn: fetchRecurringDeposits,
    enabled: !isNew,
  });

  const members = membersQuery.data ?? [];
  const rule = isNew ? null : rulesQuery.data?.find((r) => String(r.id) === id);
  const loaded = membersQuery.isSuccess && (isNew || rulesQuery.isSuccess);
  const missing = !isNew && rulesQuery.isSuccess && !rule;
  const needsSetup = membersQuery.isSuccess && members.length === 0;

  return (
    <>
      <PageHeader title={isNew ? "Nowa wpłata cykliczna" : "Edycja wpłaty cyklicznej"} />
      <ErrorText>{membersQuery.error ?? rulesQuery.error}</ErrorText>
      {!loaded && !membersQuery.error && <p className="px-4 text-neutral-400">Wczytywanie...</p>}
      {missing && <p className="px-4 text-neutral-300">Nie znaleziono reguły.</p>}

      {needsSetup && (
        <p className="px-4 text-neutral-300">
          Najpierw dodaj domowników w{" "}
          <Link to="/settings" className="text-brand underline">
            ustawieniach
          </Link>
          .
        </p>
      )}

      {loaded && !missing && !needsSetup && (
        <RecurringDepositEditor key={id} rule={rule} members={members} />
      )}
    </>
  );
};

export default RecurringDepositForm;
