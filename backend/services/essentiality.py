import json
import os
from services.llm_services import generate

DATA_PATH = r"D:\FlowScore\FlowScore\backend\data\transactions.json"
CACHE_PATH = r"D:\FlowScore\FlowScore\backend\data\category_scores.json"


def load_cache():
    if not os.path.exists(CACHE_PATH):
        return {}

    with open(CACHE_PATH, "r") as f:
        return json.load(f)


def save_cache(cache):
    with open(CACHE_PATH, "w") as f:
        json.dump(cache, f, indent=4)


def assign_essentiality():

    # Load transactions
    with open(DATA_PATH, "r") as f:
        transactions = json.load(f)

    # Load cache
    category_scores = load_cache()

    categories = list(set(
        t.get("category", "other")
        for t in transactions
        if t.get("type") == "debit"
    ))

    for category in categories:

        # Skip if already cached
        if category in category_scores:
            print(f"[CACHE] {category} → {category_scores[category]}")
            continue

        prompt = f"""
Give an essentiality score for the following spending category.

Category: {category}

Essentiality is a score between 0 and 1.
use this as reference (you can add and decide score aptly as new categories appear):
        "rent": 1.0,
        "groceries": 0.9,
        "food": 0.6
        "transport": 0.8,
        "school_fees": 1.0,
        "utilities": 1.0,
        "discretionary": 0.3,
        "subscriptions": 0.4,
        "medical": 0.9,
        "other": 0.6

Be consistent with similar categories.

Return ONLY a number between 0 and 1.
"""

        try:
            response = generate(prompt)

            score = float(response.strip())

            # clamp
            score = max(0, min(1, score))

            category_scores[category] = score

            print(f"[NEW] {category} → {score}")

        except Exception as e:
            print(f"Error for {category}: {e}")
            category_scores[category] = 0.5

    # Save cache
    save_cache(category_scores)

    # Apply scores
    for t in transactions:

        if t.get("type") == "debit":
            category = t.get("category", "other")
            t["essentiality"] = category_scores.get(category, 0.5)

        else:
            # Optional: set for credits
            t["essentiality"] = None   # or 1.0 if you prefer

    # Save updated transactions
    with open(DATA_PATH, "w") as f:
        json.dump(transactions, f, indent=4)

    print("\nEssentiality assigned to debit transactions only.")

