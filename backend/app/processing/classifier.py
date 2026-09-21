"""Classifier engine for incoming shipping operations emails."""
from app.models.schemas import ClassificationResult

CARRIERS = ["MSC", "CMA", "HLCUSIN", "OOLU", "EGLV", "SINF", "YMJAI", "SIN", "MCLSIN"]
DEPTS = ["AIE", "AFPTME", "AFRT", "AFEMY"]

SPAM_KEYWORDS = [
    "unsubscribe", "winner", "promotion", "click here", "limited offer",
    "verify your account", "gift card", "parcel is on hold", "weird trick",
    "hot singles", "undelivered messages", "avoid suspension"
]

INVOICE_KEYWORDS = [
    "invoice", "billing", "local charges", "freight charges", "d & d charges",
    "demurrage", "cancel invoice", "missing gr", "telex release charges", "total freight"
]

SI_REQUEST_KEYWORDS = [
    "request si", "si needed", "cust si", "latest si", "shipping instruction needed",
    "submit si & aed"
]

BL_COMPARISON_KEYWORDS = [
    "to confirm docs", "confirm docs", "check the details", "draft bl",
    "bill of lading", "compare si", "attached are the si", "request bl draft",
    "amend bl"
]


def classify_email(email: dict) -> ClassificationResult:
    subject = email.get("subject", "")
    body = email.get("body", "")
    email_id = email.get("email_id", "")

    text_lower = f"{subject}\n{body}".lower()
    subject_upper = subject.upper()

    # 1. Spam filter
    if any(k in text_lower for k in SPAM_KEYWORDS):
        return ClassificationResult(
            email_id=email_id, category="SPAM", confidence=0.98,
            reason="Phishing/Spam indicators detected"
        )

    # 2. Invoice queries
    if any(k in text_lower for k in INVOICE_KEYWORDS):
        return ClassificationResult(
            email_id=email_id, category="INVOICE_QUERY", confidence=0.95,
            reason="Charges / Invoice query detected"
        )

    # 3. SI requests
    if any(k in text_lower for k in SI_REQUEST_KEYWORDS) or subject_upper.startswith("SI - "):
        return ClassificationResult(
            email_id=email_id, category="SI_REQUEST", confidence=0.95,
            reason="Shipping Instruction request detected"
        )

    # 4. BL comparison: Use bounded token matching to prevent false carrier triggers (e.g., SINGAPORE triggering SIN)
    subject_tokens = {
        token.strip(".,:;[]_")
        for token in subject_upper.replace("-", " ").replace("(", " ").replace(")", " ").replace("/", " ").split()
    }
    has_carrier = any(code in subject_tokens for code in CARRIERS)
    is_coded_subject = any(dept in subject_tokens for dept in DEPTS) and has_carrier

    if any(k in text_lower for k in BL_COMPARISON_KEYWORDS) or is_coded_subject:
        return ClassificationResult(
            email_id=email_id, category="BL_COMPARISON", confidence=0.98,
            reason="BL document verification requested"
        )

    # 5. General fallback
    return ClassificationResult(
        email_id=email_id, category="GENERAL", confidence=0.85,
        reason="Operational update or general correspondence"
    )
