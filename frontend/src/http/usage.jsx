import { api } from "./api";

// Consumption entered by hand (cold water, hot water, heating). Electricity comes from expenses.
export const fetchReadings = () => api("/usage/");

// one value per utility and month: saving again replaces it
export const saveReading = (values) => api("/usage/", { method: "PUT", body: values });

export const deleteReading = ({ utility, year, month }) =>
  api(`/usage/${utility}/${year}/${month}`, { method: "DELETE" });
