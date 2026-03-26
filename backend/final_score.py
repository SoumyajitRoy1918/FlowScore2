from dataProcessing import control
from datetime import datetime
import json
import os

KNOWN_DATE_FORMATS = (
    r"%d-%m-%y",
    r"%d-%m-%Y",
    r"%Y-%m-%d",
    r"%d/%m/%Y",
    r"%d/%m/%y",
    r"%d-%b-%Y",
    r"%d-%b-%y",
    r"%d-%B-%Y",
    r"%d-%B-%y",
)


def _parse_transaction_date(raw_date):
    value = str(raw_date).strip()

    for date_format in KNOWN_DATE_FORMATS:
        try:
            return datetime.strptime(value, date_format)
        except ValueError:
            continue

    raise ValueError(f"Unsupported transaction date format: {raw_date}")


def _normalize_transaction_type(raw_type):
    transaction_type = str(raw_type).strip().lower()

    if transaction_type == "credit":
        return "credit"
    if transaction_type == "investment":
        return "investment"
    if transaction_type.startswith("sip"):
        return "SIP"
    return "debit"


def sort_transaction():
    with open(r"data\transactions.json", "r") as file:
        transactionData = json.load(file)

    SIPTransactions = []
    investmentTransactions = []
    debitTransactions = []
    creditTransactions = []

    for transaction in transactionData:
        normalized_transaction = dict(transaction)
        normalized_transaction["date"] = _parse_transaction_date(transaction["date"]).strftime(r"%d-%m-%y")
        normalized_transaction["type"] = _normalize_transaction_type(transaction.get("type"))
        if normalized_transaction["type"] == "debit" and normalized_transaction.get("essentiality") is None:
            normalized_transaction["essentiality"] = 0.5

        if normalized_transaction["type"] == "debit":
            debitTransactions.append(normalized_transaction)
        elif normalized_transaction["type"] == "credit":
            creditTransactions.append(normalized_transaction)
        elif normalized_transaction["type"] == "SIP":
            SIPTransactions.append(normalized_transaction)
        elif normalized_transaction["type"] == "investment":
            investmentTransactions.append(normalized_transaction)

    debitTransactions.sort(key=lambda x: datetime.strptime(x["date"], r"%d-%m-%y"), reverse=True)
    creditTransactions.sort(key=lambda x: datetime.strptime(x["date"], r"%d-%m-%y"), reverse=True)
    SIPTransactions.sort(key=lambda x: datetime.strptime(x["date"], r"%d-%m-%y"), reverse=True)
    investmentTransactions.sort(key=lambda x: datetime.strptime(x["date"], r"%d-%m-%y"), reverse=True)

    with open(r"data\monthly_spending.json", "w") as updatedDebit:
        json.dump(debitTransactions, updatedDebit, indent=4)

    with open(r"data\monthly_income.json", "w") as updatedCredit:
        json.dump(creditTransactions, updatedCredit, indent=4)

    with open(r"data\monthly_SIP.json", "w") as updatedSIP:
        json.dump(SIPTransactions, updatedSIP, indent=4)

    with open(r"data\monthly_investment.json", "w") as updatedInvestment:
        json.dump(investmentTransactions, updatedInvestment, indent=4)

def getMainCredit():
    creditScore = 0.30 * control.getCashFlowStablility() + 0.27 * control.getSpendingHabitScore() + 0.25 * control.getInvestmentDisciplineScore() + 0.18 * control.getEmergencyFundsScore()
    creditScore = 6 * creditScore + 300 - control.getShockPenalty()
    return creditScore
def getCashFlowStability():
    cashFlowStabilityScore = control.getCashFlowStablility()
    return cashFlowStabilityScore
def getSpendingHabitScore():
    spedingHabitScore = control.getSpendingHabitScore()
    return spedingHabitScore
def getInvestmentDisciplineScore():
    investmentDisciplineScore = control.getInvestmentDisciplineScore()
    return investmentDisciplineScore
def getEmergencyFundScore():
    emergencyFundScore = control.getEmergencyFundsScore()
    return emergencyFundScore
