import { useState } from "react";
import {
  useListTransactions,
  getListTransactionsQueryKey,
  useDeleteTransaction,
  useListCategories,
  getListCategoriesQueryKey,
  getGetSummaryQueryKey,
  getGetSpendingByCategoryQueryKey,
  getGetInsightQueryKey,
  ListTransactionsType,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { Trash2, SlidersHorizontal, TrendingUp, TrendingDown, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type TypeFilter = ListTransactionsType | "all";

export function Transactions() {
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

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
        toast({ title: "Transaction deleted" });
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetInsightQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
      onError: () =>
        toast({ title: "Failed to delete", variant: "destructive" }),
    },
  });

  const hasFilters = !!category || type !== "all" || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setCategory("");
    setType("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            History
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Transactions
          </h1>
        </div>
        <Link href="/add">
          <button className="hidden sm:flex items-center gap-2 text-sm text-primary font-semibold hover:underline underline-offset-4">
            + Add new
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-card-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Type toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Type</label>
            <div className="flex rounded-lg border border-border overflow-hidden h-9 text-sm">
              {(["all", "income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 text-xs font-medium transition-colors",
                    type === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
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
              value={category}
              onChange={(e) => setCategory(e.target.value === "__all__" ? "" : e.target.value)}
              className="h-9 rounded-lg border border-border bg-background text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="__all__">All categories</option>
              {categories?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">From date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">To date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6 opacity-40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">No transactions found</p>
              <p className="text-sm mt-1">
                {hasFilters ? "Try clearing your filters." : "Add your first transaction to get started."}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      tx.type === "income"
                        ? "bg-income/10"
                        : "bg-expense/10"
                    )}
                  >
                    {tx.type === "income" ? (
                      <TrendingUp className="w-4 h-4 text-income" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-expense" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tx.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{format(new Date(tx.date), "MMM d, yyyy")}</span>
                      {tx.note && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="truncate max-w-[180px]">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span
                    className={cn(
                      "text-sm font-display font-bold tabular-nums",
                      tx.type === "income" ? "text-income" : "text-expense"
                    )}
                  >
                    {tx.type === "income" ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => deleteTx.mutate({ id: tx.id })}
                    disabled={deleteTx.isPending}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-expense hover:bg-expense/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {transactions && transactions.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </p>
      )}
    </div>
  );
}
