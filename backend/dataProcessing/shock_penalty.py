def getShockPenalty(monthly_spendings,average_monthly_income):
    shockPenalty = 0
    for spending in monthly_spendings:
        if(float(spending["amount"])> 0.7 * average_monthly_income):
            shockPenalty += min(30, 10 * float(spending["amount"])/average_monthly_income)
    return shockPenalty