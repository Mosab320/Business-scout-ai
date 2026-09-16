"""
Payment service abstraction.

Provides a clean interface so a real Pakistani payment provider (e.g. JazzCash,
Easypaisa, or a Stripe-compatible gateway) can be plugged in later without
touching route/business logic. Falls back to a mock flow when PAYMENT_API_KEY
is not configured, which is the default for local/demo use.
"""
import uuid
from typing import Literal

from app.config import get_settings

settings = get_settings()

PlanType = Literal["pro_monthly", "one_time_plan"]


class PaymentService:
    def is_live(self) -> bool:
        return bool(settings.PAYMENT_API_KEY)

    async def create_checkout_session(self, user_id: str, plan: PlanType) -> dict:
        price = (
            settings.PRO_PLAN_PRICE_PKR
            if plan == "pro_monthly"
            else settings.ONE_TIME_PLAN_PRICE_PKR
        )

        if self.is_live():
            # Placeholder for a real integration call, e.g.:
            # return await real_provider.create_session(user_id, plan, price)
            raise NotImplementedError(
                "Live payment provider not wired up yet. Implement here once "
                "credentials are available."
            )

        # Mock flow: instantly "succeeds" so the rest of the product can be demoed.
        return {
            "checkout_id": f"mock_{uuid.uuid4().hex[:12]}",
            "status": "success",
            "plan": plan,
            "amount": price,
            "currency": "PKR",
            "mode": "mock",
            "message": (
                "This is a mock payment flow for demo purposes. No real charge "
                "was made. Connect a real gateway via PAYMENT_API_KEY to go live."
            ),
        }


payment_service = PaymentService()
