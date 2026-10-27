import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { fetchCategoryTree } from "../../http/categories";
import { fetchMembers } from "../../http/members";
import { fetchTags } from "../../http/tags";
import { createTemplate } from "../../http/templates";
import {
  createExpense,
  deleteExpense,
  fetchExpense,
  updateExpense,
} from "../../http/expenses";
import {
  flattenCategories,
  fromApiDateTime,
  recallChoice,
  rememberChoice,
  toInputDateTime,
} from "../../util/format";

const cardOptions = [
  { value: "SHARED_CARD", label: "Karta wspólna" },
  { value: "PRIVATE_CARD", label: "Karta prywatna" },
];

// `source` is the expense being edited, or one being copied (then the date starts as now)
function initialForm(source, categories, members, keepDate) {
  if (source) {
    const expense = source;
    return {
      title: expense.title,
      price: String(expense.price),
      date: keepDate ? fromApiDateTime(expense.date) : toInputDateTime(),
      categoryId: expense.categoryId == null ? "" : String(expense.categoryId),
      memberId: expense.memberId == null ? "" : String(expense.memberId),
      paymentSource: expense.paymentSource ?? "SHARED_CARD",
      usageAmount: expense.usageAmount == null ? "" : String(expense.usageAmount),
      description: expense.description ?? "",
      tags: (expense.tags ?? []).join(", "),
    };
  }

  // a new expense starts with the choices used last time, to add it with few taps
  const lastCategory = recallChoice("categoryId");
  const lastMember = recallChoice("memberId");
  return {
    title: "",
    price: "",
    date: toInputDateTime(),
    categoryId: categories.some((c) => String(c.id) === lastCategory) ? lastCategory : "",
    memberId: members.some((m) => String(m.id) === lastMember)
      ? lastMember
      : String(members[0]?.id ?? ""),
    paymentSource: recallChoice("paymentSource") || "SHARED_CARD",
    usageAmount: "",
    description: "",
    tags: "",
  };
}

const ExpenseEditor = ({ expense, prefill, categories, members, knownTags }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !expense;
  const [form, setForm] = useState(() =>
    initialForm(expense ?? prefill, categories, members, !!expense)
  );
  const [templateSaved, setTemplateSaved] = useState(false);

  const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function finish() {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expense"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
    queryClient.invalidateQueries({ queryKey: ["tags"] });
    navigate(`/expenses?month=${form.date.slice(0, 7)}`);
  }

  const save = useMutation({
    mutationFn: (values) =>
      isNew ? createExpense(values) : updateExpense({ slug: expense.slug, values }),
    onSuccess: () => {
      rememberChoice("categoryId", form.categoryId);
      rememberChoice("memberId", form.memberId);
      rememberChoice("paymentSource", form.paymentSource);
      finish();
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteExpense(expense.slug),
    onSuccess: finish,
  });

  const tagNames = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const saveTemplate = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => setTemplateSaved(true),
  });

  function handleSaveTemplate() {
    setTemplateSaved(false);
    saveTemplate.mutate({
      name: form.title.trim() || selectedCategory?.name || "Szablon",
      title: form.title.trim() || null,
      price: form.price === "" ? null : Number(form.price),
      categoryId: Number(form.categoryId),
      memberId: Number(form.memberId),
      paymentSource: form.paymentSource,
      usageAmount: form.usageAmount === "" ? null : Number(form.usageAmount),
      description: form.description.trim() || null,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({
      title: form.title.trim() || selectedCategory?.name || "Wydatek",
      price: Number(form.price),
      date: form.date.length === 16 ? `${form.date}:00` : form.date,
      categoryId: Number(form.categoryId),
      memberId: Number(form.memberId),
      paymentSource: form.paymentSource,
      usageAmount: form.usageAmount === "" ? null : Number(form.usageAmount),
      description: form.description.trim() || null,
      tags: tagNames,
    });
  }

  function handleDelete() {
    if (window.confirm("Usunąć ten wydatek?")) {
      remove.mutate();
    }
  }

  const busy = save.isPending || remove.isPending;

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-5">
      <Field label="Kwota (zł)" htmlFor="price">
        <input
          id="price"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          autoFocus={isNew}
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          className={`${inputClass} text-2xl h-14`}
        />
      </Field>

      <Field label="Kategoria" htmlFor="category">
        <select
          id="category"
          required
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Wybierz kategorię
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </Field>

      {selectedCategory?.unit && (
        <Field label={`Zużycie (${selectedCategory.unit})`} htmlFor="usage">
          <input
            id="usage"
            type="number"
            inputMode="decimal"
            step="0.001"
            min="0"
            value={form.usageAmount}
            onChange={(e) => update("usageAmount", e.target.value)}
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Kto zapłacił" htmlFor="member">
        <select
          id="member"
          required
          value={form.memberId}
          onChange={(e) => update("memberId", e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Wybierz domownika
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </Field>

      <Segmented
        name="paymentSource"
        value={form.paymentSource}
        onChange={(value) => update("paymentSource", value)}
        options={cardOptions}
      />

      <Field label="Data i godzina" htmlFor="date">
        <input
          id="date"
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Tytuł (opcjonalnie, domyślnie nazwa kategorii)" htmlFor="title">
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Opis (opcjonalnie)" htmlFor="description">
        <textarea
          id="description"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
      </Field>

      <Field label="Tagi (po przecinku, np. wakacje, remont)" htmlFor="tags">
        <input
          id="tags"
          type="text"
          list="known-tags"
          autoCapitalize="none"
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          className={inputClass}
        />
        <datalist id="known-tags">
          {knownTags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </Field>

      <ErrorText>{save.error ?? remove.error ?? saveTemplate.error}</ErrorText>
      {templateSaved && (
        <p className="text-sm text-emerald-400">
          Zapisano szablon. Znajdziesz go w{" "}
          <Link to="/templates" className="underline">
            szablonach
          </Link>
          .
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {save.isPending ? "Zapisywanie..." : "Zapisz"}
        </button>
        <button
          type="button"
          disabled={busy || saveTemplate.isPending || !form.categoryId || !form.memberId}
          onClick={handleSaveTemplate}
          className={secondaryButtonClass}
        >
          Zapisz jako szablon
        </button>
        {!isNew && (
          <Link
            to={`/expenses/new?copy=${expense.slug}`}
            className={`${secondaryButtonClass} flex items-center justify-center`}
          >
            Kopiuj jako nowy
          </Link>
        )}
        <Link to="/expenses" className={`${secondaryButtonClass} flex items-center justify-center`}>
          Anuluj
        </Link>
        {!isNew && (
          <button type="button" disabled={busy} onClick={handleDelete} className={dangerButtonClass}>
            Usuń wydatek
          </button>
        )}
      </div>
    </form>
  );
};

const ExpenseForm = () => {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const isNew = slug === "new";
  const copySlug = isNew ? params.get("copy") : null;

  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const copyQuery = useQuery({
    queryKey: ["expense", copySlug],
    queryFn: () => fetchExpense(copySlug),
    enabled: !!copySlug,
  });

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategoryTree });
  const membersQuery = useQuery({ queryKey: ["members"], queryFn: fetchMembers });
  const expenseQuery = useQuery({
    queryKey: ["expense", slug],
    queryFn: () => fetchExpense(slug),
    enabled: !isNew,
  });

  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data]
  );
  const members = membersQuery.data ?? [];

  const error =
    categoriesQuery.error ?? membersQuery.error ?? expenseQuery.error ?? copyQuery.error;
  const ready =
    categoriesQuery.data &&
    membersQuery.data &&
    (isNew || expenseQuery.data) &&
    (!copySlug || copyQuery.data);
  const needsSetup = ready && (categories.length === 0 || members.length === 0);

  return (
    <>
      <PageHeader title={isNew ? "Nowy wydatek" : "Edycja wydatku"} />
      <ErrorText>{error}</ErrorText>
      {!ready && !error && <p className="px-4 text-neutral-400">Wczytywanie...</p>}

      {needsSetup && (
        <p className="px-4 text-neutral-300">
          Najpierw dodaj domowników i kategorie w{" "}
          <Link to="/settings" className="text-secondColor underline">
            ustawieniach
          </Link>
          .
        </p>
      )}

      {ready && !needsSetup && (
        <ExpenseEditor
          key={`${slug}-${copySlug}`}
          expense={isNew ? null : expenseQuery.data}
          prefill={copySlug ? copyQuery.data : null}
          categories={categories}
          members={members}
          knownTags={tagsQuery.data ?? []}
        />
      )}
    </>
  );
};

export default ExpenseForm;
