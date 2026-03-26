import type { LoadTransactionsResult, TransactionFilters, TrustScoreResult } from "@/types/app";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

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

  let payload: { detail?: string } | LoadTransactionsResult | null = null;
  try {
    payload = (await response.json()) as { detail?: string } | LoadTransactionsResult;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload && "detail" in payload && payload.detail
        ? payload.detail
        : "Unable to load transactions."
    );
  }

  return payload as LoadTransactionsResult;
}

export async function fetchAnalysis(userId: string): Promise<TrustScoreResult> {
  const params = new URLSearchParams();

  if (userId.trim()) {
    params.set("userId", userId.trim());
  }

  const response = await fetch(`${API_BASE_URL}/analysis?${params.toString()}`);

  let payload: { detail?: string } | TrustScoreResult | null = null;
  try {
    payload = (await response.json()) as { detail?: string } | TrustScoreResult;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload && "detail" in payload && payload.detail
        ? payload.detail
        : "Unable to load analysis."
    );
  }

  return payload as TrustScoreResult;
}
