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
  createAccountFromRegistration,
  DEFAULT_ACCOUNTS,
  getMonthsCovered,
} from "@/lib/demo-data";
import { API_BASE_URL, fetchAnalysis, fetchTransactions } from "@/lib/backend-client";
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
const ACCOUNTS_STORAGE_KEY = "trust-index-react-accounts";
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
  login: (payload: LoginPayload) => Session;
  register: (payload: RegisterPayload) => Session;
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

function readSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw =
      window.sessionStorage.getItem(SESSION_STORAGE_KEY) ||
      window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function persistSession(session: Session, remember: boolean) {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  if (remember) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

function clearSessionStorage() {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
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
  const [accounts, setAccounts] = useState<Account[]>(() =>
    readLocalStorage(ACCOUNTS_STORAGE_KEY, DEFAULT_ACCOUNTS)
  );
  const [transactionMap, setTransactionMap] = useState<Record<string, Transaction[]>>(() =>
    readLocalStorage(TRANSACTIONS_STORAGE_KEY, buildInitialTransactionMap())
  );
  const [session, setSession] = useState<Session | null>(() => readSessionStorage());
  const [sessionReady] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactionMap));
  }, [transactionMap]);

  const profile = useMemo(
    () => accounts.find((account) => account.accountId === session?.accountId) || null,
    [accounts, session]
  );

  function login({ email, password, remember }: LoginPayload) {
    const normalizedEmail = normalizeEmail(email);
    const account = accounts.find(
      (entry) => entry.email === normalizedEmail && entry.password === password
    );

    if (!account) {
      throw new Error("Invalid email or password.");
    }

    const nextSession: Session = {
      accountId: account.accountId,
      fullName: account.fullName,
      email: account.email,
      linkedUserId: account.linkedUserId,
      signedInAt: new Date().toISOString(),
      gmailAuthenticated: false,
    };

    persistSession(nextSession, remember);
    setSession(nextSession);
    setAccounts((currentAccounts) =>
      currentAccounts.map((entry) =>
        entry.accountId === account.accountId
          ? { ...entry, lastLoginAt: nextSession.signedInAt }
          : entry
      )
    );

    return nextSession;
  }

  function register({ fullName, email, password }: RegisterPayload) {
    const normalizedEmail = normalizeEmail(email);
    if (accounts.some((entry) => entry.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const draft = createAccountFromRegistration({ fullName, email: normalizedEmail });
    const account: Account = { ...draft, password };
    const nextSession: Session = {
      accountId: account.accountId,
      fullName: account.fullName,
      email: account.email,
      linkedUserId: account.linkedUserId,
      signedInAt: new Date().toISOString(),
      gmailAuthenticated: false,
    };

    setAccounts((currentAccounts) => [
      ...currentAccounts,
      { ...account, lastLoginAt: nextSession.signedInAt },
    ]);
    setTransactionMap((currentMap) => ({
      ...currentMap,
      [account.linkedUserId]:
        currentMap[account.linkedUserId] || buildDemoTransactions(account.linkedUserId),
    }));
    persistSession(nextSession, true);
    setSession(nextSession);

    return nextSession;
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
    setSession(null);
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
    [accounts, profile, session, sessionReady, transactionMap]
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
