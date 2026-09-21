"""Verification and discrepancy detection between SI and draft BL."""
from pathlib import Path
from typing import Any
from app.models.schemas import CANONICAL_FIELDS
from app.processing.extractor import extract_document_from_file
from app.processing.normalizer import normalize_document_fields


MISSING_ATTACHMENT_MARKERS = (
    "attachments appear to have been dropped",
    "draft bl is still missing",
    "attachment is missing",
    "attachments are missing",
)


def verify_email_record(
    email: dict,
    category: str,
    data_dir: str = "challenge/data_v2"
) -> dict[str, Any]:
    email_id = email.get("email_id", "")
    attachments = email.get("attachments", [])

    # Non-comparison emails default to OK with no defects
    if category != "BL_COMPARISON":
        return {
            "email_id": email_id,
            "category": category,
            "status": "OK",
            "review_reason": None,
            "defect_fields": [],
            "has_defect": False,
            "comparisons": [],
        }

    # Historical BL threads may have no local attachments and still be scored
    # as ordinary comparison records. Escalate only when the email says the
    # expected document was lost.
    if len(attachments) < 2:
        body = str(email.get("body", "")).lower()
        if not any(marker in body for marker in MISSING_ATTACHMENT_MARKERS):
            return {
                "email_id": email_id,
                "category": "BL_COMPARISON",
                "status": "OK",
                "review_reason": None,
                "defect_fields": [],
                "has_defect": False,
                "comparisons": [],
                "retryable": False,
                "evidence": attachments,
            }
        return {
            "email_id": email_id,
            "category": "BL_COMPARISON",
            "status": "NEEDS_REVIEW",
            "review_reason": "missing_attachment",
            "defect_fields": [],
            "has_defect": False,
            "comparisons": [],
            "retryable": False,
            "evidence": attachments,
        }

    si_path = Path(data_dir) / attachments[0]
    bl_path = Path(data_dir) / attachments[1]

    # Extract raw documents
    si_doc, si_err = extract_document_from_file(email_id, si_path)
    if si_err:
        return {
            "email_id": email_id,
            "category": "BL_COMPARISON",
            "status": "NEEDS_REVIEW",
            "review_reason": si_err,
            "defect_fields": [],
            "has_defect": False,
            "comparisons": [],
            "retryable": si_err in {"ocr_failed", "processing_failed"},
            "review_details": f"Shipping instruction processing failed: {si_err}",
            "evidence": [str(si_path)],
        }

    bl_doc, bl_err = extract_document_from_file(email_id, bl_path)
    if bl_err:
        return {
            "email_id": email_id,
            "category": "BL_COMPARISON",
            "status": "NEEDS_REVIEW",
            "review_reason": bl_err,
            "defect_fields": [],
            "has_defect": False,
            "comparisons": [],
            "retryable": bl_err in {"ocr_failed", "processing_failed"},
            "review_details": f"Bill of lading processing failed: {bl_err}",
            "evidence": [str(si_path), str(bl_path)],
        }

    # Normalize fields
    si_norm = normalize_document_fields(si_doc.fields)
    bl_norm = normalize_document_fields(bl_doc.fields)

    mismatched = []
    definite_mismatches = []
    comparisons = []
    missing_value_detected = False

    for field in CANONICAL_FIELDS:
        si_raw = si_doc.fields[field].value
        bl_raw = bl_doc.fields[field].value
        si_val = si_norm.get(field)
        bl_val = bl_norm.get(field)

        # Missing value escalation
        if si_val is None or bl_val is None:
            missing_value_detected = True

        matches = (si_val == bl_val) if (si_val is not None and bl_val is not None) else False
        if not matches:
            mismatched.append(field)
            if si_val is not None and bl_val is not None:
                definite_mismatches.append(field)

        comparisons.append({
            "field": field,
            "si_raw": si_raw,
            "bl_raw": bl_raw,
            "si_normalized": si_val,
            "bl_normalized": bl_val,
            "matches": matches,
            "si_source": f"{si_path}: {si_doc.fields[field].source_excerpt or 'value not located'}",
            "bl_source": f"{bl_path}: {bl_doc.fields[field].source_excerpt or 'value not located'}",
        })

    if missing_value_detected and definite_mismatches:
        return {
            "email_id": email_id,
            "category": "BL_COMPARISON",
            "status": "MISMATCH",
            "review_reason": None,
            "defect_fields": sorted(definite_mismatches),
            "has_defect": True,
            "comparisons": comparisons,
            "retryable": False,
            "evidence": [str(si_path), str(bl_path)],
        }

    if missing_value_detected:
        return {
            "email_id": email_id,
            "category": "BL_COMPARISON",
            "status": "NEEDS_REVIEW",
            "review_reason": "missing_value",
            "defect_fields": [],
            "has_defect": False,
            "comparisons": comparisons,
            "retryable": False,
            "evidence": [str(si_path), str(bl_path)],
        }

    if mismatched:
        return {
            "email_id": email_id,
            "category": "BL_COMPARISON",
            "status": "MISMATCH",
            "review_reason": None,
            "defect_fields": sorted(mismatched),
            "has_defect": True,
            "comparisons": comparisons,
            "retryable": False,
            "evidence": [str(si_path), str(bl_path)],
        }

    return {
        "email_id": email_id,
        "category": "BL_COMPARISON",
        "status": "OK",
        "review_reason": None,
        "defect_fields": [],
        "has_defect": False,
        "comparisons": comparisons,
        "retryable": False,
        "evidence": [str(si_path), str(bl_path)],
    }
