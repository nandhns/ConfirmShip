"""LLM-based structured field extractor using Pydantic schemas."""
import json
from pydantic import BaseModel, Field
from app.core.config import settings
import google.generativeai as genai


class CanonicalShipmentFields(BaseModel):
    shipper: str | None = Field(description="Name of the shipping company or exporter")
    consignee: str | None = Field(description="Name of the consignee / receiver")
    notify_party: str | None = Field(description="Notify party mentioned on the document")
    port_of_loading: str | None = Field(description="Port of loading name, e.g., SINGAPORE or PORT KLANG")
    port_of_discharge: str | None = Field(description="Port of discharge name, e.g., CALLAO or JEBEL ALI")
    container_count: int | None = Field(description="Total number of containers as an integer")
    gross_weight_kg: float | None = Field(description="Gross weight converted to kilograms as a number")


def extract_fields_with_llm(document_text: str) -> CanonicalShipmentFields:
    """Uses LLM with Structured Output to extract canonical shipping fields."""
    if settings.OCR_PROVIDER.lower() == "gemini":
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

    # Fallback to OpenAI Structured Output if configured
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
