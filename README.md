# Business Scout AI

**From Business Idea to Business Action.**

Business Scout AI is an AI-powered business discovery and execution platform for
aspiring entrepreneurs and small-business owners. Tell it your budget, location,
skills, interests, experience and risk tolerance, and a multi-agent AI pipeline
researches opportunities, scores them transparently, and generates a full
business plan with a 30-day execution roadmap.

---

## 1. Features

- **Multi-agent AI research pipeline** — Planner, Market Research, Competitor
  Analysis, Finance, Marketing, Execution and Business Advisor agents work
  together on every scouting session.
- **Transparent 0–100 opportunity scoring** across market demand, competition,
  budget fit, skill fit, scalability and execution difficulty.
- **Full business plan generation** with a 30-day, week-by-week launch roadmap
  and a trackable task checklist.
- **PDF export** of any generated business plan.
- **Comparison view** for 2–5 opportunities side by side, with charts.
- **JWT authentication**, protected routes, and a Free / Pro freemium model
  with mock checkout.
- **Admin dashboard** with platform-wide usage and revenue overview.
- **DEMO_MODE** — the entire product runs end-to-end with zero external API
  keys, using deterministic reasoning grounded in a curated business
  knowledge base. Flip one flag to use real OpenAI + MongoDB in production.

## 2. Architecture

```
business-scout-ai/
├── frontend/     React + TypeScript + Vite + Tailwind + Framer Motion
├── backend/      FastAPI + Pydantic + Motor (MongoDB) + JWT auth
│   └── app/agents/   The multi-agent orchestration layer
├── .env.example
├── docker-compose.yml
└── README.md
```

### AI Agent Pipeline (`backend/app/agents/`)

```
Planner Agent
   └─> shortlists relevant business categories from the user's profile

Market Research Agent
   └─> researches demand, growth trend, and local relevance per idea

Competitor Analysis Agent    Finance Agent          Marketing Agent
   └─> positioning, gaps         └─> cost estimate      └─> audience, channels,
                                      & margin                launch campaign

Scoring Engine (0-100, weighted, transparent)

Business Advisor Agent
   └─> ranks opportunities, picks the best fit, explains why

Execution Agent (on-demand, when a business plan is generated)
   └─> 7-day plan, 30-day plan, milestones, risks, next steps
```

Every agent falls back to deterministic logic grounded in
`app/services/knowledge_base.py` when no OpenAI key is configured
(`DEMO_MODE=true`, the default). When `DEMO_MODE=false` and
`OPENAI_API_KEY` is set, the Planner agent additionally calls the real
OpenAI API and merges its output — the rest of the pipeline is
already fully functional and does not require the LLM to run.

### Service abstractions (`backend/app/services/`)

`payment_service.py`, `email_service.py`, `search_service.py` and
`pdf_service.py` are clean interfaces with working mock implementations.
Each checks for its respective API key (`PAYMENT_API_KEY`,
`EMAIL_API_KEY`, `SEARCH_API_KEY`) and is ready for a real provider to be
dropped in later without touching route or business logic.

### Database

MongoDB via Motor (async). If MongoDB isn't reachable — e.g. running
locally without Docker — the app **automatically falls back to an
in-memory store** with the same collection interface, so the whole
product still runs. This is intentional and logged on startup; it is
not a bug. Collections: `users`, `business_profiles`, `scouting_sessions`,
`opportunities`, `business_plans`, `saved_opportunities`, `subscriptions`.

No API keys or passwords are ever stored in plaintext (bcrypt hashing for
passwords; secrets only ever live in environment variables).

---

## 3. Requirements

- Node.js 18+
- Python 3.11+
- MongoDB (optional — falls back to in-memory store if not running)

## 4. Installation & Local Setup

Clone/unzip the project, then:

```bash
cp .env.example .env
```

### Backend

```bash
cd backend
python -m venv venv

# Activate the virtual environment
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is now running at `http://localhost:8000`. Interactive docs at
`http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now running at `http://localhost:5173`.

### Both at once (Docker)

```bash
docker-compose up --build
```

This starts MongoDB, the backend on `:8000`, and the frontend on `:5173`.

---

## 5. Environment Variables

See `.env.example` at the project root (copy it to `.env` in `backend/`
as well, or point `backend/app/config.py`'s `SettingsConfigDict` env file
at the root — by default the backend reads `backend/.env`).

| Variable | Purpose | Required? |
|---|---|---|
| `DEMO_MODE` | `true` runs the whole app without external services | No (defaults `true`) |
| `JWT_SECRET` | Signs auth tokens | Yes for production |
| `MONGODB_URI` | Mongo connection string | No (falls back to in-memory) |
| `OPENAI_API_KEY` | Enables real LLM reasoning in the Planner agent | No |
| `SEARCH_API_KEY` / `EMAIL_API_KEY` / `PAYMENT_API_KEY` | Enable real providers for those services | No (mocked otherwise) |
| `FRONTEND_ORIGIN` | CORS allow-list | No (defaults to `localhost:5173`) |

**Never commit a real `.env` file.** Only `.env.example` (with blank
secrets) is meant to be checked in.

---

## 6. Demo Mode

With `DEMO_MODE=true` (the default), you can register, run full AI Scout
sessions, generate business plans, export PDFs, and use every feature of
the product with zero configuration and zero external API keys. This is
the recommended mode for local development, grading, or a course
presentation.

Set `DEMO_MODE=false` and provide `OPENAI_API_KEY` + a real `MONGODB_URI`
to move toward production.

---

## 7. API Documentation

Full interactive documentation (Swagger UI) is auto-generated by FastAPI
at `/docs` once the backend is running. Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET  | `/api/auth/me` | Current user |
| POST | `/api/scout` | Run a full AI Scout session |
| GET  | `/api/scout/{session_id}` | Retrieve a past session |
| GET  | `/api/opportunities` | List all opportunities for the user |
| GET  | `/api/opportunities/{id}` | Opportunity detail |
| POST/DELETE | `/api/opportunities/{id}/save` | Save / unsave |
| POST | `/api/business-plan` | Generate a full business plan |
| GET  | `/api/business-plans` | List plans |
| GET  | `/api/business-plans/{id}` | Plan detail |
| PATCH | `/api/business-plans/{id}/tasks` | Update a launch-plan task's status |
| GET  | `/api/business-plans/{id}/export-pdf` | Download plan as PDF |
| GET  | `/api/dashboard` | Aggregated dashboard stats |
| GET  | `/api/subscription` | Plan & usage info |
| POST | `/api/subscription/checkout` | Mock (or real) checkout |
| GET  | `/api/admin/overview` | Admin-only platform stats |

---

## 8. User Flow

Register → Login → Create Business Profile → Start AI Scout → Watch AI
Agent Research Animation → Receive Opportunities → Compare Ideas → Save
Ideas → Generate Business Plan → View 30-Day Plan → Upgrade to Pro.

---

## 9. Production Deployment Guidance

- **Backend**: containerize with the provided `backend/Dockerfile`; run
  behind a real ASGI server config (`uvicorn` with `--workers`, or behind
  Gunicorn). Set `DEMO_MODE=false`, a strong random `JWT_SECRET`, a real
  `MONGODB_URI` (MongoDB Atlas recommended), and `OPENAI_API_KEY`.
- **Frontend**: `npm run build` produces a static `dist/` — deploy to any
  static host (Vercel, Netlify, S3+CloudFront) and point `VITE_API_URL`
  at your deployed backend.
- **CORS**: set `FRONTEND_ORIGIN` to your real frontend domain.
- **Payments**: implement `PaymentService.create_checkout_session` in
  `backend/app/services/payment_service.py` against a real Pakistani
  payment gateway once credentials are available — the interface and
  call sites are already wired up.
- Rotate `JWT_SECRET` and all API keys before going live; none are
  committed to source control.

---

## 10. Notes & Honest Limitations

This was generated as a complete, runnable full-stack scaffold, not a
static mockup — every button and flow described above is wired to a real
backend endpoint and either MongoDB or the in-memory fallback. A few
things worth knowing before you present or extend it:

- **Financial estimates are illustrative**, clearly labeled as such in
  the API responses, and are not guarantees of profitability.
- **Payment, email, and search integrations are mock implementations**
  by design (per the original spec) — the interfaces are real and ready
  for a real provider, but no live charges or emails are sent out of
  the box.
- The Planner agent is the only agent that calls a real LLM (when
  configured); the rest of the pipeline is deterministic by design so
  the product works fully offline. This was a scope decision to keep
  the whole system reliable and demoable — swap in more LLM calls in
  `backend/app/agents/*.py` if you want deeper generative reasoning
  per agent.
- The in-memory database fallback is **not persistent** across backend
  restarts. Run MongoDB (`docker-compose up mongodb` or a local
  install) for data that survives a restart.
