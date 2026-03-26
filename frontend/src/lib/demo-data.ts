import type { Account, Transaction } from "@/types/app";

const TEMPLATE_FIXTURES: Record<string, [string, string, number, Transaction["direction"]][]> = {
  stable: [
    ["2026-01-03", "Salary Credit", 120000, "income"],
    ["2026-01-05", "Apartment Rent", 34000, "expense"],
    ["2026-01-08", "Groceries - Fresh Basket", 11250, "expense"],
    ["2026-01-10", "Electricity Bill", 4100, "expense"],
    ["2026-01-12", "Car EMI", 7200, "expense"],
    ["2026-01-14", "SIP Investment", 10000, "expense"],
    ["2026-01-20", "Dinner with Friends", 2400, "expense"],
    ["2026-02-03", "Salary Credit", 120000, "income"],
    ["2026-02-05", "Apartment Rent", 34000, "expense"],
    ["2026-02-09", "Groceries - Fresh Basket", 10880, "expense"],
    ["2026-02-11", "Water and Gas Utility", 3650, "expense"],
    ["2026-02-13", "Car EMI", 7200, "expense"],
    ["2026-02-18", "Pharmacy Purchase", 1850, "expense"],
    ["2026-03-03", "Salary Credit", 120000, "income"],
    ["2026-03-05", "Apartment Rent", 34000, "expense"],
    ["2026-03-08", "Groceries - Fresh Basket", 11520, "expense"],
    ["2026-03-10", "Internet and Utilities", 4480, "expense"],
    ["2026-03-12", "Car EMI", 7200, "expense"],
    ["2026-03-22", "Streaming Subscription", 899, "expense"],
  ],
  mixed: [
    ["2026-01-02", "Monthly Salary", 86000, "income"],
    ["2026-01-04", "Home Rent", 28500, "expense"],
    ["2026-01-09", "Credit Card Bill", 12600, "expense"],
    ["2026-01-11", "Food Delivery Weekend", 4200, "expense"],
    ["2026-01-13", "Cab Rides", 3800, "expense"],
    ["2026-01-17", "Bike EMI", 9800, "expense"],
    ["2026-02-02", "Monthly Salary", 86000, "income"],
    ["2026-02-05", "Home Rent", 28500, "expense"],
    ["2026-02-09", "Supermarket", 12420, "expense"],
    ["2026-02-12", "Online Shopping", 8950, "expense"],
    ["2026-02-18", "Bike EMI", 9800, "expense"],
    ["2026-02-22", "Engine Repair Emergency", 14500, "expense"],
    ["2026-03-02", "Monthly Salary", 86000, "income"],
    ["2026-03-05", "Home Rent", 28500, "expense"],
    ["2026-03-08", "Credit Card Bill", 13350, "expense"],
    ["2026-03-10", "Food Delivery Weekend", 5100, "expense"],
    ["2026-03-14", "Bike EMI", 9800, "expense"],
    ["2026-03-25", "Concert Tickets", 6200, "expense"],
  ],
  pressured: [
    ["2026-01-04", "Freelance Payout", 62000, "income"],
    ["2026-01-06", "Flat Rent", 24000, "expense"],
    ["2026-01-10", "Loan EMI", 15000, "expense"],
    ["2026-01-13", "Groceries", 9800, "expense"],
    ["2026-01-18", "Gaming Purchase", 7500, "expense"],
    ["2026-01-26", "Late Fee Card Bill", 4100, "expense"],
    ["2026-02-09", "Freelance Payout", 38000, "income"],
    ["2026-02-11", "Flat Rent", 24000, "expense"],
    ["2026-02-16", "Groceries", 10150, "expense"],
    ["2026-02-20", "Phone Upgrade", 18000, "expense"],
    ["2026-02-24", "Hospital Emergency", 22000, "expense"],
    ["2026-03-03", "Freelance Payout", 71000, "income"],
    ["2026-03-07", "Flat Rent", 24000, "expense"],
    ["2026-03-12", "Utility Bill", 5600, "expense"],
    ["2026-03-14", "Loan EMI", 15000, "expense"],
    ["2026-03-19", "Food Delivery Weekend", 6900, "expense"],
    ["2026-03-27", "Cash Withdrawal Leisure Trip", 12500, "expense"],
  ],
};

export const DEMO_USER_IDS = ["demo_user_001", "demo_user_002", "demo_user_003"] as const;

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    accountId: "acct_demo_001",
    fullName: "Demo Analyst",
    email: "demo@maybach.ai",
    password: "demo12345",
    linkedUserId: "demo_user_001",
    createdAt: "2026-03-01T10:00:00.000Z",
    lastLoginAt: "2026-03-24T09:45:00.000Z",
  },
];

function chooseTemplate(userId: string) {
  if (userId === "demo_user_001") return "stable";
  if (userId === "demo_user_002") return "mixed";
  if (userId === "demo_user_003") return "pressured";

  const hash = Array.from(userId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const templates = Object.keys(TEMPLATE_FIXTURES);
  return templates[hash % templates.length] ?? "stable";
}

export function buildDemoTransactions(userId: string): Transaction[] {
  const template = chooseTemplate(userId);
  return TEMPLATE_FIXTURES[template].map(([txnDate, description, amount, direction], index) => ({
    id: `${userId}_${index + 1}`,
    userId,
    transactionRef: `${userId}_tx_${String(index + 1).padStart(3, "0")}`,
    txnDate,
    description,
    amount,
    direction,
    source: "react_demo",
  }));
}

export function buildInitialTransactionMap(): Record<string, Transaction[]> {
  return DEMO_USER_IDS.reduce<Record<string, Transaction[]>>((accumulator, userId) => {
    accumulator[userId] = buildDemoTransactions(userId);
    return accumulator;
  }, {});
}

export function createAccountFromRegistration({ fullName, email }: Pick<Account, "fullName" | "email">): Account {
  const slug = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
  return {
    accountId: `acct_${slug}_${Date.now()}`,
    fullName,
    email,
    password: "",
    linkedUserId: `user_${slug}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
}

export function getMonthsCovered(transactions: Transaction[]) {
  return [...new Set(transactions.map((transaction) => transaction.txnDate.slice(0, 7)))].sort();
}
