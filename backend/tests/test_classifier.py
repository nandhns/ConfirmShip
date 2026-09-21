from app.processing.classifier import classify_email


def test_classify_standard_bl_comparison():
    email = {
        "email_id": "email_001",
        "subject": "TO CONFIRM DOCS _ 5RSG-00133 _ CALLAO_PERU _ MOORIM SP CO.",
        "body": "Attached are the SI and draft BL. Please check.",
        "attachments": ["SI.txt", "BL.txt"],
    }
    res = classify_email(email)
    assert res.category == "BL_COMPARISON"
    assert res.confidence >= 0.90


def test_classify_coded_carrier_subject():
    """Tests realistic desk prefix and carrier code without explicit 'confirm' keyword."""
    email = {
        "email_id": "email_002",
        "subject": "AIE - JEBEL ALI - MSC(MEDUUD104332) - 5RSG-00133 - INV - CUSTOMER - OA",
        "body": "Please find the draft documents attached.",
        "attachments": ["SI.pdf", "BL.pdf"],
    }
    res = classify_email(email)
    assert res.category == "BL_COMPARISON"


def test_classify_si_request():
    email = {
        "email_id": "email_003",
        "subject": "SI NEEDED_ 5RSG-00133 _ SAFQA LIMITED _ PO_25_2145",
        "body": "Kindly share customer SI at the earliest.",
        "attachments": [],
    }
    res = classify_email(email)
    assert res.category == "SI_REQUEST"


def test_classify_invoice_query():
    email = {
        "email_id": "email_004",
        "subject": "REQUEST TO CANCEL INVOICE - INV-9812 - SAFQA LIMITED",
        "body": "Please revise the local charges and demurrage fees.",
        "attachments": [],
    }
    res = classify_email(email)
    assert res.category == "INVOICE_QUERY"


def test_classify_spam():
    email = {
        "email_id": "email_005",
        "subject": "Congratulations! You have WON a $1,000 Gift Card - CLAIM NOW",
        "body": "Click here to claim your reward before it expires.",
        "attachments": [],
    }
    res = classify_email(email)
    assert res.category == "SPAM"


def test_classify_general():
    email = {
        "email_id": "email_006",
        "subject": "daily Berthing Report - 15 JAN 2026",
        "body": "Please see below the vessel berthing status update for today.",
        "attachments": [],
    }
    res = classify_email(email)
    assert res.category == "GENERAL"
