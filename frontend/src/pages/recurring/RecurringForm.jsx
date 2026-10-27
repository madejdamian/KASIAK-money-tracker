import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ErrorText,
  Field,
  PageHeader,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import PresetFields, {
  presetInitialValues,
  presetPayload,
} from "../../components/ui/PresetFields";
import {
  createRecurring,
  deleteRecurring,
  fetchRecurring,
  updateRecurring,
} from "../../http/recurring";
import { currentMonth, monthKey } from "../../util/format";
import { useReferenceData } from "../../util/useReferenceData";

const RecurringEditor = ({ rule, categoryTree, members }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !rule;
  const [form, setForm] = useState(() => ({
    ...presetInitialValues(rule ? { ...rule, name: rule.title } : null, members),
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
      isNew ? createRecurring(values) : updateRecurring({ id: rule.id, values }),
    onSuccess: finish,
  });

  const remove = useMutation({
    mutationFn: () => deleteRecurring(rule.id),
    onSuccess: finish,
  });

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({
      ...presetPayload(form),
      title: form.name.trim(),
      dayOfMonth: Number(form.dayOfMonth),
      startMonth: form.startMonth,
      active: form.active,
    });
  }

  function handleDelete() {
    if (window.confirm("Usunąć tę regułę? Dodane już wydatki zostaną.")) {
      remove.mutate();
    }
  }

  const busy = save.isPending || remove.isPending;

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-5">
      <Field label="Nazwa (np. Czynsz, Netflix)" htmlFor="recurring-name">
        <input
          id="recurring-name"
          type="text"
          required
          autoFocus={isNew}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
        />
      </Field>

      <PresetFields
        form={form}
        update={update}
        categoryTree={categoryTree}
        members={members}
        priceRequired
      />

      <Field label="Dzień miesiąca" htmlFor="recurring-day">
        <input
          id="recurring-day"
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

      <Field label="Od miesiąca" htmlFor="recurring-start">
        <input
          id="recurring-start"
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
          className="w-6 h-6 accent-[#008F5C]"
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

const RecurringForm = () => {
  const { id } = useParams();
  const isNew = id === "new";
  const { categoryTree, members, ready, error } = useReferenceData();

  const rulesQuery = useQuery({
    queryKey: ["recurring", "rules"],
    queryFn: fetchRecurring,
    enabled: !isNew,
  });

  const rule = isNew ? null : rulesQuery.data?.find((r) => String(r.id) === id);
  const loaded = ready && (isNew || rulesQuery.isSuccess);
  const missing = !isNew && rulesQuery.isSuccess && !rule;
  const needsSetup = ready && (categoryTree.length === 0 || members.length === 0);

  return (
    <>
      <PageHeader title={isNew ? "Nowa reguła" : "Edycja reguły"} />
      <ErrorText>{error ?? rulesQuery.error}</ErrorText>
      {!loaded && !error && <p className="px-4 text-neutral-400">Wczytywanie...</p>}
      {missing && <p className="px-4 text-neutral-300">Nie znaleziono reguły.</p>}

      {needsSetup && (
        <p className="px-4 text-neutral-300">
          Najpierw dodaj domowników i kategorie w{" "}
          <Link to="/settings" className="text-secondColor underline">
            ustawieniach
          </Link>
          .
        </p>
      )}

      {loaded && !missing && !needsSetup && (
        <RecurringEditor
          key={id}
          rule={rule}
          categoryTree={categoryTree}
          members={members}
        />
      )}
    </>
  );
};

export default RecurringForm;
