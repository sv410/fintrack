import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { 
  useGetSummary, 
  getGetSummaryQueryKey,
  useGetSpendingByCategory,
  getGetSpendingByCategoryQueryKey,
  useGetInsight,
  getGetInsightQueryKey
} from "@workspace/api-client-react";
import { AlertCircle, ArrowDownRight, ArrowUpRight, TrendingUp, CheckCircle2, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetSummary({
    query: { queryKey: getGetSummaryQueryKey() }
  });
  const { data: spending, isLoading: isLoadingSpending } = useGetSpendingByCategory({
    query: { queryKey: getGetSpendingByCategoryQueryKey() }
  });
  const { data: insight, isLoading: isLoadingInsight } = useGetInsight({
    query: { queryKey: getGetInsightQueryKey() }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground tracking-tight mb-2">Overview</h1>
        <p className="text-muted-foreground text-lg">A clear view of your financial state.</p>
      </div>

      {isLoadingSummary || !summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ArrowDownRight className="w-16 h-16 text-foreground" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold font-serif tracking-tight",
                summary.netBalance < 0 ? "text-destructive" : "text-foreground"
              )}>
                {formatCurrency(summary.netBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.transactionCount} total transactions
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <ArrowUpRight className="w-16 h-16 text-foreground" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif tracking-tight text-foreground">
                {formatCurrency(summary.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="w-16 h-16 text-foreground" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif tracking-tight text-foreground">
                {formatCurrency(summary.totalExpense)}
              </div>
              {summary.topSpendingCategory && (
                <p className="text-xs text-muted-foreground mt-1">
                  Top spend: {summary.topSpendingCategory}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Spending by Category</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSpending || !spending ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            ) : spending.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center flex-col text-muted-foreground">
                <Info className="w-8 h-8 mb-2 opacity-50" />
                <p>No spending data yet.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spending}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="category"
                      stroke="none"
                    >
                      {spending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-border/50 shadow-sm bg-primary/5 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="font-serif">Insight</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInsight || !insight ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-xl flex items-start gap-3",
                  insight.severity === 'warning' ? "bg-destructive/10 text-destructive-foreground" :
                  insight.severity === 'positive' ? "bg-primary/20 text-primary-foreground" :
                  "bg-muted text-foreground"
                )}>
                  <div className="mt-0.5">
                    {insight.severity === 'warning' ? <AlertCircle className="w-5 h-5 text-destructive" /> :
                     insight.severity === 'positive' ? <CheckCircle2 className="w-5 h-5 text-primary" /> :
                     <Info className="w-5 h-5 text-foreground" />}
                  </div>
                  <div>
                    <h4 className={cn("font-medium mb-1", 
                      insight.severity === 'warning' ? "text-destructive" :
                      insight.severity === 'positive' ? "text-primary" :
                      "text-foreground"
                    )}>
                      {insight.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <p className={cn("text-sm leading-relaxed", 
                      insight.severity === 'warning' ? "text-destructive/90" :
                      insight.severity === 'positive' ? "text-primary/90" :
                      "text-foreground/80"
                    )}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
