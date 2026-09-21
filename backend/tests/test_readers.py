import tempfile
from pathlib import Path
import io

import fitz
from PIL import Image

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


def test_read_pdf_text_layer():
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        pdf_path = f.name

    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "BILL OF LADING\nConsignee: MOORIM SP CO., LTD")
    document.save(pdf_path)
    document.close()

    text, err = read_attachment(pdf_path)
    assert err is None
    assert "BILL OF LADING" in text
    assert "MOORIM SP CO., LTD" in text


def test_read_docx_table():
    import pytest

    Document = pytest.importorskip("docx").Document

    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as f:
        docx_path = f.name

    document = Document()
    table = document.add_table(rows=1, cols=2)
    table.cell(0, 0).text = "Consignee"
    table.cell(0, 1).text = "MOORIM SP CO., LTD"
    document.save(docx_path)

    text, err = read_attachment(docx_path)
    assert err is None
    assert "Consignee : MOORIM SP CO., LTD" in text


def _image_pdf() -> str:
    image = Image.new("RGB", (500, 200), "white")
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as image_file:
        image.save(image_file, format="PNG")
        image_path = image_file.name
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_file:
        pdf_path = pdf_file.name

    document = fitz.open()
    page = document.new_page(width=500, height=200)
    page.insert_image(page.rect, filename=image_path)
    document.save(pdf_path)
    document.close()
    return pdf_path


def test_read_scanned_pdf_uses_ocr(monkeypatch):
    class FakeOcr:
        last_error = None

        def extract_text_from_image(self, image):
            assert image.width > 0
            return "SHIPPING INSTRUCTION\nConsignee: MOORIM SP CO., LTD"

    monkeypatch.setattr("app.processing.readers.get_ocr_engine", lambda: FakeOcr())
    text, err = read_attachment(_image_pdf())
    assert err is None
    assert "MOORIM SP CO., LTD" in text


def test_scanned_pdf_ocr_failure_is_retryable_reason(monkeypatch):
    class FailedOcr:
        last_error = "provider unavailable"

        def extract_text_from_image(self, image):
            return ""

    monkeypatch.setattr("app.processing.readers.get_ocr_engine", lambda: FailedOcr())
    text, err = read_attachment(_image_pdf())
    assert text is None
    assert err == "ocr_failed"
