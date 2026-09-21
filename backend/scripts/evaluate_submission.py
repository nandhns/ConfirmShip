"""Generates submission.json and evaluates score against ground truth."""
import json
import os
from pathlib import Path
import sys
import subprocess

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.processing.classifier import classify_email
from app.processing.verifier import verify_email_record

DATA_DIR = Path("challenge/data_v2")
INBOX_DIR = DATA_DIR / "inbox"
OUTPUT_FILE = Path("submission.json")


def main():
    email_files = sorted(INBOX_DIR.glob("email_*.json"))
    print(f"Loaded {len(email_files)} emails from {INBOX_DIR}")

    submission = {}
    for f in email_files:
        with open(f, "r", encoding="utf-8") as fp:
            email = json.load(fp)

        email_id = email["email_id"]
        classification = classify_email(email)
        res = verify_email_record(email, classification.category, str(DATA_DIR))

        # Format strictly matching sample_submission.json
        submission[email_id] = {
            "category": res["category"],
            "status": res["status"],
            "review_reason": res["review_reason"],
            "defect_fields": res["defect_fields"],
            "has_defect": res["has_defect"],
        }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as fp:
        json.dump(submission, fp, indent=2)

    print(f"Wrote submission payload to {OUTPUT_FILE}")
    print("\n" + "="*50)
    print("RUNNING OFFICIAL BENCHMARK SCORING")
    print("="*50)

    score_env = os.environ.copy()
    score_env.setdefault("PYTHONIOENCODING", "utf-8")

    subprocess.run([
        sys.executable,
        "challenge/server/score_cli.py",
        str(OUTPUT_FILE),
        "--ground-truth",
        str(DATA_DIR / "ground_truth.json")
    ], check=True, env=score_env)


if __name__ == "__main__":
    main()
