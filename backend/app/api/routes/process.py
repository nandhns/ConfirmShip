from fastapi import APIRouter, HTTPException, status

from app.models.schemas import EmailInput
from app.models.schemas import ProcessedEmail


router = APIRouter(
    prefix="/process",
    tags=["process"],
)

@router.post("", response_model=ProcessedEmail)
def process_email(email: EmailInput):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Processing pipeline is not implemented yet."
    )