import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  buildDemoTransactions,
  buildInitialTransactionMap,
  getMonthsCovered,
} from "@/lib/demo-data";
import {
  API_BASE_URL,
  fetchAccountProfile,
  fetchAnalysis,
  fetchTransactions,
  loginAccount as loginAccountRequest,
  registerAccount as registerAccountRequest,
} from "@/lib/backend-client";
import { classifyTransactions } from "@/lib/analysis-engine";
import type {
  Account,
  AuthMessage,
  ClassificationResult,
  LoadTransactionsResult,
  SeedDemoResult,
  Session,
  Transaction,
  TransactionFilters,
  TrustScoreResult,
} from "@/types/app";

const SESSION_STORAGE_KEY = "trust-index-react-session";
const PROFILE_STORAGE_KEY = "trust-index-react-profile";
const TRANSACTIONS_STORAGE_KEY = "trust-index-react-transactions";

interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

interface AppContextValue {
  session: Session | null;
  sessionReady: boolean;
  profile: Account | null;
  login: (payload: LoginPayload) => Promise<Session>;
  register: (payload: RegisterPayload) => Promise<Session>;
  logout: () => void;
  seedDemoData: (userId: string) => SeedDemoResult;
  loadTransactions: (filters: TransactionFilters) => LoadTransactionsResult;
  refreshTransactions: (filters: TransactionFilters) => Promise<LoadTransactionsResult>;
  classifyUser: (filters: TransactionFilters) => ClassificationResult;
  scoreUser: (filters: TransactionFilters) => Promise<TrustScoreResult>;
  gmailAuthenticated: boolean;
  authenticateGmail: () => Promise<AuthMessage>;
}

const AppContext = createContext<AppContextValue | null>(null);

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readPersistedValue<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function persistValue(key: string, value: unknown, remember: boolean) {
  window.sessionStorage.setItem(key, JSON.stringify(value));
  if (remember) {
    window.localStorage.setItem(key, JSON.stringify(value));
  } else {
    window.localStorage.removeItem(key);
  }
}

function clearPersistedValue(key: string) {
  window.sessionStorage.removeItem(key);
  window.localStorage.removeItem(key);
}

function readSessionStorage() {
  return readPersistedValue<Session>(SESSION_STORAGE_KEY);
}

function readProfileStorage() {
  return readPersistedValue<Account>(PROFILE_STORAGE_KEY);
}

function persistSession(session: Session, remember: boolean) {
  persistValue(SESSION_STORAGE_KEY, session, remember);
}

function persistProfile(profile: Account, remember: boolean) {
  persistValue(PROFILE_STORAGE_KEY, profile, remember);
}

function clearSessionStorage() {
  clearPersistedValue(SESSION_STORAGE_KEY);
}

function clearProfileStorage() {
  clearPersistedValue(PROFILE_STORAGE_KEY);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isRememberedSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY) !== null;
}

function filterTransactions(transactions: Transaction[], startDate: string, endDate: string) {
  return transactions.filter((transaction) => {
    if (startDate && transaction.txnDate < startDate) {
      return false;
    }
    if (endDate && transaction.txnDate > endDate) {
      return false;
    }
    return true;
  });
}

export function AppProvider({ children }: PropsWithChildren) {
  const [transactionMap, setTransactionMap] = useState<Record<string, Transaction[]>>(() =>
    readLocalStorage(TRANSACTIONS_STORAGE_KEY, buildInitialTransactionMap())
  );
  const [session, setSession] = useState<Session | null>(() => readSessionStorage());
  const [profile, setProfile] = useState<Account | null>(() => readProfileStorage());
  const [sessionReady] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactionMap));
  }, [transactionMap]);

  useEffect(() => {
    if (!session?.accountId) {
      return;
    }

    let active = true;

    async function hydrateProfile() {
      try {
        const account = await fetchAccountProfile(session.accountId);
        if (!active) {
          return;
        }

        persistProfile(account, isRememberedSession());
        setProfile(account);
      } catch {
        if (!active) {
          return;
        }

        clearSessionStorage();
        clearProfileStorage();
        setSession(null);
        setProfile(null);
      }
    }

    hydrateProfile();

    return () => {
      active = false;
    };
  }, [session?.accountId]);

  async function login({ email, password, remember }: LoginPayload) {
    const result = await loginAccountRequest({
      email: normalizeEmail(email),
      password,
    });

    persistSession(result.session, remember);
    persistProfile(result.account, remember);
    setSession(result.session);
    setProfile(result.account);

    return result.session;
  }

  async function register({ fullName, email, password }: RegisterPayload) {
    const result = await registerAccountRequest({
      fullName: fullName.trim(),
      email: normalizeEmail(email),
      password,
    });

    setTransactionMap((currentMap) => ({
      ...currentMap,
      [result.account.linkedUserId]:
        currentMap[result.account.linkedUserId] || buildDemoTransactions(result.account.linkedUserId),
    }));
    persistSession(result.session, true);
    persistProfile(result.account, true);
    setSession(result.session);
    setProfile(result.account);

    return result.session;
  }

  async function authenticateGmail() {
    if (!session) {
      throw new Error("Sign in before connecting Gmail.");
    }

    const response = await fetch(`${API_BASE_URL}/gmail/authenticate`, {
      method: "POST",
    });

    let payload: { detail?: string; message?: string } | null = null;
    try {
      payload = (await response.json()) as { detail?: string; message?: string };
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.detail || "Gmail authentication failed.");
    }

    const nextSession: Session = { ...session, gmailAuthenticated: true };
    persistSession(nextSession, isRememberedSession());
    setSession(nextSession);

    return {
      type: "success",
      text: payload?.message || "Gmail authenticated successfully.",
    };
  }

  function logout() {
    clearSessionStorage();
    clearProfileStorage();
    setSession(null);
    setProfile(null);
  }

  function seedDemoData(userId: string): SeedDemoResult {
    const targetUserId = userId.trim();
    if (!targetUserId) {
      throw new Error("User ID is required.");
    }

    let seededRows: Transaction[] = [];
    setTransactionMap((currentMap) => {
      seededRows = currentMap[targetUserId] || buildDemoTransactions(targetUserId);
      return {
        ...currentMap,
        [targetUserId]: seededRows,
      };
    });

    return {
      userId: targetUserId,
      transactionCount: seededRows.length,
      monthsCovered: getMonthsCovered(seededRows),
    };
  }

  function loadTransactions({ userId, startDate, endDate }: TransactionFilters): LoadTransactionsResult {
    const targetUserId = userId.trim();
    const rows = filterTransactions(transactionMap[targetUserId] || [], startDate, endDate);

    return {
      userId: targetUserId,
      transactionCount: rows.length,
      transactions: rows,
    };
  }

  async function refreshTransactions({ userId, startDate, endDate }: TransactionFilters) {
    const targetUserId = userId.trim();

    if (!targetUserId) {
      throw new Error("User ID is required.");
    }

    const fullResult = await fetchTransactions({
      userId: targetUserId,
      startDate: "",
      endDate: "",
    });

    setTransactionMap((currentMap) => ({
      ...currentMap,
      [targetUserId]: fullResult.transactions,
    }));

    const rows = filterTransactions(fullResult.transactions, startDate, endDate);

    return {
      userId: targetUserId,
      transactionCount: rows.length,
      transactions: rows,
    };
  }

  function classifyUser({ userId, startDate, endDate }: TransactionFilters): ClassificationResult {
    const rows = loadTransactions({ userId, startDate, endDate }).transactions;
    const classifications = classifyTransactions(rows);

    return {
      userId: userId.trim(),
      scannedExpenses: classifications.length,
      classifications,
      source: "react-mock",
    };
  }

  async function scoreUser({ userId }: TransactionFilters) {
    const targetUserId = userId.trim();

    if (!targetUserId) {
      throw new Error("User ID is required.");
    }

    return fetchAnalysis(targetUserId);
  }

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      sessionReady,
      profile,
      gmailAuthenticated: session?.gmailAuthenticated ?? false,
      login,
      register,
      logout,
      authenticateGmail,
      seedDemoData,
      loadTransactions,
      refreshTransactions,
      classifyUser,
      scoreUser,
    }),
    [profile, session, sessionReady, transactionMap]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider.");
  }
  return context;
}

