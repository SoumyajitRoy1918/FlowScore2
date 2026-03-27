from __future__ import annotations

import base64
import hashlib
import hmac
import os
import re
import secrets
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


try:
    import psycopg2  # type: ignore
except ImportError:  # pragma: no cover - optional for local sqlite usage
    psycopg2 = None


DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DEFAULT_DATABASE_URL = f"sqlite:///{(DATA_DIR / 'app.db').as_posix()}"
PASSWORD_ITERATIONS = 390000
DEMO_EMAIL = "demo@maybach.ai"
DEMO_PASSWORD = "demo12345"


class AuthError(ValueError):
    pass


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _normalize_database_url(raw_url: str | None) -> str:
    if not raw_url:
        return DEFAULT_DATABASE_URL

    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql://", 1)

    return raw_url


class AuthStore:
    def __init__(self, database_url: str | None = None):
        self.database_url = _normalize_database_url(database_url or os.getenv("DATABASE_URL"))
        self.is_postgres = self.database_url.startswith("postgresql://")

    def _connect(self):
        if self.is_postgres:
            if psycopg2 is None:
                raise RuntimeError(
                    "DATABASE_URL points to PostgreSQL, but psycopg2 is not installed. "
                    "Install psycopg2-binary before starting the backend."
                )

            return psycopg2.connect(self.database_url)

        sqlite_path = self.database_url.replace("sqlite:///", "", 1)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(sqlite_path, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        return connection

    def _fetch_one(self, query: str, params: tuple[Any, ...]) -> dict[str, Any] | None:
        connection = self._connect()
        try:
            cursor = connection.cursor()
            cursor.execute(query, params)
            row = cursor.fetchone()
            if row is None:
                return None

            if isinstance(row, sqlite3.Row):
                return dict(row)

            columns = [column[0] for column in cursor.description or []]
            return dict(zip(columns, row))
        finally:
            connection.close()

    def _execute(self, query: str, params: tuple[Any, ...]) -> None:
        connection = self._connect()
        try:
            cursor = connection.cursor()
            cursor.execute(query, params)
            connection.commit()
        finally:
            connection.close()

    def _placeholder(self) -> str:
        return "%s" if self.is_postgres else "?"

    def initialize(self) -> None:
        connection = self._connect()
        try:
            cursor = connection.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS accounts (
                    account_id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    linked_user_id TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    last_login_at TEXT
                )
                """
            )
            connection.commit()
        finally:
            connection.close()

    def get_account_by_email(self, email: str) -> dict[str, Any] | None:
        placeholder = self._placeholder()
        return self._fetch_one(
            f"""
            SELECT account_id, full_name, email, password_hash, linked_user_id, created_at, last_login_at
            FROM accounts
            WHERE email = {placeholder}
            """,
            (email,),
        )

    def get_account_by_id(self, account_id: str) -> dict[str, Any] | None:
        placeholder = self._placeholder()
        return self._fetch_one(
            f"""
            SELECT account_id, full_name, email, password_hash, linked_user_id, created_at, last_login_at
            FROM accounts
            WHERE account_id = {placeholder}
            """,
            (account_id,),
        )

    def get_account_by_linked_user_id(self, linked_user_id: str) -> dict[str, Any] | None:
        placeholder = self._placeholder()
        return self._fetch_one(
            f"""
            SELECT account_id, full_name, email, password_hash, linked_user_id, created_at, last_login_at
            FROM accounts
            WHERE linked_user_id = {placeholder}
            """,
            (linked_user_id,),
        )

    def create_account(self, account: dict[str, Any]) -> None:
        placeholder = self._placeholder()
        placeholders = ", ".join([placeholder] * 7)
        self._execute(
            f"""
            INSERT INTO accounts (
                account_id,
                full_name,
                email,
                password_hash,
                linked_user_id,
                created_at,
                last_login_at
            )
            VALUES ({placeholders})
            """,
            (
                account["account_id"],
                account["full_name"],
                account["email"],
                account["password_hash"],
                account["linked_user_id"],
                account["created_at"],
                account["last_login_at"],
            ),
        )

    def update_last_login(self, account_id: str, signed_in_at: str) -> None:
        placeholder = self._placeholder()
        self._execute(
            f"""
            UPDATE accounts
            SET last_login_at = {placeholder}
            WHERE account_id = {placeholder}
            """,
            (signed_in_at, account_id),
        )


AUTH_STORE = AuthStore()


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _slugify_email(email: str) -> str:
    base = email.split("@")[0].strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "_", base).strip("_")
    return slug or "user"


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return "$".join(
        [
            "pbkdf2_sha256",
            str(PASSWORD_ITERATIONS),
            base64.b64encode(salt).decode("utf-8"),
            base64.b64encode(derived_key).decode("utf-8"),
        ]
    )


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_b64, derived_key_b64 = stored_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    salt = base64.b64decode(salt_b64.encode("utf-8"))
    expected_key = base64.b64decode(derived_key_b64.encode("utf-8"))
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
    return hmac.compare_digest(derived_key, expected_key)


def _build_public_account(account_row: dict[str, Any]) -> dict[str, Any]:
    return {
        "accountId": account_row["account_id"],
        "fullName": account_row["full_name"],
        "email": account_row["email"],
        "linkedUserId": account_row["linked_user_id"],
        "createdAt": account_row["created_at"],
        "lastLoginAt": account_row["last_login_at"],
    }


def _build_session(account_row: dict[str, Any], signed_in_at: str) -> dict[str, Any]:
    return {
        "accountId": account_row["account_id"],
        "fullName": account_row["full_name"],
        "email": account_row["email"],
        "linkedUserId": account_row["linked_user_id"],
        "signedInAt": signed_in_at,
        "gmailAuthenticated": False,
    }


def _build_unique_linked_user_id(email: str) -> str:
    slug = _slugify_email(email)
    candidate = f"user_{slug}"
    suffix = 1

    while AUTH_STORE.get_account_by_linked_user_id(candidate):
        suffix += 1
        candidate = f"user_{slug}_{suffix}"

    return candidate


def initialize_auth_storage() -> None:
    AUTH_STORE.initialize()
    _seed_demo_account()


def _seed_demo_account() -> None:
    if AUTH_STORE.get_account_by_email(DEMO_EMAIL):
        return

    demo_account = {
        "account_id": "acct_demo_001",
        "full_name": "Demo Analyst",
        "email": DEMO_EMAIL,
        "password_hash": _hash_password(DEMO_PASSWORD),
        "linked_user_id": "demo_user_001",
        "created_at": "2026-03-01T10:00:00Z",
        "last_login_at": "2026-03-24T09:45:00Z",
    }
    AUTH_STORE.create_account(demo_account)


def register_account(full_name: str, email: str, password: str) -> dict[str, Any]:
    cleaned_name = full_name.strip()
    cleaned_email = _normalize_email(email)

    if len(cleaned_name) < 2:
        raise AuthError("Enter your full name.")

    if len(password) < 8:
        raise AuthError("Use at least 8 characters for your password.")

    if AUTH_STORE.get_account_by_email(cleaned_email):
        raise AuthError("An account with this email already exists.")

    signed_in_at = _utcnow_iso()
    account_row = {
        "account_id": f"acct_{secrets.token_hex(8)}",
        "full_name": cleaned_name,
        "email": cleaned_email,
        "password_hash": _hash_password(password),
        "linked_user_id": _build_unique_linked_user_id(cleaned_email),
        "created_at": signed_in_at,
        "last_login_at": signed_in_at,
    }

    AUTH_STORE.create_account(account_row)

    return {
        "account": _build_public_account(account_row),
        "session": _build_session(account_row, signed_in_at),
    }


def login_account(email: str, password: str) -> dict[str, Any]:
    cleaned_email = _normalize_email(email)
    account_row = AUTH_STORE.get_account_by_email(cleaned_email)

    if not account_row or not _verify_password(password, account_row["password_hash"]):
        raise AuthError("Invalid email or password.")

    signed_in_at = _utcnow_iso()
    AUTH_STORE.update_last_login(account_row["account_id"], signed_in_at)
    account_row["last_login_at"] = signed_in_at

    return {
        "account": _build_public_account(account_row),
        "session": _build_session(account_row, signed_in_at),
    }


def get_account_profile(account_id: str) -> dict[str, Any] | None:
    account_row = AUTH_STORE.get_account_by_id(account_id)
    if not account_row:
        return None

    return _build_public_account(account_row)

