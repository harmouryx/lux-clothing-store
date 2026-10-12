import axios from "axios";

export interface ApiErrorResponse {
  message?: unknown;
  errors?: Record<string, unknown>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export function getApiFieldErrorMessage(error: unknown, field: string): string | undefined {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return undefined;
  }

  const fieldError = error.response?.data?.errors?.[field];
  if (typeof fieldError === "string") {
    return fieldError;
  }

  if (Array.isArray(fieldError)) {
    return fieldError.find((message): message is string => typeof message === "string");
  }

  return undefined;
}

export function requiresPasswordConfirmation(error: unknown): boolean {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return false;
  }

  const message = error.response?.data?.message;
  return error.response?.status === 423 ||
    (typeof message === "string" && message.toLowerCase().includes("password"));
}
