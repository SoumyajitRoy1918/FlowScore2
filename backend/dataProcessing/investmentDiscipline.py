def getSIPConsistecyScore(yearly_SIP_list):
    consistency = 0
    if(len(yearly_SIP_list)<2):
        return 0
    for data in yearly_SIP_list:
        if data == 0:
            consistency = 0
        else:
            consistency += 1
    consistencyScore = consistency*100/len(yearly_SIP_list)
    return consistencyScore
def getInvestmentRatioScore(monthly_investment, monthly_income):
    if monthly_income == 0:
        return 0
    monthly_investment_ratio = monthly_investment/monthly_income
    investmentRatioScore = min(100, monthly_investment_ratio*250)
    return investmentRatioScore