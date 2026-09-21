"""Classifier engine for incoming shipping operations emails."""
from app.models.schemas import ClassificationResult

CARRIERS = ["MSC", "CMA", "HLCUSIN", "OOLU", "EGLV", "SINF", "YMJAI", "SIN", "MCLSIN"]
DEPTS = ["AIE", "AFPTME", "AFRT", "AFEMY"]

SPAM_KEYWORDS = [
    "unsubscribe", "winner", "promotion", "click here", "limited offer",
    "limited time offer", "verify your account", "verify account immediately",
    "gift card", "parcel is on hold", "weird trick", "hot singles",
    "undelivered messages", "avoid suspension", "bitcoin", "guaranteed",
    "exclusive offer", "90% off", "customs fee", "confirm your bank details",
    "invoice payment - kindly confirm",
]

INVOICE_KEYWORDS = [
    "invoice", "billing", "local charges", "freight charges", "d & d charges",
    "demurrage", "cancel invoice", "missing gr", "telex release charges", "total freight"
]

SI_REQUEST_BODY_KEYWORDS = [
    "request si", "si needed", "cust si", "latest si", "shipping instruction needed",
    "please find shipping instruction",
]

SI_REQUEST_SUBJECT_MARKERS = [
    "REQUEST SI", "SI NEEDED", "CUST SI", "LATEST SI", "SHIPPING INSTRUCTION NEEDED",
]

GENERAL_OPERATIONAL_MARKERS = [
    "billing process completed", "no action required", "rpa bot",
    "daily berthing report", "berthing report attached",
]

BL_COMPARISON_KEYWORDS = [
    "to confirm docs", "confirm docs", "check the details", "draft bl",
    "bill of lading", "compare si", "attached are the si", "request bl draft",
    "amend bl"
]


def _subject_indicates_si_request(subject: str) -> bool:
    subject_upper = subject.upper().replace("_", " ")
    if " SI - " in f" {subject_upper} " or subject_upper.startswith("SI -"):
        return True
    return any(marker in subject_upper for marker in SI_REQUEST_SUBJECT_MARKERS)


def _is_general_operational_update(text_lower: str) -> bool:
    return any(marker in text_lower for marker in GENERAL_OPERATIONAL_MARKERS)


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

    # 2. SI requests (before invoice — SI bodies often mention billing/charges)
    si_from_subject = _subject_indicates_si_request(subject)
    si_from_body = any(k in text_lower for k in SI_REQUEST_BODY_KEYWORDS)
    if si_from_subject or si_from_body:
        return ClassificationResult(
            email_id=email_id, category="SI_REQUEST", confidence=0.95,
            reason="Shipping Instruction request detected"
        )

    # 3. BL comparison (before invoice — BL threads often mention commercial invoices)
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

    # 4. Invoice queries
    if any(k in text_lower for k in INVOICE_KEYWORDS) and not _is_general_operational_update(text_lower):
        return ClassificationResult(
            email_id=email_id, category="INVOICE_QUERY", confidence=0.95,
            reason="Charges / Invoice query detected"
        )

    # 5. General fallback
    return ClassificationResult(
        email_id=email_id, category="GENERAL", confidence=0.85,
        reason="Operational update or general correspondence"
    )
