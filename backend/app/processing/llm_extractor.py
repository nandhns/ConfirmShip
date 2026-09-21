"""LLM-based structured field extractor using Pydantic schemas."""
from pydantic import BaseModel, Field
from app.core.config import settings


class CanonicalShipmentFields(BaseModel):
    shipper: str | None = Field(default=None, description="Name of the shipping company or exporter")
    consignee: str | None = Field(default=None, description="Name of the consignee / receiver")
    notify_party: str | None = Field(default=None, description="Notify party mentioned on the document")
    port_of_loading: str | None = Field(default=None, description="Port of loading name, e.g., SINGAPORE or PORT KLANG")
    port_of_discharge: str | None = Field(default=None, description="Port of discharge name, e.g., CALLAO or JEBEL ALI")
    container_count: int | None = Field(default=None, description="Total number of containers as an integer")
    gross_weight_kg: float | None = Field(default=None, description="Gross weight converted to kilograms as a number")


def extract_fields_with_llm(document_text: str) -> CanonicalShipmentFields:
    """Uses LLM with Structured Output to extract canonical shipping fields."""
    provider = settings.OCR_PROVIDER.lower()

    if provider == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": CanonicalShipmentFields,
            }
        )
        prompt = f"Extract the canonical shipment fields from the document text below:\n\n{document_text}"
        response = model.generate_content(prompt)
        return CanonicalShipmentFields.model_validate_json(response.text)

    elif provider == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        completion = client.beta.chat.completions.parse(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Extract the 7 canonical shipping fields from the document."},
                {"role": "user", "content": document_text},
            ],
            response_format=CanonicalShipmentFields,
        )
        return completion.choices[0].message.parsed

    # If local tesseract or no LLM provider configured, return empty defaults
    return CanonicalShipmentFields()
