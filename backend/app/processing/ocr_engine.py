"""Vendor-Agnostic OCR and Vision Engine.

Supports switching between Google Gemini, OpenAI, or local engines.
"""
from abc import ABC, abstractmethod
from pathlib import Path
from PIL import Image
from app.core.config import settings


class BaseOCREngine(ABC):
    def __init__(self):
        self.last_error: str | None = None

    @abstractmethod
    def extract_text_from_image(self, image: Image.Image) -> str:
        """Extract text from a PIL image."""
        pass


class GeminiOCREngine(BaseOCREngine):
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        super().__init__()
        import google.generativeai as genai
        key = api_key or settings.GEMINI_API_KEY
        if key:
            genai.configure(api_key=key)
        self.model = genai.GenerativeModel(model_name or settings.GEMINI_MODEL)

    def extract_text_from_image(self, image: Image.Image) -> str:
        prompt = (
            "Transcribe all readable text from this shipping document image verbatim. "
            "Preserve labels and formatting exactly as shown. Do not add conversational text."
        )
        try:
            response = self.model.generate_content([prompt, image])
            return response.text if response.text else ""
        except Exception as e:
            self.last_error = str(e)
            return ""


class OpenAIOcrEngine(BaseOCREngine):
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        super().__init__()
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key or settings.OPENAI_API_KEY)
        self.model = model_name or settings.OPENAI_MODEL

    def extract_text_from_image(self, image: Image.Image) -> str:
        import base64
        import io
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        b64_image = base64.b64encode(buf.getvalue()).decode("utf-8")

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all text from this shipping document image accurately."},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_image}"}}
                    ],
                }]
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            self.last_error = str(e)
            return ""


class TesseractOCREngine(BaseOCREngine):
    """Local fallback requiring no API keys."""
    def extract_text_from_image(self, image: Image.Image) -> str:
        try:
            import pytesseract
            return pytesseract.image_to_string(image)
        except Exception as e:
            self.last_error = str(e)
            return ""


def get_ocr_engine() -> BaseOCREngine:
    """Factory to instantiate provider according to configuration."""
    provider = settings.OCR_PROVIDER.lower()
    if provider == "openai":
        return OpenAIOcrEngine()
    elif provider == "tesseract":
        return TesseractOCREngine()
    else:
        return GeminiOCREngine()
