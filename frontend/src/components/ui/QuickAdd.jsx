import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  ErrorText,
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";
import { deleteExpense } from "../../http/expenses";
import { applyTemplate, fetchTemplates } from "../../http/templates";
import { formatMoney } from "../../util/format";

// The window for a template that has no fixed price: the amount and an optional description.
const AmountDialog = ({ template, busy, error, onSubmit, onClose }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ price: Number(amount), description: description.trim() || undefined });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={template.name}
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col gap-5 lg:rounded-3xl"
      >
        <h2 className="font-display text-xl font-bold">{template.name}</h2>

        <div>
          <label htmlFor="quick-amount" className="block text-sm font-medium text-neutral-400 mb-1">
            Kwota
          </label>
          <div className="flex items-baseline gap-3 border-b-2 border-neutral-700 pb-1 focus-within:border-brand">
            <input
              id="quick-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              autoFocus
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full min-w-0 bg-transparent text-4xl font-light tabular-nums outline-none placeholder-neutral-600"
            />
            <span className="text-xl text-neutral-400">zł</span>
          </div>
        </div>

        <Field label="Opis (opcjonalnie)" htmlFor="quick-description">
          <textarea
            id="quick-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} h-auto py-3`}
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Anuluj
          </button>
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Dodawanie..." : "Dodaj"}
          </button>
        </div>
      </form>
    </div>
  );
};

// One tap adds an expense from a template, dated now; it can be undone right away.
// A template without a fixed price first asks for the amount (and a description).
const QuickAdd = () => {
  const queryClient = useQueryClient();
  const [added, setAdded] = useState(null);
  const [asking, setAsking] = useState(null);

  const templatesQuery = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });
  const templates = templatesQuery.data ?? [];

  function refreshAfterChange() {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
  }

  const quickAdd = useMutation({
    mutationFn: applyTemplate,
    onSuccess: (expense) => {
      setAdded(expense);
      setAsking(null);
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
    quickAdd.reset();
    if (template.price != null) {
      quickAdd.mutate({ id: template.id });
    } else {
      setAsking(template);
    }
  }

  if (templates.length === 0) return null;

  return (
    <Card>
      <h2 className="font-display text-xl font-bold mb-3">Szybkie dodawanie</h2>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            disabled={quickAdd.isPending}
            onClick={() => handleQuickAdd(template)}
            className="h-11 px-4 rounded-full bg-neutral-800 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-700 active:bg-neutral-700 disabled:opacity-60"
          >
            {template.name}
            {template.price != null && ` · ${formatMoney(template.price)}`}
          </button>
        ))}
      </div>
      {added && (
        <p className="text-sm text-brand mt-2">
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
      {!asking && <ErrorText>{quickAdd.error ?? undo.error}</ErrorText>}

      {asking && (
        <AmountDialog
          template={asking}
          busy={quickAdd.isPending}
          error={quickAdd.error}
          onSubmit={(changes) => quickAdd.mutate({ id: asking.id, changes })}
          onClose={() => setAsking(null)}
        />
      )}
    </Card>
  );
};

export default QuickAdd;
