import React, { useMemo, useState } from "react";
import { Field, Segmented, inputClass } from "./ui";
import { flattenCategories } from "../../util/format";

const cardOptions = [
  { value: "SHARED_CARD", label: "Karta wspólna" },
  { value: "PRIVATE_CARD", label: "Karta prywatna" },
];

// Initial values of the preset form; `source` is an existing rule/template (or nothing).
export function presetInitialValues(source, members) {
  return {
    name: source?.name ?? "",
    title: source?.title ?? "",
    price: source?.price == null ? "" : String(source.price),
    categoryId: source?.categoryId == null ? "" : String(source.categoryId),
    memberId:
      source?.memberId == null ? String(members[0]?.id ?? "") : String(source.memberId),
    paymentSource: source?.paymentSource ?? "SHARED_CARD",
    usageAmount: source?.usageAmount == null ? "" : String(source.usageAmount),
    description: source?.description ?? "",
  };
}

// The part of the request shared by recurring expenses and templates.
export function presetPayload(form) {
  return {
    price: form.price === "" ? null : Number(form.price),
    categoryId: Number(form.categoryId),
    memberId: Number(form.memberId),
    paymentSource: form.paymentSource,
    usageAmount: form.usageAmount === "" ? null : Number(form.usageAmount),
    description: form.description.trim() || null,
  };
}

// Fields common to recurring expenses and templates (not name/title/schedule).
const PresetFields = ({ form, update, categoryTree, members, priceRequired }) => {
  const categories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const selected = categories.find((c) => String(c.id) === form.categoryId);
  // keeps the hint stable while typing
  const [hint] = useState(priceRequired ? "" : "Zostaw puste, aby podawać kwotę przy każdym użyciu.");

  return (
    <>
      <Field label="Kwota (zł)" htmlFor="preset-price">
        <input
          id="preset-price"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required={priceRequired}
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          className={inputClass}
        />
        {hint && <span className="text-xs text-neutral-500">{hint}</span>}
      </Field>

      <Field label="Kategoria" htmlFor="preset-category">
        <select
          id="preset-category"
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

      {selected?.unit && (
        <Field label={`Zużycie (${selected.unit}, opcjonalnie)`} htmlFor="preset-usage">
          <input
            id="preset-usage"
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

      <Field label="Kto płaci" htmlFor="preset-member">
        <select
          id="preset-member"
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
        name="presetPaymentSource"
        value={form.paymentSource}
        onChange={(value) => update("paymentSource", value)}
        options={cardOptions}
      />

      <Field label="Opis (opcjonalnie)" htmlFor="preset-description">
        <textarea
          id="preset-description"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputClass} h-auto py-3`}
        />
      </Field>
    </>
  );
};

export default PresetFields;
