import re

from app.models.schemas import ClassificationResult, EmailInput


def _contains_any(text: str, phrases: list[str]) -> bool:
    return any(phrase in text for phrase in phrases)


def classify_email(email: dict) -> ClassificationResult:
    subject = email.get("subject", "")
    body = email.get("body", "")
    attachments = email.get("attachments", [])

    text = f"{subject}\n{body}".lower()
    subject_lower = subject.lower()
    email_id = email["email_id"]

    if _contains_any(
        text,
        [
            "unsubscribe",
            "winner",
            "promotion",
            "click here",
            "limited offer",
            "verify your account",
        ],
    ):
        category = "SPAM"
        reason = "Marketing or phishing-style language detected"
        confidence = 0.95

    elif _contains_any(
        text,
        [
            "invoice",
            "billing",
            "local charges",
            "freight charges",
            "d & d charges",
            "demurrage",
        ],
    ):
        category = "INVOICE_QUERY"
        reason = "Invoice or charges language detected"
        confidence = 0.92

    elif _contains_any(
        text,
        [
            "request si",
            "si needed",
            "cust si",
            "latest si",
            "shipping instruction needed",
        ],
    ):
        category = "SI_REQUEST"
        reason = "Shipping Instruction request detected"
        confidence = 0.92

    elif _contains_any(
        text,
        [
            "confirm docs",
            "check the details",
            "draft bl",
            "bill of lading",
            "compare si",
            "attached are the si",
        ],
    ):
        category = "BL_COMPARISON"
        reason = "SI and draft Bill of Lading checking request detected"
        confidence = 0.95 if attachments else 0.82

    else:
        category = "GENERAL"
        reason = "No stronger category signal detected"
        confidence = 0.70

    is_uncertain = confidence < 0.75

    return ClassificationResult(
        email_id=email_id,
        category=category,
        confidence=confidence,
        reason=reason,
        is_uncertain=is_uncertain,
        uncertainty_reason=(
            "ambiguous_email_intent" if is_uncertain else None
        ),
    )