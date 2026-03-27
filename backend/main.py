from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gmail.gmail_fetcher import authenticate_gmail, fetch_transaction_emails
from services.analysis_service import build_analysis_result
from services.auth_service import (
    AuthError,
    get_account_profile,
    initialize_auth_storage,
    login_account,
    register_account,
)
from services.transaction_data_service import load_transaction_snapshot


app = FastAPI()
app.state.gmail_service = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str

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


@app.on_event("startup")
def startup_event():
    initialize_auth_storage()


@app.post("/auth/register")
def register_user(payload: RegisterRequest):
    try:
        return register_account(
            full_name=payload.fullName,
            email=payload.email,
            password=payload.password,
        )
    except AuthError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to create account: {exc}") from exc


@app.post("/auth/login")
def login_user(payload: LoginRequest):
    try:
        return login_account(email=payload.email, password=payload.password)
    except AuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to sign in: {exc}") from exc


@app.get("/auth/accounts/{account_id}")
def get_account(account_id: str):
    account = get_account_profile(account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")

    return account


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
        return load_transaction_snapshot(user_id=userId, start_date=startDate, end_date=endDate)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to load transaction data: {exc}") from exc


@app.post("/gmail/authenticate")
def authenticate_gmail_account():
    try:
        service = authenticate_gmail()
        messages = fetch_transaction_emails(service, max_results=20)
        app.state.gmail_service = service
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gmail authentication failed: {exc}") from exc

    message = f"Gmail authenticated successfully. Fetched {len(messages)} transaction emails."

    return {
        "authenticated": True,
        "message": message,
        "stats": {
            "fetchedCount": len(messages),
            "processedCount": len(messages),
            "parsedCount": 0,
            "savedCount": 0,
            "skippedCount": 0,
            "failedCount": 0,
        },
    }

