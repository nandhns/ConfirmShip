import json
import urllib.request
import os

CHALLENGE_SERVER_URL = os.getenv(
    "CHALLENGE_SERVER_URL", "http://localhost:8081"
)

def get_emails():
    url = f"{CHALLENGE_SERVER_URL}/emails"

    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())