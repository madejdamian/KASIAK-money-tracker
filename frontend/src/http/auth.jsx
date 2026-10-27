import { API_URL, ApiError, NetworkError, OFFLINE_MESSAGE, errorText } from "./base";

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

async function post(path, options) {
  try {
    return await fetch(`${API_URL}${path}`, { method: "POST", credentials: "include", ...options });
  } catch {
    throw new NetworkError(OFFLINE_MESSAGE);
  }
}

export async function login(values) {
  const response = await post("/auth/authenticate", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  await readToken(response);
}

export async function refreshToken() {
  const response = await post("/auth/refresh-token");
  await readToken(response);
}

export function logout() {
  localStorage.removeItem("token");
}
