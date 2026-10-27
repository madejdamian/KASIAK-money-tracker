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
  formatDay,
  fromApiDateTime,
  recallChoice,
  rememberChoice,
  toInputDateTime,
} from "../../util/format";

const cardOptions = [
  { value: "SHARED_CARD", label: "Wspólna" },
  { value: "PRIVATE_CARD", label: "Prywatna" },
];

// `source` is the expense being edited, or one being copied (then the date starts as now)
function initialForm(source, categories, members, keepDate) {
  if (source) {
    const expense = source;
    return {
      price: String(expense.price),
      date: keepDate ? fromApiDateTime(expense.date) : toInputDateTime(),
      categoryId: expense.categoryId == null ? "" : String(expense.categoryId),
      memberId: expense.memberId == null ? "" : String(expense.memberId),
      paymentSource: expense.paymentSource ?? "SHARED_CARD",
      usageAmount: expense.usageAmount == null ? "" : String(expense.usageAmount),
      description: expense.description ?? "",
      tags: expense.tags ?? [],
    };
  }

  // a new expense starts with the choices used last time, to add it with few taps
  const lastCategory = recallChoice("categoryId");
  const lastMember = recallChoice("memberId");
  return {
    price: "",
    date: toInputDateTime(),
    categoryId: categories.some((c) => String(c.id) === lastCategory) ? lastCategory : "",
    memberId: members.some((m) => String(m.id) === lastMember)
      ? lastMember
      : String(members[0]?.id ?? ""),
    paymentSource: recallChoice("paymentSource") || "SHARED_CARD",
    usageAmount: "",
    description: "",
    tags: [],
  };
}

const tileClass = (selected) =>
  `min-h-14 px-5 py-2 rounded-2xl text-base font-bold transition-colors ${
    selected
      ? "bg-brand text-on-brand"
      : "bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
  }`;

const FieldLabel = ({ children }) => (
  <p className="text-sm font-medium text-neutral-400 mb-2">{children}</p>
);

// Category tiles, level by level: the main categories first; once a category with
// subcategories is chosen, its subcategories show up below, and so on down the tree.
const CategoryTiles = ({ categories, selectedId, onSelect }) => {
  const byId = useMemo(() => new Map(categories.map((c) => [String(c.id), c])), [categories]);

  // ids from the main category down to the chosen one
  const chain = [];
  for (let current = byId.get(selectedId); current; current = byId.get(String(current.parentId))) {
    chain.unshift(String(current.id));
  }

  const childrenOf = (parentId) =>
    categories.filter((c) => (c.parentId == null ? null : String(c.parentId)) === parentId);

  const levels = [{ parent: null, tiles: childrenOf(null) }];
  for (const id of chain) {
    const tiles = childrenOf(id);
    if (tiles.length > 0) levels.push({ parent: byId.get(id), tiles });
  }

  return (
    <div className="flex flex-col gap-4" role="group" aria-label="Kategoria">
      {levels.map((level, depth) => (
        <div key={level.parent?.id ?? "main"}>
          {level.parent && (
            <p className="text-sm text-neutral-400 mb-2">{level.parent.name}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {level.tiles.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={chain[depth] === String(category.id)}
                onClick={() => onSelect(String(category.id))}
                className={tileClass(chain[depth] === String(category.id))}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ExpenseEditor = ({ expense, prefill, categories, members, knownTags }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !expense;
  const [form, setForm] = useState(() =>
    initialForm(expense ?? prefill, categories, members, !!expense)
  );
  const [templateSaved, setTemplateSaved] = useState(false);
  const [categoryMissing, setCategoryMissing] = useState(false);
  // a new expense is dated now, so the date stays out of the way until it is needed
  const [editDate, setEditDate] = useState(!isNew);

  const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);
  // an expense keeps the title it has; a new one (or one moved to another category) is named after its category
  const title =
    expense && String(expense.categoryId) === form.categoryId
      ? expense.title
      : selectedCategory?.name ?? "Wydatek";

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  }

  function refreshData() {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expense"] });
    queryClient.invalidateQueries({ queryKey: ["budget"] });
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  }

  function finish() {
    refreshData();
    navigate(`/expenses?month=${form.date.slice(0, 7)}`);
  }

  const save = useMutation({
    mutationFn: (values) =>
      isNew ? createExpense(values) : updateExpense({ slug: expense.slug, values }),
    onSuccess: () => {
      rememberChoice("categoryId", form.categoryId);
      rememberChoice("memberId", form.memberId);
      rememberChoice("paymentSource", form.paymentSource);
      if (isNew) {
        // back to the home screen, which shows what was added and the new balance
        refreshData();
        navigate("/", { state: { added: { title, price: Number(form.price) } } });
      } else {
        finish();
      }
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteExpense(expense.slug),
    onSuccess: finish,
  });

  const saveTemplate = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => setTemplateSaved(true),
  });

  function handleSaveTemplate() {
    setTemplateSaved(false);
    saveTemplate.mutate({
      name: selectedCategory?.name ?? "Szablon",
      title: null,
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
    if (!form.categoryId) {
      setCategoryMissing(true);
      return;
    }
    save.mutate({
      title,
      price: Number(form.price),
      date: form.date.length === 16 ? `${form.date}:00` : form.date,
      categoryId: Number(form.categoryId),
      memberId: Number(form.memberId),
      paymentSource: form.paymentSource,
      usageAmount: form.usageAmount === "" ? null : Number(form.usageAmount),
      description: form.description.trim() || null,
      tags: form.tags,
    });
  }

  function handleDelete() {
    if (window.confirm("Usunąć ten wydatek?")) {
      remove.mutate();
    }
  }

  const busy = save.isPending || remove.isPending;
  const today = toInputDateTime().slice(0, 10);
  const dateText = form.date.slice(0, 10) === today ? "dziś" : formatDay(form.date);
  // tags to pick from: all that exist, plus any the edited expense already has
  const tagChoices = [...new Set([...knownTags, ...form.tags])].sort();

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-6 lg:max-w-3xl">
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-neutral-400 mb-1">
          Kwota
        </label>
        <div className="flex items-baseline gap-3 border-b-2 border-neutral-700 pb-1 focus-within:border-brand">
          <input
            id="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            autoFocus={isNew}
            placeholder="0,00"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full min-w-0 bg-transparent text-5xl font-light tabular-nums outline-none placeholder-neutral-600"
          />
          <span className="text-2xl text-neutral-400">zł</span>
        </div>
      </div>

      <div>
        <FieldLabel>Kategoria</FieldLabel>
        <CategoryTiles
          categories={categories}
          selectedId={form.categoryId}
          onSelect={(id) => {
            update("categoryId", id);
            setCategoryMissing(false);
          }}
        />
        {categoryMissing && <p role="alert" className="text-sm text-danger mt-3">Wybierz kategorię.</p>}
      </div>

      <Field label="Opis (opcjonalnie)" htmlFor="description">
        <textarea
          id="description"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <FieldLabel>Kto zapłacił</FieldLabel>
          <Segmented
            name="member"
            value={form.memberId}
            onChange={(value) => update("memberId", value)}
            options={members.map((member) => ({ value: String(member.id), label: member.name }))}
          />
        </div>
        <div>
          <FieldLabel>Karta</FieldLabel>
          <Segmented
            name="paymentSource"
            value={form.paymentSource}
            onChange={(value) => update("paymentSource", value)}
            options={cardOptions}
          />
        </div>
      </div>

      {editDate ? (
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
      ) : (
        <p className="text-neutral-300">
          Data:{" "}
          <strong className="text-neutral-50">
            {dateText}, {form.date.slice(11, 16)}
          </strong>{" "}
          <button type="button" className="text-brand underline" onClick={() => setEditDate(true)}>
            zmień
          </button>
        </p>
      )}

      <div>
        <FieldLabel>Tagi (opcjonalnie)</FieldLabel>
        {tagChoices.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nie ma jeszcze tagów. Dodasz je w{" "}
            <Link to="/settings" className="text-brand underline">
              ustawieniach
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Tagi">
            {tagChoices.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={form.tags.includes(tag)}
                onClick={() => toggleTag(tag)}
                className={`h-11 px-4 rounded-full text-sm font-bold transition-colors ${
                  form.tags.includes(tag)
                    ? "bg-brand text-on-brand"
                    : "bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <ErrorText>{save.error ?? remove.error ?? saveTemplate.error}</ErrorText>
      {templateSaved && (
        <p className="text-sm text-brand">
          Zapisano szablon. Znajdziesz go w{" "}
          <Link to="/templates" className="underline">
            szablonach
          </Link>
          .
        </p>
      )}

      {/* stays above the bottom bar and its raised middle button so saving is always one tap away */}
      <div className="sticky bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 -mx-4 px-4 py-3 bg-ink border-t border-neutral-800 lg:static lg:mx-0 lg:px-0 lg:border-0">
        <button type="submit" disabled={busy} className={`${primaryButtonClass} w-full h-14 text-lg`}>
          {save.isPending ? "Zapisywanie..." : isNew ? "Dodaj wydatek" : "Zapisz"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={busy || saveTemplate.isPending || !form.categoryId || !form.memberId}
          onClick={handleSaveTemplate}
          className={secondaryButtonClass}
        >
          Zapisz jako szablon
        </button>
        {!isNew && (
          <>
            <Link
              to={`/expenses/new?copy=${expense.slug}`}
              className={`${secondaryButtonClass} flex items-center justify-center`}
            >
              Kopiuj jako nowy
            </Link>
            <Link to="/expenses" className={`${secondaryButtonClass} flex items-center justify-center`}>
              Anuluj
            </Link>
            <button type="button" disabled={busy} onClick={handleDelete} className={dangerButtonClass}>
              Usuń wydatek
            </button>
          </>
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
    tagsQuery.data &&
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
          <Link to="/settings" className="text-brand underline">
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
          knownTags={tagsQuery.data}
        />
      )}
    </>
  );
};

export default ExpenseForm;
