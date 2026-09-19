from fastapi import APIRouter

from app.integrations.challenge_inbox import get_emails

router = APIRouter(
    prefix="/api/emails",
    tags=["emails"]
)

@router.get("/")
def list_emails():
    return get_emails()