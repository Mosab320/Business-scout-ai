# Business Scout AI — Backend

FastAPI + Pydantic + Motor (MongoDB) + JWT auth + a multi-agent AI pipeline.

## Quick start

```bash
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload
```

Runs at http://localhost:8000. Interactive API docs at `/docs`.
See the root `README.md` for full project docs, architecture, and env vars.

## Structure

- `app/main.py` — FastAPI app, CORS, error handlers, router registration
- `app/routes/` — REST endpoints (auth, scout, opportunities, business_plan, dashboard, subscription, admin)
- `app/agents/` — the multi-agent research/scoring/execution pipeline
- `app/services/` — knowledge base, AI client, and mock service abstractions (payment, email, search, PDF)
- `app/database.py` — MongoDB via Motor, with automatic in-memory fallback
- `app/schemas/` — Pydantic request/response models
- `app/middleware/auth.py` — JWT auth dependency
