"""
Email service abstraction.

Swappable interface for a real provider (SendGrid, SES, Postmark, etc).
Falls back to logging to stdout when EMAIL_API_KEY is not configured.
"""
from app.config import get_settings

settings = get_settings()


class EmailService:
    def is_live(self) -> bool:
        return bool(settings.EMAIL_API_KEY)

    async def send(self, to: str, subject: str, body: str) -> dict:
        if self.is_live():
            # Placeholder for a real provider call.
            raise NotImplementedError("Live email provider not wired up yet.")

        print(f"[email_service:mock] To: {to} | Subject: {subject}\n{body}")
        return {"status": "sent", "mode": "mock"}


email_service = EmailService()
