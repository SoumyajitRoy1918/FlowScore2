import statistics
def getNecessityWeightScore(three_months_spending):  #Parameter is a list of debits for upto 3 months at max
    total = sum(float(txn["amount"]) for txn in three_months_spending)
    weightedTotal = 0
    for transaction in three_months_spending:
        weightedTotal += float(transaction["amount"]) * transaction["essentiality"]
    necessityWeightScore = weightedTotal*100/total
    return necessityWeightScore

def getSpendingPredictibility(monthly_spending):   #should be a list of expenses in a month
    if statistics.mean(monthly_spending) == 0:
        return 0
    CoeffOfVariation = statistics.stdev(monthly_spending)/statistics.mean(monthly_spending)
    spendingPredictibility = 100 - min(100, CoeffOfVariation*100)
    return spendingPredictibility

def getLifestyleInflationScore(monthly_nonessential, monthly_income):   
    lifestyleInflationRatio = (monthly_nonessential[0] - monthly_nonessential[1])/(monthly_income[0] - monthly_income[1])
    lifestyleInflationScore = 100 - min(100, (max(0, lifestyleInflationRatio-1))*100)
    return lifestyleInflationScore
