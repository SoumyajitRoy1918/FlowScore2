import type { Account, LoadTransactionsResult, Session, TransactionFilters, TrustScoreResult } from "@/types/app";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface ApiErrorPayload {
  detail?: string;
}

interface AuthPayload {
  account: Account;
  session: Session;
}

async function parseJson<T>(response: Response): Promise<T | ApiErrorPayload | null> {
  try {
    return (await response.json()) as T | ApiErrorPayload;
  } catch {
    return null;
  }
}

function buildErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
  return payload?.detail || fallback;
}

export async function loginAccount(payload: { email: string; password: string }): Promise<AuthPayload> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await parseJson<AuthPayload>(response)) as AuthPayload | ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(body as ApiErrorPayload | null, "Unable to sign in."));
  }

  return body as AuthPayload;
}

export async function registerAccount(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await parseJson<AuthPayload>(response)) as AuthPayload | ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(body as ApiErrorPayload | null, "Unable to create account."));
  }

  return body as AuthPayload;
}

export async function fetchAccountProfile(accountId: string): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/auth/accounts/${accountId}`);
  const body = (await parseJson<Account>(response)) as Account | ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(body as ApiErrorPayload | null, "Unable to load account profile."));
  }

  return body as Account;
}

export async function fetchTransactions(filters: TransactionFilters): Promise<LoadTransactionsResult> {
  const params = new URLSearchParams();

  if (filters.userId.trim()) {
    params.set("userId", filters.userId.trim());
  }

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`);

  const payload = (await parseJson<LoadTransactionsResult>(response)) as LoadTransactionsResult | ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(payload as ApiErrorPayload | null, "Unable to load transactions."));
  }

  return payload as LoadTransactionsResult;
}

export async function fetchAnalysis(userId: string): Promise<TrustScoreResult> {
  const params = new URLSearchParams();

  if (userId.trim()) {
    params.set("userId", userId.trim());
  }

  const response = await fetch(`${API_BASE_URL}/analysis?${params.toString()}`);

  const payload = (await parseJson<TrustScoreResult>(response)) as TrustScoreResult | ApiErrorPayload | null;

  if (!response.ok) {
    throw new Error(buildErrorMessage(payload as ApiErrorPayload | null, "Unable to load analysis."));
  }

  return payload as TrustScoreResult;
}

