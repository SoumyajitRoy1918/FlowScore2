import os
import pickle
import base64
from bs4 import BeautifulSoup
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import re
import json

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

STATE_FILE = "data/gmail_state.json"


def load_last_id():
    if not os.path.exists(STATE_FILE):
        return None

    with open(STATE_FILE, "r") as f:
        data = json.load(f)

    return data.get("last_id")


def save_last_id(message_id):
    with open(STATE_FILE, "w") as f:
        json.dump({"last_id": message_id}, f)

def authenticate_gmail():
    """Authenticate user with Gmail API"""

    creds = None

    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:

        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())

        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES
            )

            creds = flow.run_local_server(port=0)

        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('gmail', 'v1', credentials=creds)

    return service


def fetch_transaction_emails(service, max_results=20, page_token=None, return_response=False):
    """
    Fetch emails likely containing transaction alerts
    """

    query = "(debited OR credited OR UPI OR transaction)"
    params = {
        "userId": "me",
        "q": query,
        "maxResults": max_results,
    }

    if page_token:
        params["pageToken"] = page_token

    results = service.users().messages().list(**params).execute()

    if return_response:
        return results

    messages = results.get("messages", [])
    return messages

def clean_text(text):
    lines = text.splitlines()

    cleaned = []
    for line in lines:
        line = line.strip()              # remove leading/trailing spaces
        line = re.sub(r'\s+', ' ', line) # collapse multiple spaces
        if line:                         # remove empty lines
            cleaned.append(line)

    return "\n".join(cleaned)

def get_email_body(service, message_id):
    """
    Extract email body text
    """

    message = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()

    payload = message["payload"]

    headers = payload.get("headers", [])

    parts = payload.get("parts")

    if parts:

        for part in parts:

            mime = part.get("mimeType")

            if mime in ["text/plain", "text/html"]:

                data = part["body"].get("data")

                if data:

                    decoded = base64.urlsafe_b64decode(data).decode("utf-8")

                    # Clean HTML
                    soup = BeautifulSoup(decoded, "html.parser")

                    text = soup.get_text()

                    return clean_text(text)

    return ""
 

