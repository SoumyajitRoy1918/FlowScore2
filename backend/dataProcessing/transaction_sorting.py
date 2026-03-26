from datetime import datetime
import json
import os

def sort_transaction():
    with open(r"data\transactions.json","r") as file:
        transactionData = json.load(file)
    if(os.path.exists(r"data\monthly_spending.json") == False):
        with open(r"data\monthly_spending.json","w") as file:
            json.dump([],file,indent=4)

    monthlySpendingData = open(r"data\monthly_spending.json","r")

    SIPTransactions = []
    investmentTransactions = []
    debitTransactions = []
    creditTransactions = []

    for i in range(len(transactionData)):
        if(transactionData[i] in monthlySpendingData):
            continue
        if(transactionData[i]["type"] == "debit"):
            debitTransactions.append(transactionData[i])
        elif(transactionData[i]["type"] == "credit"):
            creditTransactions.append(transactionData[i])
        elif(transactionData[i]["type"] == "SIP"):
            SIPTransactions.append(transactionData[i])
        elif(transactionData[i]["type"] == "investment"):
            investmentTransactions.append(transactionData[i])

    monthlySpendingData.close()

    if(len(debitTransactions) != 0):
        debitTransactions.sort(key = lambda x: datetime.strptime(x["date"],r"%d-%m-%y"),reverse=True)
        with open(r"data\monthly_spending.json","w") as updatedDebit:
            json.dump(debitTransactions,updatedDebit,indent = 4)

    if(len(creditTransactions) != 0):
        creditTransactions.sort(key = lambda x: datetime.strptime(x["date"],r"%d-%m-%y"),reverse=True)
        with open(r"data\monthly_income.json","w") as updatedCredit:
            json.dump(creditTransactions,updatedCredit,indent=4)

    if(len(SIPTransactions) != 0):
        SIPTransactions.sort(key = lambda x: datetime.strptime(x["date"],r"%d-%m-%y"),reverse=True)

        with open(r"data\monthly_SIP.json","w") as updatedSIP:
            json.dump(SIPTransactions,updatedSIP,indent=4)

    if(len(investmentTransactions) != 0):
        investmentTransactions.sort(key = lambda x: datetime.strptime(x["date"],r"%d-%m-%y"),reverse=True)
        with open(r"data\monthly_investment.json","w") as updatedInvestment:
            json.dump(investmentTransactions,updatedInvestment,indent=4)

