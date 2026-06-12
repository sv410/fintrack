import { useState } from "react";
import {
  useListTransactions, getListTransactionsQueryKey,
  useDeleteTransaction, useListCategories, getListCategoriesQueryKey,
  getGetSummaryQueryKey, getGetSpendingByCategoryQueryKey, getGetInsightQueryKey,
  ListTransactionsType,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { Trash2, TrendingUp, TrendingDown, X, SlidersHorizontal, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type TypeFilter = ListTransactionsType | "all";

const inputStyle: React.CSSProperties = {
  height: "36px",
  borderRadius: "10px",
  border: "1px solid hsl(225 18% 18%)",
  background: "hsl(230 25% 7%)",
  color: "hsl(210 40% 97%)",
  fontSize: "0.8125rem",
  padding: "0 10px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

export function Transactions() {
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const params = {
    category: category || undefined,
    type: type !== "all" ? (type as ListTransactionsType) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { data: transactions, isLoading } = useListTransactions(params, {
    query: { queryKey: getListTransactionsQueryKey(params) },
  });

  const deleteTx = useDeleteTransaction({
    mutation: {
      onSuccess: () => {
        toast({ title: "Transaction removed" });
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetInsightQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    },
  });

  const hasFilters = !!category || type !== "all" || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setCategory("");
    setType("all");
    setDateFrom("");
    setDateTo("");
  };

  const typeColors: Record<string, { bg: string; icon: string }> = {
    income: { bg: "hsl(160 80% 50% / 0.1)", icon: "hsl(160 80% 50%)" },
    expense: { bg: "hsl(0 75% 58% / 0.1)", icon: "hsl(0 75% 58%)" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="pill" style={{ background: "hsl(225 18% 14%)", color: "hsl(215 20% 55%)", border: "1px solid hsl(225 18% 20%)" }}>
              History
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {transactions ? `${transactions.length} record${transactions.length !== 1 ? "s" : ""}${hasFilters ? " (filtered)" : ""}` : "Your complete record"}
          </p>
        </div>
        <Link href="/add">
          <button
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, hsl(160 80% 50%), hsl(160 80% 42%))",
              color: "hsl(230 25% 6%)",
              boxShadow: "0 0 20px hsl(160 80% 50% / 0.2)",
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Add
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "hsl(228 22% 10% / 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid hsl(225 18% 16% / 0.8)",
        }}
      >
        <div className="flex items-center gap-2 mb-3.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Filters</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Type</label>
            <div
              className="flex rounded-xl overflow-hidden h-9"
              style={{ border: "1px solid hsl(225 18% 18%)", background: "hsl(230 25% 7%)" }}
            >
              {(["all", "income", "expense"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex-1 text-xs font-semibold transition-all duration-150"
                  style={
                    type === t
                      ? {
                          background: t === "income"
                            ? "hsl(160 80% 50% / 0.2)"
                            : t === "expense"
                            ? "hsl(0 75% 58% / 0.2)"
                            : "hsl(225 18% 20%)",
                          color: t === "income"
                            ? "hsl(160 80% 55%)"
                            : t === "expense"
                            ? "hsl(0 75% 65%)"
                            : "hsl(210 40% 97%)",
                        }
                      : { color: "hsl(215 20% 50%)" }
                  }
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Category</label>
            <select
              value={category || "__all__"}
              onChange={e => setCategory(e.target.value === "__all__" ? "" : e.target.value)}
              style={inputStyle}
            >
              <option value="__all__">All categories</option>
              {categories?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* From */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">From date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">To date</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "hsl(228 22% 10% / 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid hsl(225 18% 16% / 0.8)",
        }}
      >
        {isLoading ? (
          <div className="divide-y divide-[hsl(225_18%_14%)]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-xl shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 shimmer rounded-full" />
                  <div className="h-2.5 w-20 shimmer rounded-full" />
                </div>
                <div className="h-4 w-16 shimmer rounded-full" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
              style={{ background: "hsl(225 18% 14%)", border: "1px solid hsl(225 18% 20%)" }}
            >
              <SlidersHorizontal className="w-7 h-7 opacity-30" />
            </div>
            <p className="font-semibold text-foreground text-sm">No transactions found</p>
            <p className="text-sm text-center max-w-xs">
              {hasFilters ? "Try adjusting your filters." : "Add your first transaction to get started."}
            </p>
            {!hasFilters && (
              <Link href="/add">
                <button
                  className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, hsl(160 80% 50%), hsl(160 80% 42%))",
                    color: "hsl(230 25% 6%)",
                  }}
                >
                  Add transaction
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[hsl(225_18%_13%)]">
            {transactions.map((tx, idx) => {
              const colors = typeColors[tx.type];
              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between px-5 py-3.5 transition-colors duration-150"
                  style={{ animationDelay: `${idx * 30}ms` }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(225 18% 13% / 0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: colors.bg }}
                    >
                      {tx.type === "income"
                        ? <TrendingUp className="w-4 h-4" style={{ color: colors.icon }} />
                        : <TrendingDown className="w-4 h-4" style={{ color: colors.icon }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{tx.category}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <span>{format(new Date(tx.date), "MMM d, yyyy")}</span>
                        {tx.note && (
                          <>
                            <span className="opacity-30">·</span>
                            <span className="truncate max-w-[160px] sm:max-w-[260px]">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-4">
                    <span
                      className="text-sm font-display font-bold num"
                      style={{ color: colors.icon }}
                    >
                      {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => deleteTx.mutate({ id: tx.id })}
                      disabled={deleteTx.isPending}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90"
                      style={{ color: "hsl(215 20% 45%)" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "hsl(0 75% 65%)";
                        (e.currentTarget as HTMLButtonElement).style.background = "hsl(0 75% 58% / 0.1)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "hsl(215 20% 45%)";
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
