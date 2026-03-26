export type Direction = "income" | "expense";
export type Category = "essential" | "non_essential" | "emergency";
export type IntentLabel = "planned" | "impulse";
export type AssessmentTone = "poor" | "average" | "good" | "excellent";

export interface Transaction {
  id: string;
  userId: string;
  transactionRef: string;
  txnDate: string;
  description: string;
  amount: number;
  direction: Direction;
  source: string;
}

export interface Classification {
  transactionRef: string;
  txnDate: string;
  description: string;
  amount: number;
  category: Category;
  intentLabel: IntentLabel;
  essentiality: number;
}

export interface Account {
  accountId: string;
  fullName: string;
  email: string;
  password: string;
  linkedUserId: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Session {
  accountId: string;
  fullName: string;
  email: string;
  linkedUserId: string;
  signedInAt: string;
  gmailAuthenticated?: boolean;
}

export interface TransactionFilters {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface LoadTransactionsResult {
  userId: string;
  transactionCount: number;
  transactions: Transaction[];
}

export interface SeedDemoResult {
  userId: string;
  transactionCount: number;
  monthsCovered: string[];
}

export interface ClassificationResult {
  userId: string;
  scannedExpenses: number;
  classifications: Classification[];
  source: string;
}

export interface Assessment {
  label: string;
  tone: AssessmentTone;
  description: string;
}

export interface Recommendation {
  headline: string;
  recommendation: string;
  actionItems: string[];
}

export interface DimensionBreakdownItem {
  id: "cashFlowHealth" | "spendingDiscipline" | "investmentDiscipline" | "financialResilience";
  label: string;
  score: number;
  weight: number;
}

export interface TrustDimensions {
  cashFlowHealth: number;
  spendingDiscipline: number;
  investmentDiscipline: number;
  financialResilience: number;
}

export interface Explainability {
  summary: string;
  observations: string[];
  formulas: Record<string, string>;
}

export interface TrustScoreResult {
  userId: string;
  txCount: number;
  expenseCount: number;
  monthsCovered: string[];
  trustIndex: number;
  assessment: Assessment;
  dimensions: TrustDimensions;
  dimensionBreakdown: DimensionBreakdownItem[];
  recommendation: Recommendation;
  explainability: Explainability;
}

export interface AuthMessage {
  type: "success" | "error" | "";
  text: string;
}
