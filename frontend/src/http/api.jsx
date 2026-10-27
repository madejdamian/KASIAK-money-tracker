import { refreshToken } from "./auth";
import { API_URL, ApiError, errorText } from "./base";

function send(path, { method = "GET", body } = {}) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function isUnauthorized(response) {
  return response.status === 401 || response.status === 403;
}

function endSession() {
  localStorage.removeItem("token");
  window.location.assign("/login");
}

// Calls the backend with the saved token. When the token has expired it is refreshed once
// (the refresh cookie lives long, so the login is remembered) and the call is repeated.
export async function api(path, options = {}) {
  let response = await send(path, options);

  if (isUnauthorized(response)) {
    try {
      await refreshToken();
    } catch {
      endSession();
      throw new ApiError("Sesja wygasła. Zaloguj się ponownie.");
    }
    response = await send(path, options);
    if (isUnauthorized(response)) {
      endSession();
      throw new ApiError("Sesja wygasła. Zaloguj się ponownie.");
    }
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // the response had no JSON body
    }
    throw new ApiError(errorText(body));
  }

  if (response.status === 204) return null;
  return response.json();
}
