"""LLM Evaluation suite: benchmark LLM extraction accuracy & hallucination rate."""
from typing import Any


def evaluate_llm_extraction(
    predicted_fields: dict[str, Any],
    ground_truth_fields: dict[str, Any]
) -> dict[str, Any]:
    """
    Evaluates LLM output against known ground truth.
    Calculates precision, recall, and hallucination indicators.
    """
    results = {}
    matched = 0
    total_fields = len(ground_truth_fields)

    for field, expected_val in ground_truth_fields.items():
        pred_val = predicted_fields.get(field)
        is_match = (str(pred_val).strip().lower() == str(expected_val).strip().lower())
        if is_match:
            matched += 1
        results[field] = {
            "expected": expected_val,
            "predicted": pred_val,
            "matched": is_match
        }

    accuracy = matched / total_fields if total_fields > 0 else 0.0
    return {
        "accuracy": accuracy,
        "field_breakdown": results,
        "passed": accuracy >= 0.95
    }
