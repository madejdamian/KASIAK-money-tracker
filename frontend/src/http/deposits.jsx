import { api } from "./api";

// Deposits are called "incomes" in the backend API.
export const fetchDeposits = ({ year, month }) =>
  api(`/incomes/?year=${year}&month=${month}`);

export const fetchDeposit = (slug) => api(`/incomes/${slug}`);

export const createDeposit = (values) =>
  api("/incomes/", { method: "POST", body: values });

export const updateDeposit = ({ slug, values }) =>
  api(`/incomes/${slug}`, { method: "PUT", body: values });

export const deleteDeposit = (slug) =>
  api(`/incomes/${slug}`, { method: "DELETE" });

// every deposit ever made (the API returns all of them when no month is given)
export const fetchAllDeposits = () => api("/incomes/");
