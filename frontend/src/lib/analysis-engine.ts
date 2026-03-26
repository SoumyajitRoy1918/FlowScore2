import { getMonthsCovered } from "@/lib/demo-data";
import type {
  Assessment,
  Category,
  Classification,
  IntentLabel,
  Transaction,
  TrustDimensions,
  TrustScoreResult,
} from "@/types/app";

interface ClassificationRule {
  keywords: string[];
  category: Category;
  intentLabel: IntentLabel;
  essentiality: number;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  { keywords: ["rent", "apartment", "flat"], category: "essential", intentLabel: "planned", essentiality: 10 },
  { keywords: ["emi", "loan", "credit card bill"], category: "essential", intentLabel: "planned", essentiality: 9 },
  { keywords: ["grocery", "supermarket"], category: "essential", intentLabel: "planned", essentiality: 8 },
  { keywords: ["utility", "electricity", "water", "gas", "internet"], category: "essential", intentLabel: "planned", essentiality: 8 },
  { keywords: ["pharmacy", "medicine", "hospital"], category: "emergency", intentLabel: "planned", essentiality: 10 },
  { keywords: ["repair", "emergency"], category: "emergency", intentLabel: "planned", essentiality: 9 },
  { keywords: ["sip", "investment", "insurance"], category: "essential", intentLabel: "planned", essentiality: 7 },
  { keywords: ["streaming", "concert", "gaming", "trip"], category: "non_essential", intentLabel: "impulse", essentiality: 2 },
  { keywords: ["dinner", "food delivery", "restaurant", "weekend"], category: "non_essential", intentLabel: "impulse", essentiality: 3 },
  { keywords: ["shopping", "upgrade"], category: "non_essential", intentLabel: "impulse", essentiality: 2 },
  { keywords: ["cab", "rides"], category: "non_essential", intentLabel: "planned", essentiality: 4 },
];

const DIMENSION_LABELS = {
  cashFlowHealth: "Cash Flow Health",
  spendingDiscipline: "Spending Discipline",
  investmentDiscipline: "Investment Discipline",
  financialResilience: "Financial Resilience",
} as const;

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function sumAmount(rows: Array<{ amount: number }>) {
  return rows.reduce((total, row) => total + Number(row.amount || 0), 0);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function safeDivide(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function getClassificationRule(description: string) {
  const normalized = description.toLowerCase();
  return CLASSIFICATION_RULES.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
}

export function classifyTransactions(transactions: Transaction[]): Classification[] {
  return transactions
    .filter((transaction) => transaction.direction === "expense")
    .map((transaction) => {
      const rule = getClassificationRule(transaction.description) || {
        category: "non_essential" as const,
        intentLabel: transaction.amount > 8000 ? ("planned" as const) : ("impulse" as const),
        essentiality: transaction.amount > 8000 ? 5 : 3,
      };

      return {
        transactionRef: transaction.transactionRef,
        txnDate: transaction.txnDate,
        description: transaction.description,
        amount: transaction.amount,
        category: rule.category,
        intentLabel: rule.intentLabel,
        essentiality: rule.essentiality,
      };
    });
}

export function getAssessment(score: number): Assessment {
  if (score >= 86) {
    return {
      label: "Excellent",
      tone: "excellent",
      description: "Your financial behavior looks highly dependable across the tracked dimensions.",
    };
  }
  if (score >= 73) {
    return {
      label: "Good",
      tone: "good",
      description: "Your trust profile is healthy, with a few areas that could still be sharpened.",
    };
  }
  if (score >= 61) {
    return {
      label: "Average",
      tone: "average",
      description: "The score is workable, but consistency and resilience need more attention.",
    };
  }
  return {
    label: "Poor",
    tone: "poor",
    description: "The current behavior pattern is fragile and should be improved before relying on it.",
  };
}

function buildRecommendation(score: number, dimensions: TrustDimensions) {
  const assessment = getAssessment(score);
  const weakest = Object.entries(dimensions)
    .sort((left, right) => left[1] - right[1])
    .slice(0, 2)
    .map(([key]) => DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS]);

  const actions: string[] = [];
  if (weakest.includes(DIMENSION_LABELS.cashFlowHealth)) {
    actions.push("Increase monthly surplus by keeping fixed expenses comfortably below recurring income.");
  }
  if (weakest.includes(DIMENSION_LABELS.spendingDiscipline)) {
    actions.push("Reduce non-essential spikes and move irregular discretionary spend into a planned budget.");
  }
  if (weakest.includes(DIMENSION_LABELS.investmentDiscipline)) {
    actions.push("Make recurring obligations predictable with auto-pay or a dedicated bill calendar.");
  }
  if (weakest.includes(DIMENSION_LABELS.financialResilience)) {
    actions.push("Build an emergency buffer so one-off shocks do not force reactive spending patterns.");
  }
  if (actions.length === 0) {
    actions.push("Maintain the same discipline and review your spending mix monthly to protect the score.");
  }

  return {
    headline:
      assessment.label === "Excellent"
        ? "Strong trust profile"
        : assessment.label === "Good"
          ? "Healthy trust profile"
          : assessment.label === "Average"
            ? "Improvement opportunity"
            : "Immediate correction needed",
    recommendation: `Based on your current Trust Index and dimension mix, the strongest next step is to improve ${weakest.join(" and ") || "consistency"}.`,
    actionItems: actions,
  };
}

export function calculateTrustIndex(
  userId: string,
  transactions: Transaction[],
  classifications: Classification[]
): TrustScoreResult {
  const monthsCovered = getMonthsCovered(transactions);
  const monthCount = monthsCovered.length || 1;
  const incomes = transactions.filter((transaction) => transaction.direction === "income");
  const expenses = transactions.filter((transaction) => transaction.direction === "expense");
  const totalIncome = sumAmount(incomes);
  const totalExpense = sumAmount(expenses);
  const averageIncome = safeDivide(totalIncome, monthCount);
  const averageExpense = safeDivide(totalExpense, monthCount);
  const savingsRate = clamp(safeDivide(totalIncome - totalExpense, totalIncome) * 100);
  const incomeExpenseRatio = totalExpense ? totalIncome / totalExpense : 2;
  const incomeExpenseScore = clamp(((incomeExpenseRatio - 0.7) / 1.1) * 100);
  const averageEssentiality = average(classifications.map((classification) => classification.essentiality));
  const essentialWeightedSpend = classifications.reduce(
    (total, classification) => total + classification.amount * (classification.essentiality / 10),
    0
  );
  const essentialWeightedRatio = clamp(safeDivide(essentialWeightedSpend, totalExpense) * 100);
  const cashflowStability = clamp((averageEssentiality / 10) * 55 + essentialWeightedRatio * 0.45);
  const cashFlowHealth = round(0.4 * incomeExpenseScore + 0.35 * savingsRate + 0.25 * cashflowStability);

  const plannedSpend = classifications
    .filter((classification) => classification.intentLabel === "planned")
    .reduce((total, classification) => total + classification.amount, 0);
  const impulseSpend = classifications
    .filter((classification) => classification.intentLabel === "impulse")
    .reduce((total, classification) => total + classification.amount, 0);
  const monthlyDiscretionary = monthsCovered.map((month) =>
    classifications
      .filter(
        (classification) => classification.category === "non_essential" && classification.txnDate.startsWith(month)
      )
      .reduce((total, classification) => total + classification.amount, 0)
  );
  const discretionaryBaseline = average(monthlyDiscretionary);
  const spikeCount = monthlyDiscretionary.filter(
    (value) => value > averageIncome * 0.18 || value > discretionaryBaseline * 1.35
  ).length;
  const plannedRatio = clamp(safeDivide(plannedSpend, totalExpense) * 100);
  const impulseRatio = clamp(safeDivide(impulseSpend, totalExpense));
  const spikeFrequency = clamp(safeDivide(spikeCount, monthCount));
  const spendingDiscipline = round(
    clamp(100 * (0.4 * (plannedRatio / 100) + 0.3 * (1 - impulseRatio) + 0.3 * (1 - spikeFrequency)))
  );

  const commitmentKeywords = ["rent", "emi", "credit card bill", "loan", "utility"];
  const commitmentTransactions = expenses.filter((transaction) =>
    commitmentKeywords.some((keyword) => transaction.description.toLowerCase().includes(keyword))
  );
  const commitmentMonths = new Set(commitmentTransactions.map((transaction) => transaction.txnDate.slice(0, 7)));
  const onTimeRatio = clamp(safeDivide(commitmentMonths.size, monthCount), 0, 1);
  const commitmentAmounts = commitmentTransactions.map((transaction) => transaction.amount);
  const commitmentAverage = average(commitmentAmounts);
  const amountVariance = commitmentAverage
    ? average(commitmentAmounts.map((amount) => Math.abs(amount - commitmentAverage) / commitmentAverage))
    : 1;
  const consistencyRatio = clamp(1 - amountVariance, 0, 1);
  const missedRatio = clamp(1 - onTimeRatio, 0, 1);
  const investmentDiscipline = round(clamp(100 * (0.45 * onTimeRatio + 0.35 * consistencyRatio + 0.2 * (1 - missedRatio))));

  const emergencyEvents = classifications.filter((classification) => classification.category === "emergency");
  const emergencyFrequency = safeDivide(emergencyEvents.length, monthCount);
  const monthlyBalances = monthsCovered.map((month) => {
    const monthIncome = incomes
      .filter((transaction) => transaction.txnDate.startsWith(month))
      .reduce((total, transaction) => total + transaction.amount, 0);
    const monthExpense = expenses
      .filter((transaction) => transaction.txnDate.startsWith(month))
      .reduce((total, transaction) => total + transaction.amount, 0);
    return monthIncome - monthExpense;
  });
  const monthlyBalanceAverage = average(monthlyBalances);
  const balanceVariance = monthlyBalanceAverage
    ? average(monthlyBalances.map((balance) => Math.abs(balance - monthlyBalanceAverage) / Math.abs(monthlyBalanceAverage)))
    : 1;
  const emergencyBuffer = clamp(safeDivide(totalIncome - totalExpense, averageExpense * 0.4) * 100);
  const shockFrequency = clamp((1 - emergencyFrequency) * 100);
  const recoveryScore = clamp((1 - emergencyFrequency * 0.45) * 100);
  const volatilityScore = clamp((1 - balanceVariance) * 100);
  const financialResilience = round(
    clamp(0.25 * emergencyBuffer + 0.25 * shockFrequency + 0.3 * recoveryScore + 0.2 * volatilityScore)
  );

  const normalizedScore =
    (0.3 * cashFlowHealth + 0.2 * spendingDiscipline + 0.25 * investmentDiscipline + 0.15 * financialResilience) /
    0.9;
  const trustIndex = round(clamp(normalizedScore));
  const assessment = getAssessment(trustIndex);
  const dimensions = { cashFlowHealth, spendingDiscipline, investmentDiscipline, financialResilience };

  return {
    userId,
    txCount: transactions.length,
    expenseCount: classifications.length,
    monthsCovered,
    trustIndex,
    assessment,
    dimensions,
    dimensionBreakdown: [
      { id: "cashFlowHealth", label: DIMENSION_LABELS.cashFlowHealth, score: cashFlowHealth, weight: 30 },
      { id: "spendingDiscipline", label: DIMENSION_LABELS.spendingDiscipline, score: spendingDiscipline, weight: 20 },
      { id: "investmentDiscipline", label: DIMENSION_LABELS.investmentDiscipline, score: investmentDiscipline, weight: 25 },
      { id: "financialResilience", label: DIMENSION_LABELS.financialResilience, score: financialResilience, weight: 15 },
    ],
    recommendation: buildRecommendation(trustIndex, dimensions),
    explainability: {
      summary: `Trust Index ${trustIndex} is driven by ${assessment.label.toLowerCase()} performance across cash flow, discipline, commitments, and resilience.`,
      observations: [
        `Average monthly income is ${round(averageIncome)} against monthly expenses of ${round(averageExpense)}.`,
        `Average essentiality across expense rows is ${round(averageEssentiality)} / 10.`,
        `Recurring commitment coverage was observed in ${commitmentMonths.size} of ${monthCount} tracked months.`,
        `Emergency events detected: ${emergencyEvents.length}.`,
      ],
      formulas: {
        cashFlowHealth: "0.40*IncomeExpense + 0.35*NetSavings + 0.25*CashflowStability",
        spendingDiscipline: "100*(0.40*PlannedRatio + 0.30*(1-ImpulseRatio) + 0.30*(1-SpikeFrequency))",
        investmentDiscipline: "100*(0.45*OnTime + 0.35*Consistency + 0.20*(1-MissedRatio))",
        financialResilience: "0.25*EmergencyBuffer + 0.25*ShockFrequency + 0.30*Recovery + 0.20*Volatility",
      },
    },
  };
}
