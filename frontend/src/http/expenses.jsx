import { api } from "./api";

// year and month are optional: without them all expenses are returned
export const fetchExpenses = ({ year, month } = {}) => {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  const query = params.toString();
  return api(`/expenses/${query ? `?${query}` : ""}`);
};

export const fetchExpense = (slug) => api(`/expenses/${slug}`);

export const createExpense = (values) =>
  api("/expenses/", { method: "POST", body: values });

export const updateExpense = ({ slug, values }) =>
  api(`/expenses/${slug}`, { method: "PUT", body: values });

export const deleteExpense = (slug) =>
  api(`/expenses/${slug}`, { method: "DELETE" });
