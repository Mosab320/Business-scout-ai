# Business Scout AI — Frontend

React + TypeScript + Vite + Tailwind CSS + Framer Motion + Recharts.

## Quick start

```bash
npm install
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:8000
npm run dev
```

Runs at http://localhost:5173. See the root `README.md` for full project docs.

## Structure

- `src/pages/` — route-level pages (Landing, Scout, Dashboard, etc.)
- `src/components/` — reusable UI (OpportunityCard, ScoutForm, ResearchAnimation)
- `src/layouts/` — DashboardLayout (sidebar shell), ProtectedRoute
- `src/context/` — AuthContext (JWT session state)
- `src/services/api.ts` — typed API client (axios)
- `src/types/` — shared TypeScript interfaces
