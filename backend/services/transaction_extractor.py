import json
import re
from services.llm_services import generate
from utils.json_utils import save_transaction


def extract_transaction(text):

    prompt = f"""
Extract transaction information from the following bank alert.

Return ONLY valid JSON with these fields:

amount
type
merchant
date
reference
category

For type choose one of: credit/debit/investment/SIP

date format: DD-MM-YY

reference is the UPI transaction reference number.
if the amount is not there let it be an empty feild ''

Category should be a general spending category such as:
food, groceries, rent, transport, shopping, utilities, entertainment, healthcare, income, or other.

Choose the most appropriate category based on the merchant and contrext.

Message:
{text}
"""

    try:
        # Call the LLM
        response = generate(prompt)

        # Extract JSON from response
        json_match = re.search(r"\{.*\}", response, re.DOTALL)

        if not json_match:
            print("No JSON found in LLM response")
            return None

        transaction = json.loads(json_match.group())

        # Clean reference number
        if "reference" in transaction and transaction["reference"]:
            transaction["reference"] = (
                str(transaction["reference"]).replace(".", "").strip()
            )

        # Save transaction (handles deduplication)
        save_transaction(transaction)

        return transaction

    except Exception as e:

        print("Transaction extraction failed:", e)

        return None
    