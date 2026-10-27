export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/expense-tracker/api/v1";

export class ApiError extends Error {}

// the server could not be reached (offline); the session is still fine
export class NetworkError extends ApiError {}

export const OFFLINE_MESSAGE =
  "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";

export function errorText(body) {
  if (!body || !body.message) return "Coś poszło nie tak. Spróbuj ponownie.";
  if (typeof body.message === "string") return body.message;
  return Object.values(body.message).join(" ");
}
