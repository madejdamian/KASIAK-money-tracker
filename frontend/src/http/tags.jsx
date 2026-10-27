import { api } from "./api";

export const fetchTags = () => api("/tags/");

export const createTag = (name) => api("/tags/", { method: "POST", body: { name } });

// only a tag that no expense uses can be deleted
export const deleteTag = (name) =>
  api(`/tags/${encodeURIComponent(name)}`, { method: "DELETE" });
