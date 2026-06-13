# Fintrack — Mini Fintech Dashboard

Personal finance tracker: log transactions, filter history, view summaries, charts, and spending insights.

**Repository:** [https://github.com/sv410/fintrack](https://github.com/sv410/fintrack)

---

## Features

- Add transactions (amount, category, income/expense, date, optional note)
- Filter transactions by category, type, and date range
- Summary: total income, expenses, net balance, top spending category
- Bar chart of spending by category
- Rule-based spending insights
- Currency switcher (USD, INR, EUR, and more)

---

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- A PostgreSQL database (use [Neon](https://neon.tech) free tier)

### 1. Clone and install

```bash
git clone https://github.com/sv410/fintrack.git
cd fintrack
pnpm install
```

### 2. Get your `DATABASE_URL`

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **connection string** (URI) — it looks like:

```

```

### 3. Create `.env` file

In the project root, create a file named `.env`:

```env
DATABASE_URL=
```

Replace the value with your actual Neon connection string.

### 4. Create database tables

```bash
pnpm run db:push
```

### 5. Start the API (terminal 1)

```bash
# Windows (PowerShell)
$env:PORT='8080'; pnpm --filter @workspace/api-server run build; node artifacts/api-server/dist/index.mjs

# macOS / Linux
PORT=8080 pnpm --filter @workspace/api-server run dev
```

### 6. Start the frontend (terminal 2)

```bash
# Windows (PowerShell)
$env:PORT='19051'; $env:BASE_PATH='/'; pnpm --filter @workspace/finance-tracker run dev

# macOS / Linux
PORT=19051 BASE_PATH=/ pnpm --filter @workspace/finance-tracker run dev
```

Open **http://localhost:19051** in your browser.

---

## Deploy on Vercel (UI + backend on one URL)

1. Import repo at [vercel.com/new](https://vercel.com/new) — **Root Directory must be empty**
2. Add environment variables in Vercel dashboard:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NODE_ENV` | `production` |

3. Deploy. Test: `https://your-app.vercel.app/api/healthz` → `{"status":"ok"}`

> Your local `.env` is **not** uploaded. You must paste `DATABASE_URL` in Vercel settings.

---

## License

MIT
