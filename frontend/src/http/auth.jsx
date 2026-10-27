import { API_URL, ApiError, errorText } from "./base";

async function readToken(response) {
  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // the response had no JSON body
    }
    throw new ApiError(errorText(body));
  }

  const result = await response.json();
  if (!result.token) {
    throw new ApiError("Brak tokenu w odpowiedzi serwera.");
  }
  localStorage.setItem("token", result.token);
}

export async function login(values) {
  const response = await fetch(`${API_URL}/auth/authenticate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  await readToken(response);
}

export async function refreshToken() {
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });
  await readToken(response);
}

export function logout() {
  localStorage.removeItem("token");
}
