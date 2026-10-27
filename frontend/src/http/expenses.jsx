import { api } from "./api";

// month is optional: without it the whole year is returned
export const fetchExpenses = ({ year, month }) =>
  api(`/expenses/?year=${year}${month ? `&month=${month}` : ""}`);

export const fetchExpense = (slug) => api(`/expenses/${slug}`);

export const createExpense = (values) =>
  api("/expenses/", { method: "POST", body: values });

export const updateExpense = ({ slug, values }) =>
  api(`/expenses/${slug}`, { method: "PUT", body: values });

export const deleteExpense = (slug) =>
  api(`/expenses/${slug}`, { method: "DELETE" });
