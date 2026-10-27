import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ErrorText,
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui/ui";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../http/categories";
import { descendantIds } from "../../util/format";

const emptyForm = { id: null, name: "", unit: "", parentId: "" };

// `categories` is the flat list in tree order (see flattenCategories)
const CategoriesSection = ({ categories }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const editing = form.id != null;
  // a category cannot be moved under itself or its own subcategory
  const blocked = editing ? descendantIds(categories, form.id) : new Set();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setForm(emptyForm);
  };

  const save = useMutation({
    mutationFn: (values) =>
      editing ? updateCategory({ id: form.id, values }) : createCategory(values),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess,
  });

  function handleSubmit(event) {
    event.preventDefault();
    save.mutate({
      name: form.name,
      unit: form.unit.trim() || null,
      parentId: form.parentId === "" ? null : Number(form.parentId),
    });
  }

  function handleDelete(category) {
    if (window.confirm(`Usunąć kategorię ${category.label}?`)) {
      remove.mutate(category.id);
    }
  }

  return (
    <>
      <ul className="flex flex-col">
        {categories.length === 0 && (
          <li className="text-neutral-500 py-2">Brak kategorii. Dodaj pierwszą poniżej.</li>
        )}
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-2 py-2 border-b border-neutral-800 last:border-b-0"
            style={{ paddingLeft: `${category.depth * 16}px` }}
          >
            <span className="min-w-0 break-words">
              {category.name}
              {category.unit && (
                <span className="text-neutral-500 text-sm"> ({category.unit})</span>
              )}
            </span>
            <span className="flex gap-2 shrink-0">
              <button
                type="button"
                aria-label={`Dodaj podkategorię w ${category.name}`}
                className="h-10 w-10 rounded-lg bg-neutral-800"
                onClick={() => setForm({ ...emptyForm, parentId: String(category.id) })}
              >
                +
              </button>
              <button
                type="button"
                className="h-10 px-3 rounded-lg bg-neutral-800 text-sm"
                onClick={() =>
                  setForm({
                    id: category.id,
                    name: category.name,
                    unit: category.unit ?? "",
                    parentId: category.parentId == null ? "" : String(category.parentId),
                  })
                }
              >
                Zmień
              </button>
              <button
                type="button"
                className="h-10 px-3 rounded-lg bg-danger/15 text-sm font-semibold text-danger"
                onClick={() => handleDelete(category)}
              >
                Usuń
              </button>
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <h3 className="font-semibold">
          {editing ? "Zmiana kategorii" : "Nowa kategoria"}
        </h3>

        <Field label="Nazwa" htmlFor="category-name">
          <input
            id="category-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Leży w kategorii" htmlFor="category-parent">
          <select
            id="category-parent"
            value={form.parentId}
            onChange={(e) => update("parentId", e.target.value)}
            className={inputClass}
          >
            <option value="">(główna kategoria)</option>
            {categories
              .filter((category) => !blocked.has(category.id))
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
          </select>
        </Field>

        <Field label="Jednostka zużycia (np. kWh, opcjonalnie)" htmlFor="category-unit">
          <input
            id="category-unit"
            type="text"
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
            className={inputClass}
          />
        </Field>

        <ErrorText>{save.error ?? remove.error}</ErrorText>

        <div className="flex gap-3">
          <button type="submit" disabled={save.isPending} className={`${primaryButtonClass} flex-1`}>
            {editing ? "Zapisz zmianę" : "Dodaj kategorię"}
          </button>
          {(editing || form.name || form.parentId) && (
            <button type="button" onClick={() => setForm(emptyForm)} className={secondaryButtonClass}>
              Anuluj
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default CategoriesSection;
