from fastapi import APIRouter, HTTPException, status

from app.integrations.challenge_inbox import get_emails
from app.models.schemas import EmailInput

router = APIRouter(
    prefix="/emails",
    tags=["emails"]
)

@router.get("", response_model=list[EmailInput])
def list_emails():
    return get_emails()

@router.get("/{email_id}", response_model=EmailInput)
def get_email(email_id: str):
    normalised_id = email_id

    if email_id.isdigit():
        normalised_id = f"email_{int(email_id):03d}"

    for email in get_emails():
        if email["email_id"] == normalised_id:
            return email

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Email not found with id: {email_id}",
    )
