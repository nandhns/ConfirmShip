"""Small durable store for human review decisions and processing attempts."""
import json
from threading import RLock
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import settings


_store_lock = RLock()


def _store_path() -> Path:
    path = Path(settings.REVIEW_STORE_PATH)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[2] / path
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _read() -> dict[str, dict[str, Any]]:
    with _store_lock:
        path = _store_path()
        if not path.exists():
            return {}
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {}


def _write(records: dict[str, dict[str, Any]]) -> None:
    with _store_lock:
        path = _store_path()
        temporary = path.with_suffix(f".{__import__('os').getpid()}.tmp")
        temporary.write_text(json.dumps(records, indent=2), encoding="utf-8")
        temporary.replace(path)


def get_review(email_id: str) -> dict[str, Any] | None:
    return _read().get(email_id)


def save_review(email_id: str, **values: Any) -> dict[str, Any]:
    with _store_lock:
        records = _read()
        current = records.get(email_id, {"email_id": email_id, "corrections": [], "attempts": 0})
        current.update(values, updated_at=datetime.now(timezone.utc).isoformat())
        records[email_id] = current
        _write(records)
        return current


def add_correction(
    email_id: str,
    correction: dict[str, Any],
    old_value: str | None = None,
) -> dict[str, Any]:
    current = get_review(email_id) or {"email_id": email_id, "corrections": [], "attempts": 0}
    corrections = [item for item in current.get("corrections", [])
                   if not (item["field"] == correction["field"] and item["document"] == correction["document"])]
    corrections.append(correction)
    audit_log = list(current.get("audit_log", []))
    audit_log.append({
        "action": "correction",
        "field": correction["field"],
        "document": correction["document"],
        "old_value": old_value,
        "new_value": correction["value"],
        "reviewer": correction.get("reviewer", "human-reviewer"),
        "comment": correction.get("comment"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return save_review(email_id, corrections=corrections, audit_log=audit_log, status="corrected")


def increment_attempt(email_id: str) -> int:
    current = get_review(email_id) or {"email_id": email_id, "corrections": [], "attempts": 0}
    attempts = int(current.get("attempts", 0)) + 1
    save_review(email_id, attempts=attempts)
    return attempts