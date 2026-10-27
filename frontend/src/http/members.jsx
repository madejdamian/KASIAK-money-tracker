import { api } from "./api";

export const fetchMembers = () => api("/members/");

export const createMember = (values) =>
  api("/members/", { method: "POST", body: values });

export const updateMember = ({ id, values }) =>
  api(`/members/${id}`, { method: "PUT", body: values });

export const deleteMember = (id) => api(`/members/${id}`, { method: "DELETE" });
