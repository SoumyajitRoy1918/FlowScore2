from __future__ import annotations

import os
import json
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any

from export_transactions_db_to_json import export_transactions
from final_score import sort_transaction

try:
    from utils.amount_utils import parse_amount
except ModuleNotFoundError:
    def parse_amount(raw_amount: Any) -> float:
        cleaned_value = (
            str(raw_amount)
            .replace(",", "")
            .replace("₹", "")
            .replace("INR", "")
            .replace("Rs.", "")
            .replace("Rs", "")
            .strip()
        )

        try:
            return float(cleaned_value)
        except ValueError:
            return 0.0


BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATASET_FILES = (
    ("transactions", "transactions.json"),
    ("monthly_spending", "monthly_spending.json"),
    ("monthly_sip", "monthly_SIP.json"),
    ("monthly_investment", "monthly_investment.json"),
    ("monthly_income", "monthly_income.json"),
)


@contextmanager
def _backend_working_directory():
    original_cwd = Path.cwd()
    os.chdir(BACKEND_DIR)
    try:
        yield
    finally:
        os.chdir(original_cwd)


def _ensure_processed_datasets() -> None:
    export_transactions(
        db_path=DATA_DIR / "transactions.db",
        json_path=DATA_DIR / "transactions.json",
    )
    with _backend_working_directory():
        sort_transaction()


def _read_dataset(file_name: str) -> list[dict[str, Any]]:
    path = DATA_DIR / file_name
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if not isinstance(payload, list):
        raise ValueError(f"{file_name} does not contain a JSON array.")

    return [row for row in payload if isinstance(row, dict)]


def _normalize_amount(raw_amount: Any) -> float:
    return parse_amount(raw_amount)


def _normalize_date(raw_date: Any) -> str:
    value = str(raw_date).strip()
    if not value:
        return ""

    known_formats = (
        "%d-%m-%y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d/%m/%y",
        "%d-%b-%Y",
        "%d-%b-%y",
        "%d-%B-%Y",
        "%d-%B-%y",
    )

    for date_format in known_formats:
        try:
            return datetime.strptime(value, date_format).strftime("%Y-%m-%d")
        except ValueError:
            continue

    return value


def _normalize_direction(raw_type: Any) -> str:
    transaction_type = str(raw_type).strip().lower()
    return "income" if transaction_type.startswith("credit") else "expense"


def _build_transaction(row: dict[str, Any], dataset_name: str, user_id: str, index: int) -> dict[str, Any]:
    reference = str(row.get("reference") or f"{dataset_name}-{index}").strip()

    return {
        "id": reference,
        "userId": user_id,
        "transactionRef": reference,
        "txnDate": _normalize_date(row.get("date")),
        "description": str(row.get("merchant") or row.get("category") or "Unknown transaction").strip(),
        "amount": _normalize_amount(row.get("amount")),
        "direction": _normalize_direction(row.get("type")),
        "source": dataset_name,
        "_sources": [dataset_name],
    }


def load_transaction_snapshot(user_id: str, start_date: str = "", end_date: str = "") -> dict[str, Any]:
    _ensure_processed_datasets()

    merged_transactions: dict[str, dict[str, Any]] = {}

    for dataset_name, file_name in DATASET_FILES:
        for index, row in enumerate(_read_dataset(file_name)):
            transaction_key = str(row.get("reference") or f"{dataset_name}-{index}")
            existing = merged_transactions.get(transaction_key)

            if existing is None:
                merged_transactions[transaction_key] = _build_transaction(row, dataset_name, user_id, index)
                continue

            if dataset_name not in existing["_sources"]:
                existing["_sources"].append(dataset_name)

    filtered_transactions = []

    for transaction in merged_transactions.values():
        transaction["source"] = ",".join(transaction.pop("_sources"))

        if start_date and transaction["txnDate"] < start_date:
            continue

        if end_date and transaction["txnDate"] > end_date:
            continue

        filtered_transactions.append(transaction)

    filtered_transactions.sort(key=lambda row: (row["txnDate"], row["id"]), reverse=True)

    return {
        "userId": user_id,
        "transactionCount": len(filtered_transactions),
        "transactions": filtered_transactions,
    }
