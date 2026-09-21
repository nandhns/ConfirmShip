import json

from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings


client = TestClient(app)


def _document(title: str, container_count: str) -> str:
    return f"""{title}
Shipper: APRIL FAR EAST
Consignee: MOORIM SP CO., LTD
Notify: UAB NOVAKOPA
Port of Loading: PORT KLANG
Port of Discharge: CALLAO
Container Count: {container_count}
Gross Weight (KG): 21,577 KG
"""


def test_correction_updates_report_and_review_store(tmp_path, monkeypatch):
    monkeypatch.setattr("app.api.routes.process.DATA_DIR", tmp_path)
    monkeypatch.setattr(settings, "REVIEW_STORE_PATH", str(tmp_path / "reviews.json"))
    (tmp_path / "inbox").mkdir()
    (tmp_path / "SI.txt").write_text(_document("SHIPPING INSTRUCTION", "2 x 40'HC"), encoding="utf-8")
    (tmp_path / "BL.txt").write_text(_document("BILL OF LADING", "3 x 40'HC"), encoding="utf-8")
    email = {
        "email_id": "email_correction",
        "from": "ops@example.com",
        "subject": "TO CONFIRM DOCS",
        "body": "Please check the attached SI and draft BL.",
        "attachments": ["SI.txt", "BL.txt"],
    }
    (tmp_path / "inbox" / "email_correction.json").write_text(json.dumps(email), encoding="utf-8")

    response = client.post("/api/process", json=email)
    assert response.status_code == 200
    assert response.json()["verification"]["status"] == "mismatch"

    corrected = client.post(
        "/api/process/reviews/email_correction",
        json={"field": "container_count", "document": "bl", "value": "2 x 40'HC"},
    )
    assert corrected.status_code == 200
    assert corrected.json()["verification"]["status"] == "no_mismatch"

    record = client.get("/api/process/reviews/email_correction")
    assert record.status_code == 200
    assert record.json()["corrections"][0]["value"] == "2 x 40'HC"


def test_retry_surfaces_processing_failure(tmp_path, monkeypatch):
    monkeypatch.setattr("app.api.routes.process.DATA_DIR", tmp_path)
    monkeypatch.setattr(settings, "REVIEW_STORE_PATH", str(tmp_path / "reviews.json"))
    (tmp_path / "inbox").mkdir()
    email = {
        "email_id": "email_retry",
        "from": "ops@example.com",
        "subject": "TO CONFIRM DOCS",
        "body": "Please check the attached SI and draft BL.",
        "attachments": ["broken.pdf", "missing.txt"],
    }
    (tmp_path / "inbox" / "email_retry.json").write_text(json.dumps(email), encoding="utf-8")
    (tmp_path / "broken.pdf").write_bytes(b"not a pdf")

    response = client.post("/api/process/email_retry/retry")
    assert response.status_code == 200
    result = response.json()["verification"]
    assert result["status"] == "needs_review"
    assert result["review_reason"] == "processing_failed"
    assert result["retryable"] is True