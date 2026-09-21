import tempfile
from app.processing.extractor import detect_document_type, extract_document_from_file


def test_detect_document_type():
    assert detect_document_type("SHIPPING INSTRUCTION\nShipper: ...") == "SI"
    assert detect_document_type("BILL OF LADING (DRAFT)\nShipper: ...") == "BL"
    assert detect_document_type("COMMERCIAL INVOICE\nInvoice No: ...") == "WRONG_DOCUMENT"
    assert detect_document_type("PACKING LIST\nCarton: ...") == "WRONG_DOCUMENT"


def test_extract_all_7_fields_cleanly():
    sample_si = """SHIPPING INSTRUCTION
========================================
Shipper/Exporter: APRIL FAR EAST (M) SDN BHD
CONSIGNEE: MOORIM SP CO., LTD
Notify: UAB NOVAKOPA
Port of Loading (POL): PORT KLANG (WESTPORT), MALAYSIA (MYPKG)
POD: CALLAO, PERU (PECLL)
Container Count: 2 x 40'HC
Gross Wt (kgs): 21,577 KG
"""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(sample_si)
        f_path = f.name

    doc, err = extract_document_from_file("email_001", f_path, use_llm_fallback=False)
    assert err is None
    assert doc is not None
    assert doc.fields["shipper"].value == "APRIL FAR EAST (M) SDN BHD"
    assert doc.fields["consignee"].value == "MOORIM SP CO., LTD"
    assert doc.fields["notify_party"].value == "UAB NOVAKOPA"
    assert doc.fields["port_of_loading"].value == "PORT KLANG (WESTPORT), MALAYSIA (MYPKG)"
    assert doc.fields["port_of_discharge"].value == "CALLAO, PERU (PECLL)"
    assert doc.fields["container_count"].value == "2 x 40'HC"
    assert doc.fields["gross_weight_kg"].value == "21,577 KG"


def test_extract_blank_field_flags_missing_value():
    sample_si_with_blanks = """SHIPPING INSTRUCTION
Shipper: APRIL FAR EAST
Consignee: ???
Notify: UAB NOVAKOPA
Port of Loading: PORT KLANG
Port of Discharge: CALLAO
No. of Containers: _______
Gross Weight: 21,577 KG
"""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(sample_si_with_blanks)
        f_path = f.name

    doc, err = extract_document_from_file("email_516", f_path, use_llm_fallback=False)
    assert doc is None
    assert err == "missing_value"


def test_extracts_pipe_delimited_table_rows():
    sample = """BILL OF LADING
SHIPPER | APRIL FAR EAST
CONSIGNEE | MOORIM SP CO., LTD
NOTIFY PARTY | UAB NOVAKOPA
PORT OF LOADING | PORT KLANG
PORT OF DISCHARGE | CALLAO
CONTAINER COUNT | 2 x 40'HC
GROSS WEIGHT (KG) | 21,577 KG
"""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(sample)
        f_path = f.name

    doc, err = extract_document_from_file("email_table", f_path, use_llm_fallback=False)
    assert err is None
    assert doc is not None
    assert doc.fields["consignee"].value == "MOORIM SP CO., LTD"
    assert doc.fields["gross_weight_kg"].value == "21,577 KG"
