"""Normalizer for shipping document fields."""
import re
from typing import Any

BLANK_TOKENS = {"???", "_______", "tba", "tbc", "n/a", "____mt", "____", "none"}


def is_blank_value(val: Any) -> bool:
    if val is None:
        return True
    s = str(val).strip().lower()
    return s in BLANK_TOKENS or s == ""


def normalize_text(val: Any) -> str | None:
    if is_blank_value(val):
        return None
    val_str = str(val).strip()
    return re.sub(r"\s+", " ", val_str)


def normalize_port(val: Any) -> str | None:
    text = normalize_text(val)
    if not text:
        return None
    # Remove UN/LOCODE in parentheses e.g. "(MYPKG)" or "(PECLL)"
    clean = re.sub(r"\([A-Z0-9]+\)", "", text)
    # Take the primary port name before any comma (e.g. "PORT KLANG, MALAYSIA" -> "PORT KLANG")
    return clean.split(",")[0].strip().upper()


def normalize_container_count(val: Any) -> int | None:
    text = normalize_text(val)
    if not text:
        return None
    # Matches first integer: e.g. "1 x 40'HC" -> 1, "4 containers" -> 4
    m = re.search(r"(\d+)", text)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            return None
    return None


def normalize_weight_kg(val: Any) -> float | None:
    text = normalize_text(val)
    if not text:
        return None
    # Strip commas e.g. "21,577 KG" -> "21577"
    cleaned = text.replace(",", "")
    m = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            return None
    return None


def normalize_document_fields(raw_fields: dict[str, Any]) -> dict[str, Any]:
    """Normalizes all 7 fields for an extracted document."""
    normalized = {}
    for field, item in raw_fields.items():
        val = item.value if hasattr(item, "value") else item

        if field in {"port_of_loading", "port_of_discharge"}:
            normalized[field] = normalize_port(val)
        elif field == "container_count":
            normalized[field] = normalize_container_count(val)
        elif field == "gross_weight_kg":
            normalized[field] = normalize_weight_kg(val)
        else:
            normalized[field] = normalize_text(val)

    return normalized
