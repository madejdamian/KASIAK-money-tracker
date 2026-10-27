import { chainOf } from "./analysis.js";

export const emptyFilters = {
  text: "",
  categoryId: "",
  memberId: "",
  source: "",
  min: "",
  max: "",
};

export function hasActiveFilters(filters) {
  return Object.keys(emptyFilters).some((key) => filters[key] !== "");
}

// Filters the expenses of a month by text, category (with everything below it), member,
// card and amount range. `index` comes from buildCategoryIndex.
export function applyExpenseFilters(expenses, index, filters) {
  const text = filters.text.trim().toLowerCase();
  const min = filters.min === "" ? null : Number(filters.min);
  const max = filters.max === "" ? null : Number(filters.max);
  const categoryId = filters.categoryId === "" ? null : Number(filters.categoryId);

  return expenses.filter((expense) => {
    if (text) {
      const haystack = [
        expense.title,
        expense.description,
        expense.memberName,
        ...(expense.categoryPath ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    if (categoryId != null && !chainOf(index, expense.categoryId).includes(categoryId)) {
      return false;
    }
    if (filters.memberId !== "" && String(expense.memberId) !== filters.memberId) {
      return false;
    }
    if (filters.source !== "" && expense.paymentSource !== filters.source) {
      return false;
    }
    const price = Number(expense.price);
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    return true;
  });
}
