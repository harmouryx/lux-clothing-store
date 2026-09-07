import axios from "axios";

/**
 * The proxy base URL points to the Next.js API proxy route.
 * All browser requests go to localhost:3000/api/proxy/* (same origin).
 * The Next.js server then forwards them server-to-server to Laravel (no CORS).
 */
const PROXY_BASE = "/api/proxy";

/**
 * Axios instance configured to use the Next.js proxy.
 * withCredentials ensures cookies are sent to the proxy endpoint.
 */
export const apiClient = axios.create({
  baseURL: typeof window !== "undefined" ? PROXY_BASE : (process.env.NEXT_PUBLIC_URL || "http://localhost:8000"),
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Fetches the Laravel Sanctum CSRF cookie via the proxy.
 * Must be called before any mutating request (POST, PUT, DELETE).
 */
export async function fetchCsrfToken(): Promise<void> {
  try {
    await apiClient.get("/sanctum/csrf-cookie");
  } catch (error) {
    console.error("Failed to initialize CSRF token:", error);
  }
}

/**
 * Request interceptor:
 * Reads X-XSRF-TOKEN from cookies and attaches it on mutating requests.
 * Injects Bearer token from localStorage on every request using AxiosHeaders.set().
 */
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match && match[1]) {
      config.headers.set("X-XSRF-TOKEN", decodeURIComponent(match[1]));
    }

    const token = localStorage.getItem("lux_auth_token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return config;
});
