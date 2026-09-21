import tempfile
from pathlib import Path
from app.processing.readers import read_attachment


def test_read_plain_text():
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write("SHIPPING INSTRUCTION\nShipper: APRIL FAR EAST")
        f_path = f.name

    text, err = read_attachment(f_path)
    assert err is None
    assert "SHIPPING INSTRUCTION" in text
    assert "Shipper: APRIL FAR EAST" in text


def test_read_empty_file_unreadable():
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f_path = f.name  # 0 bytes

    text, err = read_attachment(f_path)
    assert text is None
    assert err == "unreadable"


def test_read_missing_file():
    text, err = read_attachment("non_existent_file_path.pdf")
    assert text is None
    assert err == "missing_attachment"


def test_read_unsupported_doc_type():
    with tempfile.NamedTemporaryFile("w", suffix=".exe", delete=False) as f:
        f.write("dummy binary")
        f_path = f.name

    text, err = read_attachment(f_path)
    assert text is None
    assert err == "wrong_doc_type"
