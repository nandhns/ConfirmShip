from pathlib import Path
import json
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    EmailInput,
    ProcessedEmail,
    VerificationResult,
    FieldComparison,
)
from app.processing.classifier import classify_email
from app.processing.verifier import verify_email_record

router = APIRouter(
    prefix="/process",
    tags=["process"],
)

DATA_DIR = Path("challenge/data_v2")


@router.post("", response_model=ProcessedEmail)
def process_email_payload(email: EmailInput):
    """Processes an arbitrary email payload sent in the request body."""
    email_dict = email.model_dump(by_alias=True)
    classification = classify_email(email_dict)
    verif = verify_email_record(email_dict, classification.category, str(DATA_DIR))

    comparisons = [
        FieldComparison(
            field=c["field"],
            si_value=c["si_raw"],
            bl_value=c["bl_raw"],
            si_normalized=c["si_normalized"],
            bl_normalized=c["bl_normalized"],
            matches=c["matches"],
        )
        for c in verif.get("comparisons", [])
    ]

    status_str = "no_mismatch" if verif["status"] == "OK" else (
        "mismatch" if verif["status"] == "MISMATCH" else "needs_review"
    )

    verification_result = VerificationResult(
        email_id=email.email_id,
        status=status_str,
        has_defect=verif["has_defect"],
        field_comparisons=comparisons,
        defect_fields=verif["defect_fields"],
        review_reason=verif.get("review_reason"),
        review_details=verif.get("review_reason"),
    )

    return ProcessedEmail(
        email_id=email.email_id,
        classification=classification,
        verification=verification_result,
    )


@router.post("/{email_id}", response_model=ProcessedEmail)
def process_email_by_id(email_id: str):
    """Loads an email by ID from inbox and runs the complete verification pipeline."""
    email_path = DATA_DIR / "inbox" / f"{email_id}.json"
    if not email_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email {email_id} not found",
        )

    with open(email_path, "r", encoding="utf-8") as fp:
        raw_email = json.load(fp)

    email_input = EmailInput(
        email_id=raw_email["email_id"],
        sender=raw_email.get("from", ""),
        subject=raw_email.get("subject", ""),
        body=raw_email.get("body", ""),
        attachments=raw_email.get("attachments", []),
    )
    return process_email_payload(email_input)
