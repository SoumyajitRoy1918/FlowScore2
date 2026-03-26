from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from gmail.gmail_fetcher import authenticate_gmail
from services.analysis_service import build_analysis_result
from services.transaction_data_service import load_transaction_snapshot
from dataProcessing.transaction_sorting import sort_transaction
from final_score import getEmergencyFundScore


app = FastAPI()
app.state.gmail_service = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/score")
def get_score():
    try:
        analysis_result = build_analysis_result()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to calculate trust index: {exc}") from exc

    return {"trustIndex": analysis_result["trustIndex"]}


@app.get("/breakdown")
def get_breakdown():
    try:
        analysis_result = build_analysis_result()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to calculate score breakdown: {exc}") from exc

    return {
        "cashflow": analysis_result["dimensions"]["cashFlowHealth"],
        "spending": analysis_result["dimensions"]["spendingDiscipline"],
        "investment": analysis_result["dimensions"]["investmentDiscipline"],
        "emergency": analysis_result["dimensions"]["financialResilience"],
    }


@app.get("/analysis")
def get_analysis(userId: str = "demo_user_001"):
    try:
        return build_analysis_result(user_id=userId)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to build analysis: {exc}") from exc


@app.get("/transactions")
def get_transactions(userId: str = "demo_user_001", startDate: str = "", endDate: str = ""):
    try:
        # Ensure the dataProcessing pipeline runs when transactions are loaded
        sort_transaction()
        return load_transaction_snapshot(user_id=userId, start_date=startDate, end_date=endDate)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to load transaction data: {exc}") from exc


@app.get("/financial-resilience")
def get_financial_resilience():
    try:
        score = getEmergencyFundScore()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to calculate financial resilience: {exc}") from exc
    return {
        "financialResilience": score
    }


@app.post("/gmail/authenticate")
def authenticate_gmail_account():
    try:
        app.state.gmail_service = authenticate_gmail()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gmail authentication failed: {exc}") from exc

    return {
        "authenticated": True,
        "message": "Gmail authenticated successfully."
    }
