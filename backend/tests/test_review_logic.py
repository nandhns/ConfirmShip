from review import (
    FieldComparison,
    ReviewStatus,
    decide_review,
)


def test_all_confident_matching_fields_pass():
    comparisons = [
        FieldComparison(
            field_name="container_number",
            si_value="MSKU1234567",
            bl_value="MSKU1234567",
            match=True,
            confidence=0.95,
        ),
    ]

    decision = decide_review(comparisons)

    assert decision.status == ReviewStatus.PASS
    assert decision.reasons == []


def test_low_confidence_needs_review():
    comparisons = [
        FieldComparison(
            field_name="vessel_name",
            si_value="Evergreen",
            bl_value="Evergreen",
            match=True,
            confidence=0.60,
        ),
    ]

    decision = decide_review(comparisons)

    assert decision.status == ReviewStatus.NEEDS_REVIEW
    assert "Low confidence on vessel_name (0.60)" in decision.reasons


def test_non_critical_mismatch_needs_review():
    comparisons = [
        FieldComparison(
            field_name="vessel_name",
            si_value="Evergreen",
            bl_value="Maersk",
            match=False,
            confidence=0.95,
        ),
    ]

    decision = decide_review(comparisons)

    assert decision.status == ReviewStatus.NEEDS_REVIEW
    assert "Field mismatch: vessel_name" in decision.reasons


def test_critical_mismatch_fails():
    comparisons = [
        FieldComparison(
            field_name="container_number",
            si_value="MSKU1234567",
            bl_value="TGHU7654321",
            match=False,
            confidence=0.95,
        ),
    ]

    decision = decide_review(comparisons)

    assert decision.status == ReviewStatus.FAIL
    assert "Critical field mismatch: container_number" in decision.reasons


def test_missing_critical_field_fails():
    comparisons = [
        FieldComparison(
            field_name="bl_number",
            si_value=None,
            bl_value="BL-2026-001",
            match=False,
            confidence=0.90,
        ),
    ]

    decision = decide_review(comparisons)

    assert decision.status == ReviewStatus.FAIL
    assert "Missing critical field: bl_number" in decision.reasons


def test_empty_comparisons_need_review():
    decision = decide_review([])

    assert decision.status == ReviewStatus.NEEDS_REVIEW
    assert decision.reasons == ["No fields were available for comparison"]