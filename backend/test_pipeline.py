import time
from services.transaction_extractor import extract_transaction
from services.essentiality import assign_essentiality
from gmail.gmail_fetcher import authenticate_gmail, fetch_transaction_emails, get_email_body

service = authenticate_gmail()

messages = fetch_transaction_emails(service, 100)

# Example email texts (simulate Gmail messages)
test_emails = []

for msg in messages:
    body = get_email_body(service, msg["id"])
    test_emails.append(body)


for email in test_emails:

    print("\nProcessing email...\n")

    transaction = extract_transaction(email)

    if transaction:
        print("Extracted Transaction:")
        print(transaction)

    # prevent Bytez rate limit
    time.sleep(2)

assign_essentiality()
