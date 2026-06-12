import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useListTransactions, 
  getListTransactionsQueryKey,
  useDeleteTransaction,
  useListCategories,
  getListCategoriesQueryKey,
  getGetSummaryQueryKey,
  getGetSpendingByCategoryQueryKey,
  getGetInsightQueryKey,
  ListTransactionsType
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { Trash2, Search, FilterX, ReceiptText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Transactions() {
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<ListTransactionsType | "all">("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const { data: transactions, isLoading } = useListTransactions({
    category: category || undefined,
    type: type !== "all" ? type as ListTransactionsType : undefined
  }, {
    query: { 
      queryKey: getListTransactionsQueryKey({ 
        category: category || undefined, 
        type: type !== "all" ? type as ListTransactionsType : undefined 
      }) 
    }
  });

  const deleteTx = useDeleteTransaction({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Transaction deleted",
          description: "Your record has been removed.",
        });
        // Invalidate everything to keep UI in sync
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetInsightQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
      onError: () => {
        toast({
          title: "Failed to delete",
          description: "Something went wrong.",
          variant: "destructive"
        });
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground tracking-tight mb-2">Transactions</h1>
          <p className="text-muted-foreground text-lg">Your complete financial history.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Type</Label>
            <Select 
              value={type} 
              onValueChange={(val: any) => setType(val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories_dummy">
                  <span className="text-muted-foreground">All Categories</span>
                </SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => { setCategory(""); setType("all"); }}
              className="w-full sm:w-auto"
              disabled={!category && type === "all"}
            >
              <FilterX className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : transactions?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No transactions found</h3>
              <p className="mt-1">Try adjusting your filters or adding a new entry.</p>
            </div>
          ) : (
            transactions?.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    tx.type === 'income' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {tx.category}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground gap-2 mt-0.5">
                      <span>{format(new Date(tx.date), "MMM d, yyyy")}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px] sm:max-w-[300px]">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "font-medium font-serif",
                    tx.type === 'income' ? "text-foreground" : "text-foreground"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => deleteTx.mutate({ id: tx.id })}
                    disabled={deleteTx.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}