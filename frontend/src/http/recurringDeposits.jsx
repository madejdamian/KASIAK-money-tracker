import { api } from "./api";

// Recurring deposits: a regular transfer of a household member to the shared account.
// They work like recurring expenses: proposed every month, then confirmed or skipped.
export const fetchRecurringDeposits = () => api("/recurring-deposits/");

export const createRecurringDeposit = (values) =>
  api("/recurring-deposits/", { method: "POST", body: values });

export const updateRecurringDeposit = ({ id, values }) =>
  api(`/recurring-deposits/${id}`, { method: "PUT", body: values });

export const deleteRecurringDeposit = (id) =>
  api(`/recurring-deposits/${id}`, { method: "DELETE" });

export const fetchPendingDeposits = () => api("/recurring-deposits/pending");

// changes: optional { amount } when the real amount differs from the planned one
export const confirmRecurringDeposit = ({ id, month, changes }) =>
  api(`/recurring-deposits/${id}/confirm?month=${month}`, {
    method: "POST",
    body: changes ?? {},
  });

export const skipRecurringDeposit = ({ id, month }) =>
  api(`/recurring-deposits/${id}/skip?month=${month}`, { method: "POST" });
