from pathlib import Path
import json
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    EmailInput,
    ProcessedEmail,
    VerificationResult,
    FieldComparison,
    ReviewRecord,
    ReviewUpdate,
)
from app.core.config import settings
from app.processing.classifier import classify_email
from app.processing.verifier import verify_email_record
from app.integrations.challenge_inbox import get_emails
from app.processing.normalizer import normalize_document_fields
from app.services.review_store import add_correction, get_review, increment_attempt, save_review

router = APIRouter(
    prefix="/process",
    tags=["process"],
)

DATA_DIR = Path(settings.DATA_DIR)
if not DATA_DIR.is_absolute():
    DATA_DIR = Path(__file__).resolve().parents[4] / DATA_DIR


def _apply_corrections(verif: dict, email_id: str) -> None:
    record = get_review(email_id)
    if not record:
        return
    for correction in record.get("corrections", []):
        for comparison in verif.get("comparisons", []):
            if comparison["field"] != correction["field"]:
                continue
            side = correction["document"]
            comparison[f"{side}_raw"] = correction["value"]
            comparison[f"{side}_normalized"] = normalize_document_fields(
                {correction["field"]: correction["value"]}
            )[correction["field"]]
            comparison["matches"] = (
                comparison["si_normalized"] is not None
                and comparison["si_normalized"] == comparison["bl_normalized"]
            )

    if not verif.get("comparisons"):
        return

    mismatches = [c["field"] for c in verif["comparisons"] if not c["matches"]]
    missing = any(
        c["si_normalized"] is None or c["bl_normalized"] is None
        for c in verif.get("comparisons", [])
    )
    if missing:
        verif.update(status="NEEDS_REVIEW", review_reason="missing_value", has_defect=False, defect_fields=[])
    elif mismatches:
        verif.update(status="MISMATCH", review_reason=None, has_defect=True, defect_fields=sorted(mismatches))
    else:
        verif.update(status="OK", review_reason=None, has_defect=False, defect_fields=[])


@router.post("", response_model=ProcessedEmail)
def process_email_payload(
    email: EmailInput,
    count_attempt: bool = False,
    persist_review: bool = False,
):
    """Processes an arbitrary email payload sent in the request body."""
    email_dict = email.model_dump(by_alias=True)
    classification = classify_email(email_dict)
    if count_attempt:
        increment_attempt(email.email_id)
    verif = verify_email_record(email_dict, classification.category, str(DATA_DIR))
    if classification.is_uncertain:
        verif.update(
            status="NEEDS_REVIEW",
            review_reason="uncertain_extraction",
            review_details=classification.uncertainty_reason or "Classification or extraction confidence is uncertain",
            defect_fields=[],
            has_defect=False,
            evidence=email.attachments,
            retryable=False,
        )
    _apply_corrections(verif, email.email_id)

    if persist_review and verif.get("status") == "NEEDS_REVIEW":
        save_review(
            email.email_id,
            status="needs_review",
            reason=verif.get("review_reason"),
            details=verif.get("review_details") or verif.get("review_reason"),
            evidence=verif.get("evidence", []),
        )

    comparisons = [
        FieldComparison(
            field=c["field"],
            si_value=c["si_raw"],
            bl_value=c["bl_raw"],
            si_normalized=c["si_normalized"],
            bl_normalized=c["bl_normalized"],
            matches=c["matches"],
            reason=c.get("reason"),
            si_source=c.get("si_source"),
            bl_source=c.get("bl_source"),
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
        review_details=verif.get("review_details") or verif.get("review_reason"),
        retryable=verif.get("retryable", False),
    )

    return ProcessedEmail(
        email_id=email.email_id,
        classification=classification,
        verification=verification_result,
    )

@router.get("/processed", response_model=list[ProcessedEmail])
def list_processed_emails():
    processed = []

    for email in get_emails():
        email_input = EmailInput.model_validate(email)
        processed.append(process_email_payload(email_input))

    return processed

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


def _load_email_by_id(email_id: str) -> EmailInput:
    email_path = DATA_DIR / "inbox" / f"{email_id}.json"
    if not email_path.exists():
        raise HTTPException(status_code=404, detail=f"Email {email_id} not found")
    raw_email = json.loads(email_path.read_text(encoding="utf-8"))
    return EmailInput(
        email_id=raw_email["email_id"],
        sender=raw_email.get("from", ""),
        subject=raw_email.get("subject", ""),
        body=raw_email.get("body", ""),
        attachments=raw_email.get("attachments", []),
    )


@router.post("/{email_id}/retry", response_model=ProcessedEmail)
def retry_email(email_id: str):
    return process_email_payload(
        _load_email_by_id(email_id),
        count_attempt=True,
        persist_review=True,
    )


@router.get("/reviews/{email_id}", response_model=ReviewRecord)
def get_review_record(email_id: str):
    record = get_review(email_id)
    if not record:
        raise HTTPException(status_code=404, detail="Review record not found")
    return record


@router.post("/reviews/{email_id}", response_model=ProcessedEmail)
def submit_review_correction(email_id: str, update: ReviewUpdate):
    email = _load_email_by_id(email_id)
    current = process_email_payload(email)
    old_value = next(
        (
            getattr(comparison, f"{update.document}_value")
            for comparison in current.verification.field_comparisons
            if comparison.field == update.field
        ),
        None,
    )
    add_correction(email_id, update.model_dump(), old_value=old_value)
    return process_email_payload(email, persist_review=True)

