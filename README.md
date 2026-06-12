# Fintrack — Mini Fintech Dashboard

> Take-Home Assignment: Personal Finance Tracker

A sleek, full-stack personal finance tracker built with a modern dark fintech aesthetic. Log transactions, filter your history, view live summaries, and get rule-based spending insights — all in one place.

---

## Live Demo

Hosted publicly on Replit:
**[https://fintrack.replit.app](https://fintrack.replit.app)** *(replace with your deployed URL)*

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
git clone <your-repo-url>
cd fintrack
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Create a `.env` file in the repo root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fintrack
SESSION_SECRET=your-secret-here
```

### 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 5. (Optional) Seed sample data

```bash
pnpm --filter @workspace/scripts run seed
```

### 6. Start the API server

```bash
pnpm --filter @workspace/api-server run dev
```

### 7. Start the frontend (new terminal)

```bash
pnpm --filter @workspace/finance-tracker run dev
```

Open **http://localhost:5173** in your browser.

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
