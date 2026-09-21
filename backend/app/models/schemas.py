from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------
# Shared types
# ---------------------------------------------------------------------

Category = Literal[
    "BL_COMPARISON",
    "SI_REQUEST",
    "INVOICE_QUERY",
    "GENERAL",
    "SPAM",
]

DocumentType = Literal[
    "SI",
    "BL",
    "UNKNOWN",
    "WRONG_DOCUMENT",
]

VerificationStatus = Literal[
    "no_mismatch",
    "mismatch",
    "needs_review",
]

ReviewReason = Literal[
    "wrong_doc_type",
    "missing_attachment",
    "unreadable",
    "missing_value",
    "uncertain_extraction",
]

CanonicalField = Literal[
    "shipper",
    "consignee",
    "notify_party",
    "port_of_loading",
    "port_of_discharge",
    "container_count",
    "gross_weight_kg",
]

# The runtime iterable list of canonical field names
CANONICAL_FIELDS: list[CanonicalField] = [
    "shipper",
    "consignee",
    "notify_party",
    "port_of_loading",
    "port_of_discharge",
    "container_count",
    "gross_weight_kg",
]

# ---------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------

class EmailInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email_id: str
    sender: str = Field(alias="from")
    subject: str
    body: str
    attachments: list[str] = Field(default_factory=list)


class ClassificationResult(BaseModel):
    email_id: str
    category: Category
    confidence: float = Field(ge=0, le=1)
    reason: str | None = None
    is_uncertain: bool = False
    uncertainty_reason: str | None = None


# ---------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------

class ExtractedField(BaseModel):
    value: str | int | float | None = None
    normalized_value: str | int | float | None = None
    confidence: float = Field(default=0.0, ge=0, le=1)


class UncertainField(BaseModel):
    field: CanonicalField
    reason: str
    confidence: float = Field(ge=0, le=1)


class ExtractedDocument(BaseModel):
    email_id: str
    document_type: DocumentType
    source_path: str
    readable: bool
    fields: dict[CanonicalField, ExtractedField]
    missing_fields: list[CanonicalField] = Field(default_factory=list)
    uncertain_fields: list[UncertainField] = Field(default_factory=list)
    extraction_method: str = "text"
    error: str | None = None


# ---------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------

class FieldComparison(BaseModel):
    field: CanonicalField
    si_value: str | int | float | None
    bl_value: str | int | float | None
    si_normalized: str | int | float | None
    bl_normalized: str | int | float | None
    matches: bool
    reason: str | None = None


class VerificationResult(BaseModel):
    email_id: str
    status: VerificationStatus
    has_defect: bool
    field_comparisons: list[FieldComparison] = Field(default_factory=list)
    defect_fields: list[CanonicalField] = Field(default_factory=list)
    review_reason: ReviewReason | None = None
    review_details: str | None = None


# ---------------------------------------------------------------------
# Combined processing result
# ---------------------------------------------------------------------

class ProcessedEmail(BaseModel):
    email_id: str
    classification: ClassificationResult
    si_document: ExtractedDocument | None = None
    bl_document: ExtractedDocument | None = None
    verification: VerificationResult


# ---------------------------------------------------------------------
# Challenge submission format
# ---------------------------------------------------------------------

ChallengeStatus = Literal[
    "OK",
    "MISMATCH",
    "NEEDS_REVIEW",
]


class SubmissionResult(BaseModel):
    category: Category
    status: ChallengeStatus
    review_reason: ReviewReason | None = None
    defect_fields: list[CanonicalField] = Field(default_factory=list)
    has_defect: bool