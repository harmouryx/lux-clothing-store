import { apiClient, fetchCsrfToken } from "@/lib/api";
import { User } from "@/lib/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  last_name?: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

/**
 * Dispatches login via the Next.js proxy (→ Laravel /login).
 * Stores Bearer token returned by FortifyServiceProvider.
 */
export async function login(credentials: LoginCredentials) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lux_auth_token");
    delete apiClient.defaults.headers.common["Authorization"];
  }

  await fetchCsrfToken();
  const response = await apiClient.post("/login", credentials);

  if (response.data?.token && typeof window !== "undefined") {
    localStorage.setItem("lux_auth_token", response.data.token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  }

  return response.data;
}

/**
 * Dispatches registration via the Next.js proxy (→ Laravel /register).
 * Stores Bearer token upon successful registration.
 */
export async function register(credentials: RegisterCredentials) {
  await fetchCsrfToken();
  const response = await apiClient.post("/register", credentials);

  if (response.data?.token && typeof window !== "undefined") {
    localStorage.setItem("lux_auth_token", response.data.token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  }

  return response.data;
}

/**
 * Dispatches logout and clears stored authentication state.
 */
export async function logout() {
  try {
    await fetchCsrfToken();
    await apiClient.post("/logout");
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lux_auth_token");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }
}

/**
 * Retrieves the current authenticated user with Spatie roles.
 * Uses the Bearer token if available.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<User>("/api/user");
    return response.data;
  } catch {
    return null;
  }
}

export async function confirmPassword(password: string) {
  await fetchCsrfToken();
  return apiClient.post("/user/confirm-password", { password });
}

export async function enableTwoFactor() {
  await fetchCsrfToken();
  return apiClient.post("/user/two-factor-authentication");
}

export async function disableTwoFactor() {
  await fetchCsrfToken();
  return apiClient.delete("/user/two-factor-authentication");
}

export async function getTwoFactorQrCode(): Promise<{ svg: string }> {
  const response = await apiClient.get<{ svg: string }>("/user/two-factor-qr-code");
  return response.data;
}

export async function getTwoFactorSecretKey(): Promise<{ secretKey: string }> {
  const response = await apiClient.get<{ secretKey: string }>("/user/two-factor-secret-key");
  return response.data;
}

export async function getTwoFactorRecoveryCodes(): Promise<string[]> {
  const response = await apiClient.get<string[]>("/user/two-factor-recovery-codes");
  return response.data;
}

export async function confirmTwoFactor(code: string) {
  await fetchCsrfToken();
  return apiClient.post("/user/confirmed-two-factor-authentication", { code });
}

export async function updateProfileInformation(data: { name: string; last_name?: string; email: string }) {
  await fetchCsrfToken();
  return apiClient.put("/user/profile-information", data);
}
