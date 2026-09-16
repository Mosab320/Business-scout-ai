"""
Web search service abstraction.

Swappable interface for a real search/trends API (e.g. SerpAPI, Google Trends).
Falls back to the internal knowledge base when SEARCH_API_KEY is absent.
"""
from app.config import get_settings

settings = get_settings()


class SearchService:
    def is_live(self) -> bool:
        return bool(settings.SEARCH_API_KEY)

    async def search_trends(self, query: str) -> dict:
        if self.is_live():
            # Placeholder for a real provider call.
            raise NotImplementedError("Live search provider not wired up yet.")

        return {
            "query": query,
            "mode": "mock",
            "note": "Using internal knowledge base signals instead of a live search API.",
        }


search_service = SearchService()
