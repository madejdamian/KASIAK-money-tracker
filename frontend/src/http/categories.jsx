import { api } from "./api";

export const fetchCategoryTree = () => api("/categories/");

export const createCategory = (values) =>
  api("/categories/", { method: "POST", body: values });

export const updateCategory = ({ id, values }) =>
  api(`/categories/${id}`, { method: "PUT", body: values });

export const deleteCategory = (id) =>
  api(`/categories/${id}`, { method: "DELETE" });
