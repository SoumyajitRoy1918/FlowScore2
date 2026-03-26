def getEmergencyCoverageScore(balance,average_monthly_spending):
    coverageMonths = balance/average_monthly_spending
    emergencyCoverageScore = min(100, coverageMonths*100/3)
    return emergencyCoverageScore