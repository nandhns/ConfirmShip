from app.processing.classifier import classify_email


def test_classifies_document_check_request():
    email = {
        "email_id": "email_001",
        "from": "sender@example.com",
        "subject": "TO CONFIRM DOCS",
        "body": "Attached are the SI and draft BL. Please check.",
        "attachments": [
            "attachments/email_001_SI.txt",
            "attachments/email_001_BL.txt",
        ],
    }

    result = classify_email(email)

    assert result.category == "BL_COMPARISON"
    assert result.is_uncertain is False