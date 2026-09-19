from fastapi import FastAPI
from app.api.routes.emails import router as emails_router

app = FastAPI(
    title="ConfirmShip API",
    version="0.1.0"
)

app.include_router(emails_router)

@app.get("/health")
def health_check():
    return {"status" : "ok"}
