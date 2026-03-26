def is_duplicate(transaction, transactions):

    ref = str(transaction.get("reference")).strip()

    for t in transactions:

        existing_ref = str(t.get("reference")).strip()

        if existing_ref == ref:
            return True

    return False