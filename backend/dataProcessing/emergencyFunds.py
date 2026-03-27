def getEmergencyCoverageScore(balance,average_monthly_spending):
    coverageMonths = balance/average_monthly_spending
    emergencyCoverageScore = min(100, coverageMonths*100/3)
    if(emergencyCoverageScore < 0):
       return 0
    return emergencyCoverageScore