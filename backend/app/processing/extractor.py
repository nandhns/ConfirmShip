"""Extractor for canonical fields from parsed documents."""
from pathlib import Path
from app.models.schemas import (
    CANONICAL_FIELDS,
    ExtractedDocument,
    ExtractedField,
)
from app.processing.readers import read_attachment

BLANK_TOKENS = {"???", "_______", "tba", "tbc", "n/a", "____mt", "____", "none"}

FIELD_LABELS = {
    "shipper": ["shipper", "shipper/exporter", "shipper (principal or seller)", "exporter"],
    "consignee": ["consignee", "consignee (non-negotiable)", "to the order of", "consigned to"],
    "notify_party": ["notify party", "notify", "notify party/intermediate consignee"],
    "port_of_loading": ["port of loading", "port of loading (pol)", "load port", "pol"],
    "port_of_discharge": ["port of discharge", "port of discharge (pod)", "discharge port", "pod"],
    "container_count": ["no. of containers", "total containers", "no. of containers or packages", "container count"],
    "gross_weight_kg": ["gross weight (kg)", "gross wt (kgs)", "gross weight毛重(kgs)", "gross weight", "gross wt"],
}

WRONG_DOC_STRINGS = [
    "COMMERCIAL INVOICE",
    "PACKING LIST",
    "CERTIFICATE OF ORIGIN",
    "THIS IS A COMMERCIAL INVOICE",
    "PACKING LIST ONLY",
    "NOT AN SI OR BL"
]


def detect_document_type(text: str) -> str:
    upper = text.upper()
    if any(m in upper for m in WRONG_DOC_STRINGS):
        return "WRONG_DOCUMENT"
    if "SHIPPING INSTRUCTION" in upper:
        return "SI"
    if "BILL OF LADING" in upper:
        return "BL"
    return "UNKNOWN"


def _is_blank(val: str | None) -> bool:
    if val is None:
        return True
    s = val.strip().lower()
    return s in BLANK_TOKENS or s == ""


def _extract_raw_value(text: str, labels: list[str]) -> tuple[str | None, bool]:
    for line in text.splitlines():
        cleaned = line.strip()
        lower = cleaned.lower()
        for label in labels:
            prefix_colon = f"{label}:"
            prefix_dash = f"{label} -"
            prefix_sep = f"{label} :"
            val = None
            if lower.startswith(prefix_colon):
                val = cleaned[len(prefix_colon):].strip()
            elif lower.startswith(prefix_dash):
                val = cleaned[len(prefix_dash):].strip()
            elif lower.startswith(prefix_sep):
                val = cleaned[len(prefix_sep):].strip()

            if val is not None:
                return (None, True) if _is_blank(val) else (val, False)
    return None, False


def extract_document_from_file(
    email_id: str,
    file_path: str | Path,
    use_llm_fallback: bool = True
) -> tuple[ExtractedDocument | None, str | None]:
    text, read_err = read_attachment(file_path)
    if read_err:
        return None, read_err

    doc_type = detect_document_type(text)
    if doc_type == "WRONG_DOCUMENT":
        return None, "wrong_doc_type"

    fields = {}
    missing_fields = []
    has_blank_flag = False

    # 1. Rule-based extraction
    for field_name in CANONICAL_FIELDS:
        raw_val, is_blank_val = _extract_raw_value(text, FIELD_LABELS[field_name])
        if is_blank_val:
            has_blank_flag = True

        if raw_val is None:
            missing_fields.append(field_name)

        fields[field_name] = ExtractedField(
            value=raw_val,
            normalized_value=raw_val,  # Normalization will be performed downstream by Role 2
            confidence=0.95 if raw_val is not None else 0.0,
        )

    # 2. Invoke structured LLM fallback if fields are missing and no blank placeholders
    if missing_fields and not has_blank_flag and use_llm_fallback:
        try:
            from app.processing.llm_extractor import extract_fields_with_llm
            llm_res = extract_fields_with_llm(text)
            for f in list(missing_fields):
                val = getattr(llm_res, f, None)
                if val is not None:
                    fields[f] = ExtractedField(
                        value=str(val),
                        normalized_value=str(val),
                        confidence=0.85
                    )
                    missing_fields.remove(f)
        except Exception:
            pass

    if has_blank_flag:
        return None, "missing_value"

    doc = ExtractedDocument(
        email_id=email_id,
        document_type=doc_type,
        source_path=str(file_path),
        readable=True,
        fields=fields,
        missing_fields=missing_fields,
        extraction_method="text_rules_with_llm_fallback",
    )
    return doc, None
