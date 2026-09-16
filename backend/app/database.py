"""
Database access layer.

Uses MongoDB (Motor async driver) when a MONGODB_URI is reachable.
Falls back to a lightweight in-memory store when MongoDB is not reachable
(e.g. running DEMO_MODE locally without a Mongo instance) so the whole
application remains runnable with zero external dependencies.
"""
import asyncio
import itertools
from datetime import datetime, timezone
from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings

settings = get_settings()


class InMemoryCollection:
    """A tiny drop-in replacement for a Motor collection, used when Mongo is unavailable."""

    _id_counter = itertools.count(1)

    def __init__(self, name: str):
        self.name = name
        self._docs: dict[str, dict] = {}

    async def insert_one(self, doc: dict):
        doc = dict(doc)
        doc["_id"] = doc.get("_id") or f"{self.name}_{next(self._id_counter)}"
        self._docs[doc["_id"]] = doc

        class _Result:
            inserted_id = doc["_id"]

        return _Result()

    def _matches(self, doc: dict, query: dict) -> bool:
        for k, v in query.items():
            if doc.get(k) != v:
                return False
        return True

    async def find_one(self, query: dict) -> Optional[dict]:
        for doc in self._docs.values():
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query: Optional[dict] = None):
        query = query or {}
        results = [dict(d) for d in self._docs.values() if self._matches(d, query)]
        return _InMemoryCursor(results)

    async def update_one(self, query: dict, update: dict):
        for doc in self._docs.values():
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                return
        return None

    async def delete_one(self, query: dict):
        for _id, doc in list(self._docs.items()):
            if self._matches(doc, query):
                del self._docs[_id]
                return
        return None

    async def count_documents(self, query: dict) -> int:
        return len([d for d in self._docs.values() if self._matches(d, query)])


class _InMemoryCursor:
    def __init__(self, results: list[dict]):
        self._results = results

    def sort(self, key: str, direction: int = -1):
        self._results = sorted(
            self._results, key=lambda d: d.get(key, ""), reverse=(direction == -1)
        )
        return self

    def limit(self, n: int):
        self._results = self._results[:n]
        return self

    def __aiter__(self):
        return self._iter()

    async def _iter(self):
        for r in self._results:
            yield r

    async def to_list(self, length: Optional[int] = None):
        return self._results[:length] if length else self._results


class Database:
    client: Optional[AsyncIOMotorClient] = None
    is_mongo: bool = False
    _memory_collections: dict[str, InMemoryCollection] = {}

    def get_collection(self, name: str):
        if self.is_mongo and self.client is not None:
            return self.client[settings.MONGODB_DB_NAME][name]
        if name not in self._memory_collections:
            self._memory_collections[name] = InMemoryCollection(name)
        return self._memory_collections[name]

    @property
    def users(self):
        return self.get_collection("users")

    @property
    def business_profiles(self):
        return self.get_collection("business_profiles")

    @property
    def scouting_sessions(self):
        return self.get_collection("scouting_sessions")

    @property
    def opportunities(self):
        return self.get_collection("opportunities")

    @property
    def business_plans(self):
        return self.get_collection("business_plans")

    @property
    def saved_opportunities(self):
        return self.get_collection("saved_opportunities")

    @property
    def subscriptions(self):
        return self.get_collection("subscriptions")


db = Database()


async def connect_to_database():
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URI, serverSelectionTimeoutMS=1500
        )
        await client.admin.command("ping")
        db.client = client
        db.is_mongo = True
        print(f"[database] Connected to MongoDB at {settings.MONGODB_URI}")
    except Exception as exc:  # noqa: BLE001
        db.client = None
        db.is_mongo = False
        print(
            f"[database] MongoDB unavailable ({exc.__class__.__name__}: {exc}). "
            "Falling back to in-memory store (fine for DEMO_MODE / local dev)."
        )


async def close_database_connection():
    if db.client is not None:
        db.client.close()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
