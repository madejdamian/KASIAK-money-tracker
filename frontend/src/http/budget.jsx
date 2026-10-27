import { api } from "./api";

export function fetchBudgetSummary({ year, month }) {
  return api(`/budget/summary?year=${year}&month=${month}`);
}
