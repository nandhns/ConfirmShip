from app.core.config import settings
from app.services.review_store import add_correction, get_review, increment_attempt


def test_review_store_persists_corrections_and_attempts(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "REVIEW_STORE_PATH", str(tmp_path / "reviews.json"))

    assert increment_attempt("email_test") == 1
    record = add_correction(
        "email_test",
        {"field": "consignee", "document": "bl", "value": "Correct consignee"},
    )

    assert record["attempts"] == 1
    assert record["corrections"][0]["value"] == "Correct consignee"
    assert get_review("email_test")["status"] == "corrected"