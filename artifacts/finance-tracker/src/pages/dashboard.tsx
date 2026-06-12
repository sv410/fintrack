import { useCurrency } from "@/contexts/currency-context";
import {
  useGetSummary, getGetSummaryQueryKey,
  useGetSpendingByCategory, getGetSpendingByCategoryQueryKey,
  useGetInsight, getGetInsightQueryKey,
} from "@workspace/api-client-react";
import {
  TrendingUp, TrendingDown, Wallet, AlertTriangle,
  CheckCircle2, Info, Sparkles, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const COLORS = [
  "hsl(160 80% 50%)",
  "hsl(221 83% 65%)",
  "hsl(38 100% 62%)",
  "hsl(280 65% 68%)",
  "hsl(350 70% 62%)",
  "hsl(180 60% 52%)",
];

const ChartTooltip = ({ active, payload, label, format }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: "hsl(228 22% 12% / 0.95)",
        border: "1px solid hsl(225 18% 22%)",
        boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4)",
        backdropFilter: "blur(16px)",
      }}
    >
      <p className="font-semibold text-foreground mb-0.5">{label}</p>
      <p className="text-primary font-bold">{format(payload[0].value)}</p>
      <p className="text-muted-foreground text-xs mt-0.5">{payload[0].payload.count} transactions</p>
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 h-32 shimmer" style={{ border: "1px solid hsl(225 18% 16%)" }} />
  );
}

export function Dashboard() {
  const { format } = useCurrency();
  const { data: summary, isLoading: loadingSum } = useGetSummary({ query: { queryKey: getGetSummaryQueryKey() } });
  const { data: spending, isLoading: loadingSpend } = useGetSpendingByCategory({ query: { queryKey: getGetSpendingByCategoryQueryKey() } });
  const { data: insight, isLoading: loadingInsight } = useGetInsight({ query: { queryKey: getGetInsightQueryKey() } });

  const savingsPct = summary && summary.totalIncome > 0
    ? ((summary.totalIncome - summary.totalExpense) / summary.totalIncome * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="pill" style={{ background: "hsl(160 80% 50% / 0.12)", color: "hsl(160 80% 55%)", border: "1px solid hsl(160 80% 50% / 0.2)" }}>
              <span className="w-1 h-1 rounded-full bg-current" />
              Live
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your money, at a glance.</p>
        </div>
        <Link href="/add">
          <button
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: "hsl(225 18% 14%)", border: "1px solid hsl(225 18% 20%)", color: "hsl(var(--foreground))" }}
          >
            New entry <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </Link>
      </div>

      {/* Stat cards */}
      {loadingSum ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Net Balance */}
          <div
            className="sm:col-span-2 lg:col-span-1 rounded-2xl p-5 relative overflow-hidden card-hover"
            style={{
              background: summary.netBalance >= 0
                ? "linear-gradient(135deg, hsl(160 80% 50% / 0.18) 0%, hsl(160 80% 50% / 0.06) 100%)"
                : "linear-gradient(135deg, hsl(0 75% 58% / 0.18) 0%, hsl(0 75% 58% / 0.06) 100%)",
              border: summary.netBalance >= 0
                ? "1px solid hsl(160 80% 50% / 0.3)"
                : "1px solid hsl(0 75% 58% / 0.3)",
            }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: summary.netBalance >= 0 ? "hsl(160 80% 50%)" : "hsl(0 75% 58%)", filter: "blur(30px)" }}
            />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Net Balance</p>
            <p className={cn("text-3xl font-display font-extrabold num", summary.netBalance >= 0 ? "text-income" : "text-expense")}>
              {format(summary.netBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{summary.transactionCount} transactions total</p>
          </div>

          {/* Income */}
          <div className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Income</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(160 80% 50% / 0.12)" }}>
                <TrendingUp className="w-3.5 h-3.5 text-income" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground num">{format(summary.totalIncome)}</p>
            {savingsPct && <p className="text-xs mt-2" style={{ color: "hsl(160 80% 55%)" }}>Saving {savingsPct}%</p>}
          </div>

          {/* Expenses */}
          <div className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Expenses</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(0 75% 58% / 0.12)" }}>
                <TrendingDown className="w-3.5 h-3.5 text-expense" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground num">{format(summary.totalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-2">All-time spending</p>
          </div>

          {/* Top category */}
          <div className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top Category</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(221 83% 65% / 0.12)" }}>
                <Wallet className="w-3.5 h-3.5" style={{ color: "hsl(221 83% 65%)" }} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground truncate">
              {summary.topSpendingCategory ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Highest expense category</p>
          </div>
        </div>
      ) : null}

      {/* Chart + Insight row */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Bar chart */}
        <div
          className="lg:col-span-3 rounded-2xl p-6"
          style={{ background: "hsl(228 22% 10% / 0.8)", backdropFilter: "blur(20px)", border: "1px solid hsl(225 18% 16% / 0.8)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-display font-bold text-foreground">Spending by Category</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Expense breakdown</p>
            </div>
          </div>

          {loadingSpend ? (
            <div className="h-60 flex items-center justify-center">
              <div className="w-8 h-8 border-2 rounded-full border-muted border-t-primary animate-spin" />
            </div>
          ) : !spending?.length ? (
            <div className="h-60 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <TrendingDown className="w-10 h-10 opacity-20" />
              <p className="text-sm">No expense data yet</p>
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spending} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 18% 16%)" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "hsl(215 20% 45%)", fontSize: 11, fontWeight: 500 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(215 20% 45%)", fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => format(v)}
                  />
                  <Tooltip content={<ChartTooltip format={format} />} cursor={{ fill: "hsl(225 18% 16% / 0.5)", radius: 6 }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {spending.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: mini cards + insight */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Income", value: summary?.totalIncome, color: "hsl(160 80% 50%)", bg: "hsl(160 80% 50% / 0.1)", icon: TrendingUp },
              { label: "Expenses", value: summary?.totalExpense, color: "hsl(0 75% 58%)", bg: "hsl(0 75% 58% / 0.1)", icon: TrendingDown },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ background: "hsl(228 22% 10% / 0.8)", backdropFilter: "blur(20px)", border: "1px solid hsl(225 18% 16% / 0.8)" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                {loadingSum ? (
                  <div className="h-5 w-16 shimmer rounded" />
                ) : (
                  <p className="text-lg font-display font-bold num" style={{ color }}>
                    {format(value ?? 0)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Insight */}
          <div
            className="flex-1 rounded-2xl p-5"
            style={{ background: "hsl(228 22% 10% / 0.8)", backdropFilter: "blur(20px)", border: "1px solid hsl(225 18% 16% / 0.8)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(280 65% 68% / 0.12)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(280 65% 68%)" }} />
              </div>
              <h2 className="text-sm font-display font-bold text-foreground">Spending Insight</h2>
            </div>

            {loadingInsight ? (
              <div className="space-y-2.5">
                {[90, 70, 55].map((w, i) => (
                  <div key={i} className="h-3 shimmer rounded-full" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : insight ? (
              <div
                className="rounded-xl p-4"
                style={
                  insight.severity === "warning"
                    ? { background: "hsl(38 100% 62% / 0.07)", border: "1px solid hsl(38 100% 62% / 0.2)" }
                    : insight.severity === "positive"
                    ? { background: "hsl(160 80% 50% / 0.07)", border: "1px solid hsl(160 80% 50% / 0.2)" }
                    : { background: "hsl(225 18% 14%)", border: "1px solid hsl(225 18% 20%)" }
                }
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {insight.severity === "warning"
                      ? <AlertTriangle className="w-4 h-4" style={{ color: "hsl(38 100% 62%)" }} />
                      : insight.severity === "positive"
                      ? <CheckCircle2 className="w-4 h-4 text-income" />
                      : <Info className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold mb-1.5",
                      insight.severity === "warning" ? "text-[hsl(38_100%_62%)]"
                      : insight.severity === "positive" ? "text-income"
                      : "text-foreground"
                    )}>
                      {insight.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.message}</p>
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
