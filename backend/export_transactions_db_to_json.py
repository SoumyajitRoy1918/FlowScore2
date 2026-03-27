from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path


DEFAULT_DB_PATH = Path(__file__).resolve().parent / "data" / "transactions.db"
DEFAULT_JSON_PATH = Path(__file__).resolve().parent / "data" / "transactions.json"
EXPECTED_COLUMNS = (
    "amount",
    "type",
    "merchant",
    "date",
    "reference",
    "category",
    "essentiality",
)


def _validate_columns(connection: sqlite3.Connection, table_name: str) -> None:
    cursor = connection.cursor()
    columns = cursor.execute(f"PRAGMA table_info({table_name})").fetchall()
    available = {column[1] for column in columns}
    missing = [column for column in EXPECTED_COLUMNS if column not in available]

    if missing:
        missing_list = ", ".join(missing)
        raise ValueError(f"Table '{table_name}' is missing required columns: {missing_list}")


def export_transactions(db_path: Path, json_path: Path, table_name: str = "transactions") -> int:
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row

    try:
        _validate_columns(connection, table_name)
        cursor = connection.cursor()
        rows = cursor.execute(
            f"""
            SELECT amount, type, merchant, date, reference, category, essentiality
            FROM {table_name}
            """
        ).fetchall()
    finally:
        connection.close()

    payload = []
    for row in rows:
        entry = {column: row[column] for column in EXPECTED_COLUMNS}
        if entry["essentiality"] is not None:
            entry["essentiality"] = float(entry["essentiality"])
        payload.append(entry)

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return len(payload)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export backend/data/transactions.db into backend/data/transactions.json."
    )
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="Path to the SQLite database.")
    parser.add_argument("--json", default=str(DEFAULT_JSON_PATH), help="Path to the output JSON file.")
    parser.add_argument(
        "--table",
        default="transactions",
        help="Table name inside the SQLite database.",
    )
    args = parser.parse_args()

    db_path = Path(args.db)
    json_path = Path(args.json)
    exported = export_transactions(db_path=db_path, json_path=json_path, table_name=args.table)
    print(f"Exported {exported} transactions to {json_path}")


if __name__ == "__main__":
    main()
