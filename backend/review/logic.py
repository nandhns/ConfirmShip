from dataclasses import dataclass, field
from enum import Enum


class ReviewStatus(str, Enum):
    PASS = "pass"
    NEEDS_REVIEW = "needs_review"
    FAIL = "fail"


@dataclass
class FieldComparison:
    field_name: str
    si_value: str | None
    bl_value: str | None
    match: bool
    confidence: float  # Extractor confidence: 0.0-1.0


@dataclass
class ReviewDecision:
    status: ReviewStatus
    reasons: list[str] = field(default_factory=list)


CONFIDENCE_THRESHOLD = 0.75
CRITICAL_FIELDS = {"container_number", "bl_number", "consignee"}


def is_missing(value: str | None) -> bool:
    """Treat None, empty strings, and whitespace-only strings as missing."""
    return value is None or not value.strip()


def decide_review(comparisons: list[FieldComparison]) -> ReviewDecision:
    """
    Decide whether document comparison can pass automatically,
    needs normal human review, or has a critical failure.

    FAIL means urgent human review is required; it should not be
    silently discarded or automatically finalized.
    """
    if not comparisons:
        return ReviewDecision(
            status=ReviewStatus.NEEDS_REVIEW,
            reasons=["No fields were available for comparison"],
        )

    reasons: list[str] = []
    has_critical_issue = False

    for comparison in comparisons:
        field_name = comparison.field_name
        invalid_confidence = not 0.0 <= comparison.confidence <= 1.0

        if invalid_confidence:
            reasons.append(
                f"Invalid confidence on {field_name} ({comparison.confidence})"
            )
        elif comparison.confidence < CONFIDENCE_THRESHOLD:
            reasons.append(
                f"Low confidence on {field_name} ({comparison.confidence:.2f})"
            )

        if field_name in CRITICAL_FIELDS and (
            is_missing(comparison.si_value) or is_missing(comparison.bl_value)
        ):
            has_critical_issue = True
            reasons.append(f"Missing critical field: {field_name}")
            continue

        if not comparison.match:
            if field_name in CRITICAL_FIELDS:
                has_critical_issue = True
                reasons.append(f"Critical field mismatch: {field_name}")
            else:
                reasons.append(f"Field mismatch: {field_name}")

    if has_critical_issue:
        return ReviewDecision(status=ReviewStatus.FAIL, reasons=reasons)
    if reasons:
        return ReviewDecision(status=ReviewStatus.NEEDS_REVIEW, reasons=reasons)
    return ReviewDecision(status=ReviewStatus.PASS, reasons=[])
