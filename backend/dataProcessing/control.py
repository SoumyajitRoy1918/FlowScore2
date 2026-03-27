from dateutil.relativedelta import relativedelta
from datetime import date
from datetime import datetime
import dataProcessing.spendingHabitScore as spendingHabitScore
import dataProcessing.cashFlowStability as cashFlowStability
import dataProcessing.investmentDiscipline as investmentDiscipline
import dataProcessing.emergencyFunds as emergencyFunds
import dataProcessing.shock_penalty as shock_penalty
import json
import statistics

def _trim_trailing_zero_months(monthly_values):
    trimmed_values = monthly_values[:]

    for i in range(len(trimmed_values) - 1, 0, -1):
        if trimmed_values[i] == 0:
            trimmed_values.pop(i)
        else:
            break

    return trimmed_values


def _build_yearly_amounts(file_path):
    with open(file_path, "r") as file:
        rows = json.load(file)

    today = date.today()
    current_month = today.month
    yearly_amounts = [0,0,0,0,0,0,0,0,0,0,0,0]

    for data in rows:
        month_index = current_month - datetime.strptime(data["date"], r"%d-%m-%y").month

        if(month_index < 12):
            if(month_index < 0):
                month_index += 12
            yearly_amounts[month_index] += float(data["amount"])

    return _trim_trailing_zero_months(yearly_amounts)


def _mean_or_zero(values):
    if len(values) == 0:
        return 0
    return statistics.mean(values)


def getSpendingHabitScore():
    with open(r"data\monthly_spending.json") as file:
        spendingData = json.load(file)
    today = date.today()
    three_months_ago = today - relativedelta(months=3)
    three_months_ago_formatted = three_months_ago.strftime(r"%d-%m-%y")
    three_months_spendings = []

    current_month_unnecessary_spending = 0
    current_month = today.month
    yearly_spending_list = [0,0,0,0,0,0,0,0,0,0,0,0]

    previous_month = today - relativedelta(months=1)
    previous_month_formatted = previous_month.strftime(r"%d-%m-%y")
    previous_month_unnecessary_spending = 0

    for data in spendingData:
        if(datetime.strptime(data["date"],r"%d-%m-%y")>datetime.strptime((three_months_ago_formatted),r"%d-%m-%y")):
            three_months_spendings.append(data)

        month_index = current_month - datetime.strptime(data["date"],r"%d-%m-%y").month

        if(month_index < 12):
            if(month_index < 0):
                month_index += 12
            yearly_spending_list[month_index] += float(data["amount"])
        if(data.get("essentiality") is not None and data["essentiality"]<=0.5):
            if(datetime.strptime(data["date"],r"%d-%m-%y")>=datetime.strptime((previous_month_formatted),r"%d-%m-%y")):
                current_month_unnecessary_spending += float(data["amount"])
            elif(datetime.strptime(data["date"],r"%d-%m-%y")<datetime.strptime((previous_month_formatted),r"%d-%m-%y") and datetime.strptime(data["date"],r"%d-%m-%y")>=(datetime.strptime((previous_month_formatted),r"%d-%m-%y")-relativedelta(months=1))):
                previous_month_unnecessary_spending += float(data["amount"])

    necessityWeightScore = spendingHabitScore.getNecessityWeightScore(three_months_spendings)

    yearly_spending_list = _trim_trailing_zero_months(yearly_spending_list)
    
    spendingPredictibilityScore = spendingHabitScore.getSpendingPredictibility(yearly_spending_list)
    unneccery_spendings = [current_month_unnecessary_spending,previous_month_unnecessary_spending]
    lifestyle_inflation_score = spendingHabitScore.getLifestyleInflationScore(unneccery_spendings,yearly_spending_list)
    spendingHabitScores = 0.45 * necessityWeightScore + 0.35 * spendingPredictibilityScore + 0.20* lifestyle_inflation_score

    return spendingHabitScores

def getCashFlowStablility():
    yearly_earning_list = _build_yearly_amounts(r"data\monthly_income.json")
    incomeConsistencyScore= cashFlowStability.getIncomeConsistency(yearly_earning_list)
    incomeVolatilityScore = cashFlowStability.getIncomeVolatility(yearly_earning_list)
    cashFlowStabilityScore = 0.55 * incomeConsistencyScore + incomeVolatilityScore
    return cashFlowStabilityScore

def getEmergencyFundsScore():
    yearly_spending_list = _build_yearly_amounts(r"data\monthly_spending.json")
    yearly_earning_list = _build_yearly_amounts(r"data\monthly_income.json")
    yearly_net_income = []
    for i in range(max(len(yearly_spending_list),len(yearly_earning_list))):
        if(i >= len(yearly_earning_list)):
            yearly_net_income.append(-yearly_spending_list[i])
        elif(i >= len(yearly_spending_list)):
            yearly_net_income.append(yearly_earning_list[i])
        else:
            yearly_net_income.append(yearly_earning_list[i] - yearly_spending_list[i])
    current_balance = sum(yearly_net_income)
    if len(yearly_spending_list) == 0:
        return 0
    EmergencyFundsScore = emergencyFunds.getEmergencyCoverageScore(current_balance,_mean_or_zero(yearly_spending_list))
    return EmergencyFundsScore

def getInvestmentDisciplineScore():
    with open(r"data\monthly_SIP.json", "r") as file:
        SIPData = json.load(file)
    with open(r"data\monthly_investment.json", "r") as file:
        investmentData = json.load(file)
    yearly_SIP = [0,0,0,0,0,0,0,0,0,0,0,0]
    yearly_investment = [0,0,0,0,0,0,0,0,0,0,0,0]

    today = date.today()
    current_month = today.month
    for data in SIPData:
         month_index = current_month - datetime.strptime(data["date"],r"%d-%m-%y").month

         if(month_index < 12):
            if(month_index < 0):
                month_index += 12
            yearly_SIP[month_index] += float(data["amount"])

    for i in range (11,0,-1):
        if yearly_SIP[i] == 0:
            yearly_SIP.pop(i)
        else:
            break
    SIPConsistecyScore = investmentDiscipline.getSIPConsistecyScore(yearly_SIP)

    for data in investmentData:
         month_index = current_month - datetime.strptime(data["date"],r"%d-%m-%y").month

         if(month_index < 12):
            if(month_index < 0):
                month_index += 12
            yearly_investment[month_index] += float(data["amount"])
    for i in range (max(len(yearly_investment), len(yearly_SIP))):
        if len(yearly_investment) > len(yearly_SIP):
            if(i >= len(yearly_SIP)):
                continue
            else:
                yearly_investment[i] += yearly_SIP[i]
        elif(len(yearly_SIP) >= len(yearly_investment)):
            if(i >= len(yearly_investment)):
                yearly_investment.append(yearly_SIP[i])
            else:
                yearly_investment[i] += yearly_SIP[i]

    yearly_earning_list = _build_yearly_amounts(r"data\monthly_income.json")
    current_month_investment = yearly_investment[0] if len(yearly_investment) != 0 else 0
    current_month_income = yearly_earning_list[0] if len(yearly_earning_list) != 0 else 0
    investmentRatioScore = investmentDiscipline.getInvestmentRatioScore(current_month_investment,current_month_income)
    investmentDisciplineScore = 0.5 * SIPConsistecyScore + 0.5 * investmentRatioScore
    return investmentDisciplineScore

def getShockPenalty():
    with open(r"data\monthly_spending.json") as file:
        spendingData = json.load(file)
    today = date.today()
    previous_month = today - relativedelta(months=1)
    previous_month_formatted = previous_month.strftime(r"%d-%m-%y")
    previous_month_spendings = []
    for data in spendingData:
        if(datetime.strptime(data["date"],r"%d-%m-%y")>datetime.strptime((previous_month_formatted),r"%d-%m-%y")):
            previous_month_spendings.append(data)
    yearly_earning_list = _build_yearly_amounts(r"data\monthly_income.json")
    average_monthly_income = _mean_or_zero(yearly_earning_list)
    if average_monthly_income == 0:
        return 0
    shockPenalty = shock_penalty.getShockPenalty(previous_month_spendings,average_monthly_income)
    return shockPenalty 