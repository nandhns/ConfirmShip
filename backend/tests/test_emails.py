from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


SAMPLE_EMAIL = {
    "email_id": "email_001",
    "from": "aziztz@safqa.co.ke",
    "subject": "TO CONFIRM DOCS",
    "body": "Attached are the SI and draft BL. Please check and confirm.",
    "attachments": [
        "attachments/email_001_SI.txt",
        "attachments/email_001_BL.txt",
    ],
}


def test_list_emails(monkeypatch):
    def mock_get_emails():
        return [SAMPLE_EMAIL]

    monkeypatch.setattr(
        "app.api.routes.emails.get_emails",
        mock_get_emails,
    )

    response = client.get("/api/emails")

    assert response.status_code == 200
    assert response.json() == [SAMPLE_EMAIL]


def test_get_email(monkeypatch):
    def mock_get_email(email_id: str):
        return SAMPLE_EMAIL

    monkeypatch.setattr(
        "app.api.routes.emails.get_email",
        mock_get_email,
    )

    response = client.get("/api/emails/email_001")

    assert response.status_code == 200
    assert response.json() == SAMPLE_EMAIL