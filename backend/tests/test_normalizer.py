from app.processing.normalizer import (
    is_blank_value,
    normalize_container_count,
    normalize_document_fields,
    normalize_port,
    normalize_text,
    normalize_weight_kg,
)


def test_is_blank_value():
    assert is_blank_value(None) is True
    assert is_blank_value("???") is True
    assert is_blank_value("_______") is True
    assert is_blank_value("TBA") is True
    assert is_blank_value("TBC") is True
    assert is_blank_value("____MT") is True
    assert is_blank_value("Singtel") is False


def test_normalize_port():
    assert normalize_port("PORT KLANG (WESTPORT), MALAYSIA (MYPKG)") == "PORT KLANG"
    assert normalize_port("CALLAO, PERU (PECLL)") == "CALLAO"
    assert normalize_port("JEBEL ALI (AEJEA)") == "JEBEL ALI"
    assert normalize_port("???") is None


def test_normalize_container_count():
    assert normalize_container_count("1 x 40'HC") == 1
    assert normalize_container_count("4 CONTAINERS") == 4
    assert normalize_container_count("2 x 20'GP") == 2
    assert normalize_container_count("TBA") is None


def test_normalize_weight_kg():
    assert normalize_weight_kg("21,577 KG") == 21577.0
    assert normalize_weight_kg("22000.5 KGS") == 22000.5
    assert normalize_weight_kg("22,000") == 22000.0
    assert normalize_weight_kg("_______") is None


def test_normalize_text():
    assert normalize_text("  APRIL FAR EAST   (M) SDN BHD\n ") == "APRIL FAR EAST (M) SDN BHD"
    assert normalize_text("???") is None


def test_normalize_document_fields():
    raw = {
        "port_of_loading": "PORT KLANG (WESTPORT), MALAYSIA (MYPKG)",
        "port_of_discharge": "CALLAO, PERU (PECLL)",
        "container_count": "3 x 40'HC",
        "gross_weight_kg": "22,000 KG",
        "shipper": " APRIL FAR EAST ",
        "consignee": "MOORIM SP CO.",
        "notify_party": "UAB NOVAKOPA",
    }
    normalized = normalize_document_fields(raw)
    assert normalized["port_of_loading"] == "PORT KLANG"
    assert normalized["port_of_discharge"] == "CALLAO"
    assert normalized["container_count"] == 3
    assert normalized["gross_weight_kg"] == 22000.0
    assert normalized["shipper"] == "APRIL FAR EAST"
