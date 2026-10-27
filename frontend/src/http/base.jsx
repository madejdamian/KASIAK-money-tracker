export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/expense-tracker/api/v1";

export class ApiError extends Error {}

export function errorText(body) {
  if (!body || !body.message) return "Coś poszło nie tak. Spróbuj ponownie.";
  if (typeof body.message === "string") return body.message;
  return Object.values(body.message).join(" ");
}
