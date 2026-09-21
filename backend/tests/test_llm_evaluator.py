from app.processing.llm_evaluator import evaluate_llm_extraction


def test_evaluate_perfect_match():
    pred = {
        "shipper": "APRIL FAR EAST",
        "container_count": 2,
        "gross_weight_kg": 21577.0,
    }
    truth = {
        "shipper": "APRIL FAR EAST",
        "container_count": 2,
        "gross_weight_kg": 21577.0,
    }
    result = evaluate_llm_extraction(pred, truth)
    assert result["accuracy"] == 1.0
    assert result["passed"] is True


def test_evaluate_detects_mismatch():
    pred = {
        "shipper": "WRONG SHIPPER",
        "container_count": 3,
    }
    truth = {
        "shipper": "APRIL FAR EAST",
        "container_count": 3,
    }
    result = evaluate_llm_extraction(pred, truth)
    assert result["accuracy"] == 0.5
    assert result["passed"] is False
    assert result["field_breakdown"]["shipper"]["matched"] is False
    assert result["field_breakdown"]["container_count"]["matched"] is True
