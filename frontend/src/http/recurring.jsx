import { api } from "./api";

export const fetchRecurring = () => api("/recurring/");

export const createRecurring = (values) =>
  api("/recurring/", { method: "POST", body: values });

export const updateRecurring = ({ id, values }) =>
  api(`/recurring/${id}`, { method: "PUT", body: values });

export const deleteRecurring = (id) =>
  api(`/recurring/${id}`, { method: "DELETE" });

export const fetchPending = () => api("/recurring/pending");

// changes: optional { price, usageAmount } when the real amount differs from the planned one
export const confirmRecurring = ({ id, month, changes }) =>
  api(`/recurring/${id}/confirm?month=${month}`, {
    method: "POST",
    body: changes ?? {},
  });

export const skipRecurring = ({ id, month }) =>
  api(`/recurring/${id}/skip?month=${month}`, { method: "POST" });
