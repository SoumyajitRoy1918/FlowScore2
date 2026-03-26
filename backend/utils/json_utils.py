import json
import os
from utils.duplicate import is_duplicate

DATA_FILE = "data/transactions.json"

def load_transactions():

    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_transaction(transaction):
    """
    Save a transaction if it is not a duplicate.
    """
    amount = transaction.get("amount")

    if amount in [None, "", 0]:
        print("Transaction skipped: amount missing.")
        return

    transactions = load_transactions()

    if is_duplicate(transaction, transactions):
        print("Duplicate transaction detected. Skipping.")
        return

    transactions.append(transaction)

    with open(DATA_FILE, "w") as f:
        json.dump(transactions, f, indent=4)

    print("Transaction saved successfully.")