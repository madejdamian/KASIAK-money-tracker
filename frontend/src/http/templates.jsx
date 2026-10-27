import { api } from "./api";

export const fetchTemplates = () => api("/templates/");

export const fetchTemplate = (id) =>
  api("/templates/").then((list) => list.find((t) => String(t.id) === String(id)));

export const createTemplate = (values) =>
  api("/templates/", { method: "POST", body: values });

export const updateTemplate = ({ id, values }) =>
  api(`/templates/${id}`, { method: "PUT", body: values });

export const deleteTemplate = (id) =>
  api(`/templates/${id}`, { method: "DELETE" });

// adds an expense dated now; changes: optional { price, usageAmount }
export const applyTemplate = ({ id, changes }) =>
  api(`/templates/${id}/use`, { method: "POST", body: changes ?? {} });
