import { formatCurrency } from "@/lib/format";
import {
  useGetSummary,
  getGetSummaryQueryKey,
  useGetSpendingByCategory,
  getGetSpendingByCategoryQueryKey,
  useGetInsight,
  getGetInsightQueryKey,
} from "@workspace/api-client-react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const CHART_COLORS = [
  "hsl(152 60% 47%)",
  "hsl(221 70% 63%)",
  "hsl(38 92% 60%)",
  "hsl(280 60% 65%)",
  "hsl(350 65% 60%)",
  "hsl(180 55% 50%)",
];

function StatCard({
  label,
  value,
  sub,
  accent,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 flex flex-col gap-3",
        accent
          ? "bg-primary/10 border-primary/30"
          : "bg-card border-card-border"
      )}
    >
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p
        className={cn(
          "text-3xl font-display font-bold tracking-tight",
          negative ? "text-expense" : accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-card-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
        <p className="text-sm text-primary font-medium">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { data: summary, isLoading: loadingSum } = useGetSummary({
    query: { queryKey: getGetSummaryQueryKey() },
  });
  const { data: spending, isLoading: loadingSpend } = useGetSpendingByCategory({
    query: { queryKey: getGetSpendingByCategoryQueryKey() },
  });
  const { data: insight, isLoading: loadingInsight } = useGetInsight({
    query: { queryKey: getGetInsightQueryKey() },
  });

  const insightIcon =
    insight?.severity === "warning" ? (
      <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
    ) : insight?.severity === "positive" ? (
      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
    ) : (
      <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Overview
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Your Finances
          </h1>
        </div>
        <Link href="/add">
          <button className="hidden sm:flex items-center gap-2 text-sm text-primary font-semibold hover:underline underline-offset-4">
            Add transaction <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Summary Cards */}
      {loadingSum ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-card-border bg-card p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Net Balance"
            value={formatCurrency(summary.netBalance)}
            sub={`${summary.transactionCount} transactions`}
            accent={summary.netBalance >= 0}
            negative={summary.netBalance < 0}
          />
          <StatCard
            label="Total Income"
            value={formatCurrency(summary.totalIncome)}
            sub="All-time earnings"
          />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(summary.totalExpense)}
            sub="All-time spending"
          />
          <StatCard
            label="Top Category"
            value={summary.topSpendingCategory ?? "—"}
            sub="Highest spend category"
          />
        </div>
      ) : null}

      {/* Chart + Insight */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-2xl border border-card-border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-display font-semibold text-foreground">
              Spending by Category
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Expense breakdown across all categories
            </p>
          </div>

          {loadingSpend ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : !spending || spending.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <TrendingDown className="w-10 h-10 opacity-30" />
              <p className="text-sm">No expense data yet</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spending}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                  barSize={28}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220 20% 18%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 20% 20%)" }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {spending.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right column: income vs expense + insight */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Income vs Expense mini cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-card-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-income/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-income" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Income</span>
              </div>
              {loadingSum ? (
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <p className="text-xl font-display font-bold text-income">
                  {formatCurrency(summary?.totalIncome ?? 0)}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-card-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-expense" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Expenses</span>
              </div>
              {loadingSum ? (
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <p className="text-xl font-display font-bold text-expense">
                  {formatCurrency(summary?.totalExpense ?? 0)}
                </p>
              )}
            </div>
          </div>

          {/* Insight Card */}
          <div className="flex-1 rounded-2xl border border-card-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-display font-semibold text-foreground">
                Spending Insight
              </h2>
            </div>

            {loadingInsight ? (
              <div className="space-y-3">
                {[80, 65, 50].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 bg-muted rounded-full animate-pulse"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ) : insight ? (
              <div
                className={cn(
                  "rounded-xl p-4",
                  insight.severity === "warning"
                    ? "bg-yellow-400/5 border border-yellow-400/20"
                    : insight.severity === "positive"
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-muted/50 border border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  {insightIcon}
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold mb-1",
                        insight.severity === "warning"
                          ? "text-yellow-400"
                          : insight.severity === "positive"
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {insight.type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
