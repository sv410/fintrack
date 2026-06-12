# Fintrack — Mini Fintech Dashboard

> Take-Home Assignment: Personal Finance Tracker

A sleek, full-stack personal finance tracker built with a modern dark fintech aesthetic. Log transactions, filter your history, view live summaries, and get rule-based spending insights — all in one place.

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | [https://fintrack-3yxb.onrender.com](https://fintrack-3yxb.onrender.com) |
| **API** | [https://fintracks-v8gr.onrender.com/api/healthz](https://fintracks-v8gr.onrender.com/api/healthz) |
| **Repository** | [https://github.com/sv410/fintrack](https://github.com/sv410/fintrack) |

---

## Deploy on Render

This app needs **three resources** on [Render](https://render.com): a PostgreSQL database, a **Web Service** (API), and a **Static Site** (frontend).

### 1. PostgreSQL database

1. **New → PostgreSQL** (Free plan)
2. Name it `fintrack-db`
3. Copy the **Internal Database URL** (use this for `DATABASE_URL`)

### 2. Web Service — API (`fintracks`)

| Setting | Value |
|---|---|
| **Type** | Web Service |
| **Runtime** | Node |
| **Build Command** | `pnpm install --frozen-lockfile && pnpm run build:api` |
| **Start Command** | `pnpm start` |
| **Health Check Path** | `/api/healthz` |

**Environment variables:**

| Key | Value |
|---|---|
| `DATABASE_URL` | Internal Database URL from step 1 |
| `NODE_ENV` | `production` |

> `build:api` builds the Express server and auto-runs `db:push` when `DATABASE_URL` is set.

Verify: open `https://<your-api>.onrender.com/api/healthz` → `{"status":"ok"}`

### 3. Static Site — Frontend (`fintrack`)

| Setting | Value |
|---|---|
| **Type** | Static Site |
| **Build Command** | `pnpm install --frozen-lockfile && pnpm run build:static` |
| **Publish Directory** | `artifacts/finance-tracker/dist/public` |

**Environment variables:**

| Key | Value |
|---|---|
| `BASE_PATH` | `/` |

**Redirects / Rewrites** (Settings → Redirects/Rewrites):

| Source | Destination | Action |
|---|---|---|
| `/api/*` | `https://fintracks-v8gr.onrender.com/api/*` | Rewrite |
| `/*` | `/index.html` | Rewrite |

> Replace the API URL above if your Web Service has a different hostname.

### One-click deploy (optional)

Use **New → Blueprint** and connect `sv410/fintrack`. The repo includes a `render.yaml` with these settings preconfigured.

---

## Features

| Requirement | Implementation |
|---|---|
| **Add transaction** | Amount, category, type (income/expense), date, optional note — with animated form and contextual color |
| **Filter transactions** | By type, category, and date range (From / To) |
| **Summary view** | Total income, total expenses, net balance, top spending category — live stat cards |
| **Chart** | Bar chart of spending by category (Recharts) |
| **Insight** | Rule-based engine: flags overspending (>90% of income), praises good savings (>20%), highlights dominant categories |
| **Currency switcher** | USD, INR, EUR, GBP, JPY, AUD, CAD, CHF, SGD, AED — persists via localStorage |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v4, Recharts |
| **Backend** | Node.js 24, Express 5, TypeScript |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | Zod v4 (shared schema, server + client) |
| **API contract** | OpenAPI 3.1 spec → Orval codegen (React Query hooks + Zod schemas) |
| **Routing** | Wouter (client), Express 5 (server) |
| **Monorepo** | pnpm workspaces |

---

## Project Structure

```
fintrack/
├── artifacts/
│   ├── api-server/          # Express 5 REST API (port 8080, path /api)
│   └── finance-tracker/     # React + Vite frontend (port 19051, path /)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM schema + migrations
└── scripts/                 # Utility scripts (seed data etc.)
```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (local or hosted)

### 1. Clone

```bash
git clone https://github.com/sv410/fintrack.git
cd fintrack
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Copy `.env.example` to `.env` in the repo root and fill in your values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fintrack
SESSION_SECRET=your-secret-here
```

### 4. Push the database schema

```bash
pnpm run db:push
```

Or set `DATABASE_URL` and run `pnpm run build:api` (schema push runs automatically when the env var is present).

### 5. Start the API server

```bash
# Windows (PowerShell)
$env:PORT='8080'; $env:DATABASE_URL='postgresql://user:password@localhost:5432/fintrack'; pnpm --filter @workspace/api-server run build; node artifacts/api-server/dist/index.mjs

# macOS / Linux
PORT=8080 DATABASE_URL=postgresql://user:password@localhost:5432/fintrack pnpm --filter @workspace/api-server run dev
```

### 6. Start the frontend (new terminal)

```bash
# Windows (PowerShell)
$env:PORT='19051'; $env:BASE_PATH='/'; pnpm --filter @workspace/finance-tracker run dev

# macOS / Linux
PORT=19051 BASE_PATH=/ pnpm --filter @workspace/finance-tracker run dev
```

Open **http://localhost:19051** in your browser.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/transactions` | List transactions (filter by type, category, date range) |
| `POST` | `/api/transactions` | Create a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/summary` | Total income, expense, net balance, top category, count |
| `GET` | `/api/summary/by-category` | Spending breakdown per category |
| `GET` | `/api/summary/insight` | Rule-based spending insight |
| `GET` | `/api/categories` | All distinct categories in the DB |

---

## Codegen (after OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Typecheck

```bash
pnpm run typecheck
```

---

## Design Decisions

- **Contract-first API**: OpenAPI spec is the single source of truth; React Query hooks and Zod schemas are generated, never handwritten.
- **Shared Zod schemas**: The same validation schemas run on both server (input validation) and client (form validation), eliminating drift.
- **Glassmorphism UI**: Dark background with `backdrop-filter: blur` cards, gradient mesh background, and `Plus Jakarta Sans` display font for a premium fintech feel.
- **Currency context**: Selected currency is stored in `localStorage` so the preference survives page reloads without a server round-trip.
- **Rule-based insight engine**: Deliberately simple — a pure SQL + JS function that reads income/expense ratios and identifies dominant categories, with no ML dependency.

---

## License

MIT
