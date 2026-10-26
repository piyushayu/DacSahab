export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

function readAccessExpiry(): number | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|; )ds_access_exp=([^;]+)/);
  if (!match) return null;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Rotates the refresh token and writes a new access cookie. Concurrent callers
 * share one request so two tabs cannot race themselves into a logout.
 */
export function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  refreshInFlight ??= fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: "{}",
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

function requestHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers);

  if (
    init.body &&
    typeof init.body === "string" &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

/**
 * Browser-side helper for the Express API. It proactively refreshes when the
 * readable expiry cookie is nearly stale and retries once after a 401.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const expiry = readAccessExpiry();
  if (expiry !== null && expiry - Date.now() < 30_000) {
    await refreshAccessToken();
  }

  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: requestHeaders(init),
    });

  let response = await send();

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) response = await send();
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      code?: string;
    } | null;

    throw new ApiError(response.status, body?.code ?? "API_ERROR");
  }

  return (await response.json()) as T;
}
