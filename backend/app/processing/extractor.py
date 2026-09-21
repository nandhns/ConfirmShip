import re

from app.models.schemas import (
    CANONICAL_FIELDS,
    ExtractedDocument,
    ExtractedField,
)
from app.processing.normalizer import (
    normalize_container_count,
    normalize_port,
    normalize_text,
    normalize_weight_kg,
)


FIELD_LABELS = {
    "shipper": [
        "shipper",
        "shipper/exporter",
        "exporter",
    ],
    "consignee": [
        "consignee",
        "consigned to",
    ],
    "notify_party": [
        "notify party",
        "notify",
    ],
    "port_of_loading": [
        "port of loading",
        "load port",
        "pol",
    ],
    "port_of_discharge": [
        "port of discharge",
        "discharge port",
        "pod",
    ],
    "container_count": [
        "container count",
        "no. of containers or packages",
        "number of containers",
    ],
    "gross_weight_kg": [
        "gross weight",
        "gross wt",
    ],
}


def detect_document_type(text: str) -> str:
    upper_text = text.upper()

    if "SHIPPING INSTRUCTION" in upper_text:
        return "SI"

    if "BILL OF LADING" in upper_text:
        return "BL"

    if "COMMERCIAL INVOICE" in upper_text:
        return "WRONG_DOCUMENT"

    if "PACKING LIST" in upper_text:
        return "WRONG_DOCUMENT"

    if "CERTIFICATE OF ORIGIN" in upper_text:
        return "WRONG_DOCUMENT"

    return "UNKNOWN"


def _extract_raw_value(text: str, labels: list[str]) -> str | None:
    for line in text.splitlines():
        cleaned_line = line.strip()
        lower_line = cleaned_line.lower()

        for label in labels:
            if lower_line.startswith(f"{label}:"):
                return cleaned_line.split(":", 1)[1].strip()

            if lower_line.startswith(f"{label} -"):
                return cleaned_line.split("-", 1)[1].strip()

    return None


def _normalize_field(field_name: str, value: str | None):
    if field_name in {"port_of_loading", "port_of_discharge"}:
        return normalize_port(value)

    if field_name == "container_count":
        return normalize_container_count(value)

    if field_name == "gross_weight_kg":
        return normalize_weight_kg(value)

    return normalize_text(value)


def extract_document(
    email_id: str,
    source_path: str,
    text: str,
) -> ExtractedDocument:
    document_type = detect_document_type(text)
    fields = {}
    missing_fields = []

    for field_name in CANONICAL_FIELDS:
        raw_value = _extract_raw_value(
            text,
            FIELD_LABELS[field_name],
        )

        normalized_value = _normalize_field(field_name, raw_value)

        if normalized_value is None:
            missing_fields.append(field_name)
            confidence = 0.0
        else:
            confidence = 0.95

        fields[field_name] = ExtractedField(
            value=raw_value,
            normalized_value=normalized_value,
            confidence=confidence,
        )

    readable = bool(text.strip())

    return ExtractedDocument(
        email_id=email_id,
        document_type=document_type,
        source_path=source_path,
        readable=readable,
        fields=fields,
        missing_fields=missing_fields,
        extraction_method="text",
        error=None if readable else "Attachment contains no readable text",
    )