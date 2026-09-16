"""
Thin wrapper around the OpenAI API.

Only used when settings.ai_enabled is True (DEMO_MODE=false and an
OPENAI_API_KEY is configured). Every agent falls back to deterministic
local reasoning when this is unavailable, so the product works end-to-end
with zero external credentials.
"""
import json
from typing import Any, Optional

from app.config import get_settings

settings = get_settings()

_client: Optional[Any] = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI

        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


async def generate_json(system_prompt: str, user_prompt: str) -> Optional[dict]:
    """
    Calls the OpenAI API and asks for a strict JSON response.
    Returns None (never raises) if the call fails or AI is disabled,
    so callers can gracefully fall back to their deterministic logic.
    """
    if not settings.ai_enabled:
        return None
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as exc:  # noqa: BLE001
        print(f"[ai_client] OpenAI call failed, falling back to local logic: {exc}")
        return None
