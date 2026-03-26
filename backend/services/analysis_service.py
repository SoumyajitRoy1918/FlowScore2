from __future__ import annotations

from final_score import (
    getCashFlowStability,
    getEmergencyFundScore,
    getInvestmentDisciplineScore,
    getMainCredit,
    getSpendingHabitScore,
    sort_transaction,
)
from services.transaction_data_service import load_transaction_snapshot


WEIGHTS = {
    "cashFlowHealth": 30,
    "spendingDiscipline": 27,
    "investmentDiscipline": 25,
    "financialResilience": 18,
}

DIMENSION_LABELS = {
    "cashFlowHealth": "Cash Flow Health",
    "spendingDiscipline": "Spending Discipline",
    "investmentDiscipline": "Investment Discipline",
    "financialResilience": "Financial Resilience",
}


def _round(value: float) -> float:
    return round(float(value), 1)


def _get_assessment(trust_index: float) -> dict[str, str]:
    if trust_index >= 780:
        return {
            "label": "Excellent",
            "tone": "excellent",
            "description": "The score indicates strong financial reliability under the current scoring model.",
        }
    if trust_index >= 690:
        return {
            "label": "Good",
            "tone": "good",
            "description": "The profile is healthy overall, with a few dimensions that could still be strengthened.",
        }
    if trust_index >= 600:
        return {
            "label": "Average",
            "tone": "average",
            "description": "The score is workable, but one or more dimensions still need improvement.",
        }
    return {
        "label": "Poor",
        "tone": "poor",
        "description": "The current score shows weak financial stability under the existing scoring formulas.",
    }


def _build_recommendation(dimensions: dict[str, float]) -> dict[str, object]:
    weakest_dimensions = sorted(dimensions.items(), key=lambda item: item[1])[:2]
    weakest_labels = [DIMENSION_LABELS[key] for key, _ in weakest_dimensions]
    action_items = []

    if "cashFlowHealth" in dict(weakest_dimensions):
        action_items.append("Stabilize monthly inflows and keep expenses more predictable against income.")
    if "spendingDiscipline" in dict(weakest_dimensions):
        action_items.append("Reduce discretionary leakage and improve the necessity mix in monthly spending.")
    if "investmentDiscipline" in dict(weakest_dimensions):
        action_items.append("Increase investment consistency so the monthly investment-to-income ratio improves.")
    if "financialResilience" in dict(weakest_dimensions):
        action_items.append("Build a stronger emergency cushion by retaining more monthly surplus.")

    if len(action_items) == 0:
        action_items.append("Maintain the current pattern and review the score inputs monthly.")

    return {
        "headline": "Priority improvement areas",
        "recommendation": f"The current result is most constrained by {', '.join(weakest_labels)}.",
        "actionItems": action_items,
    }


def build_analysis_result(user_id: str = "demo_user_001") -> dict[str, object]:
    sort_transaction()

    transaction_snapshot = load_transaction_snapshot(user_id=user_id)
    transactions = transaction_snapshot["transactions"]
    months_covered = sorted({transaction["txnDate"][:7] for transaction in transactions})
    expense_count = sum(1 for transaction in transactions if transaction["direction"] == "expense")

    dimensions = {
        "cashFlowHealth": _round(getCashFlowStability()),
        "spendingDiscipline": _round(getSpendingHabitScore()),
        "investmentDiscipline": _round(getInvestmentDisciplineScore()),
        "financialResilience": _round(getEmergencyFundScore()),
    }
    trust_index = _round(getMainCredit())
    assessment = _get_assessment(trust_index)

    return {
        "userId": user_id,
        "txCount": transaction_snapshot["transactionCount"],
        "expenseCount": expense_count,
        "monthsCovered": months_covered,
        "trustIndex": trust_index,
        "assessment": assessment,
        "dimensions": dimensions,
        "dimensionBreakdown": [
            {
                "id": "cashFlowHealth",
                "label": DIMENSION_LABELS["cashFlowHealth"],
                "score": dimensions["cashFlowHealth"],
                "weight": WEIGHTS["cashFlowHealth"],
            },
            {
                "id": "spendingDiscipline",
                "label": DIMENSION_LABELS["spendingDiscipline"],
                "score": dimensions["spendingDiscipline"],
                "weight": WEIGHTS["spendingDiscipline"],
            },
            {
                "id": "investmentDiscipline",
                "label": DIMENSION_LABELS["investmentDiscipline"],
                "score": dimensions["investmentDiscipline"],
                "weight": WEIGHTS["investmentDiscipline"],
            },
            {
                "id": "financialResilience",
                "label": DIMENSION_LABELS["financialResilience"],
                "score": dimensions["financialResilience"],
                "weight": WEIGHTS["financialResilience"],
            },
        ],
        "recommendation": _build_recommendation(dimensions),
        "explainability": {
            "summary": "The analysis uses the existing backend scoring functions after re-sorting transactions into the monthly JSON buckets.",
            "observations": [
                "sort_transaction() is executed before every score calculation.",
                f"Transactions considered: {transaction_snapshot['transactionCount']}.",
                f"Months covered: {', '.join(months_covered) if months_covered else 'none'}.",
                f"Expense transactions counted: {expense_count}.",
            ],
            "formulas": {
                "trustIndex": "6 * (0.30*Cash Flow Health + 0.27*Spending Discipline + 0.25*Investment Discipline + 0.18*Financial Resilience) + 300 - ShockPenalty",
                "cashFlowHealth": "getCashFlowStability()",
                "spendingDiscipline": "getSpendingHabitScore()",
                "investmentDiscipline": "getInvestmentDisciplineScore()",
                "financialResilience": "getEmergencyFundScore()",
            },
        },
    }
