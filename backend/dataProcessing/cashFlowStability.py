import statistics
def getIncomeConsistency(monthly_income):    #List of income of each month
    monthsWithEarning = 0
    average = statistics.mean(monthly_income)
    for monthly_earning in monthly_income:
        if monthly_earning < 0.6*average :
            monthsWithEarning+=1
    if len(monthly_income) == 0:
        return 0
    monthsWithEarningScore = monthsWithEarning * 100 /len(monthly_income)
    return monthsWithEarningScore

def getIncomeVolatility(monthly_income): #list of income of each month 
    if len(monthly_income) < 2:
        return 0.5
    if statistics.mean(monthly_income) == 0:
        return 0
    CoeffOfVariation = statistics.stdev(monthly_income)/statistics.mean(monthly_income)
    IncomeVolatility = 100 - min(100, CoeffOfVariation*100)
    return IncomeVolatility