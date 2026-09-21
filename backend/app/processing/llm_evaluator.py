"""LLM Evaluation suite: benchmark LLM extraction accuracy & hallucination rate."""
from typing import Any


def evaluate_llm_extraction(
    predicted_fields: dict[str, Any],
    ground_truth_fields: dict[str, Any]
) -> dict[str, Any]:
    """
    Evaluates LLM output against known ground truth.
    Calculates accuracy, handles numeric equality, and penalizes hallucinated/extra fields.
    """
    results = {}
    matched = 0

    all_keys = set(ground_truth_fields.keys()).union(predicted_fields.keys())

    for field in sorted(all_keys):
        expected_val = ground_truth_fields.get(field)
        pred_val = predicted_fields.get(field)

        # Handle numeric comparison (e.g. 2 vs 2.0)
        if isinstance(pred_val, (int, float)) and isinstance(expected_val, (int, float)):
            is_match = float(pred_val) == float(expected_val)
        elif expected_val is not None and pred_val is not None:
            is_match = str(pred_val).strip().lower() == str(expected_val).strip().lower()
        else:
            is_match = (expected_val is None and pred_val is None)

        if is_match and expected_val is not None:
            matched += 1

        results[field] = {
            "expected": expected_val,
            "predicted": pred_val,
            "matched": is_match,
            "is_hallucinated": (expected_val is None and pred_val is not None)
        }

    total_keys = len(all_keys)
    accuracy = matched / total_keys if total_keys > 0 else 0.0

    return {
        "accuracy": accuracy,
        "field_breakdown": results,
        "passed": accuracy >= 0.95
    }
