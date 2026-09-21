import tempfile
from pathlib import Path
from app.processing.verifier import verify_email_record


def test_verify_non_bl_comparison_passes_ok():
    email = {"email_id": "email_010", "attachments": []}
    res = verify_email_record(email, category="INVOICE_QUERY")
    assert res["status"] == "OK"
    assert res["has_defect"] is False
    assert res["defect_fields"] == []


def test_verify_missing_attachments_needs_review():
    email = {
        "email_id": "email_506",
        "body": "Please compare the SI and draft BL (the draft BL is still missing).",
        "attachments": ["only_one_attachment.txt"],
    }
    res = verify_email_record(email, category="BL_COMPARISON")
    assert res["status"] == "NEEDS_REVIEW"
    assert res["review_reason"] == "missing_attachment"


def test_verify_detects_mismatched_container_count():
    si_text = """SHIPPING INSTRUCTION
Shipper: APRIL FAR EAST
Consignee: MOORIM SP CO., LTD
Notify: UAB NOVAKOPA
Port of Loading: PORT KLANG
Port of Discharge: CALLAO
No. of Containers: 3 x 40'HC
Gross Weight: 22,000 KG
"""
    bl_text = """BILL OF LADING (DRAFT)
Shipper: APRIL FAR EAST
Consignee: MOORIM SP CO., LTD
Notify: UAB NOVAKOPA
Port of Loading: PORT KLANG
Port of Discharge: CALLAO
Container Count: 4 x 40'HC
Gross Weight (KG): 22,000 KG
"""
    with tempfile.TemporaryDirectory() as tmpdir:
        si_file = Path(tmpdir) / "SI.txt"
        bl_file = Path(tmpdir) / "BL.txt"
        si_file.write_text(si_text, encoding="utf-8")
        bl_file.write_text(bl_text, encoding="utf-8")

        email = {
            "email_id": "email_002",
            "attachments": ["SI.txt", "BL.txt"],
        }
        res = verify_email_record(email, category="BL_COMPARISON", data_dir=tmpdir)
        assert res["status"] == "MISMATCH"
        assert res["has_defect"] is True
        assert res["defect_fields"] == ["container_count"]


def test_verify_perfect_match_status_ok():
    si_text = """SHIPPING INSTRUCTION
Shipper: APRIL FAR EAST
Consignee: MOORIM SP CO., LTD
Notify: UAB NOVAKOPA
Port of Loading: PORT KLANG
Port of Discharge: CALLAO
No. of Containers: 2 x 40'HC
Gross Weight: 21,577 KG
"""
    bl_text = """BILL OF LADING (DRAFT)
Shipper: APRIL FAR EAST
Consignee: MOORIM SP CO., LTD
Notify: UAB NOVAKOPA
Port of Loading (POL): PORT KLANG (WESTPORT), MALAYSIA (MYPKG)
POD: CALLAO, PERU (PECLL)
Container Count: 2 x 40'HC
Gross Wt (kgs): 21,577 KG
"""
    with tempfile.TemporaryDirectory() as tmpdir:
        si_file = Path(tmpdir) / "SI.txt"
        bl_file = Path(tmpdir) / "BL.txt"
        si_file.write_text(si_text, encoding="utf-8")
        bl_file.write_text(bl_text, encoding="utf-8")

        email = {
            "email_id": "email_001",
            "attachments": ["SI.txt", "BL.txt"],
        }
        res = verify_email_record(email, category="BL_COMPARISON", data_dir=tmpdir)
        assert res["status"] == "OK"
        assert res["has_defect"] is False
        assert res["defect_fields"] == []
