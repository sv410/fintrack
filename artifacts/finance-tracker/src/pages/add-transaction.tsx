import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  useCreateTransaction,
  useListCategories,
  getListCategoriesQueryKey,
  getListTransactionsQueryKey,
  getGetSummaryQueryKey,
  getGetSpendingByCategoryQueryKey,
  getGetInsightQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, TrendingDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }).max(50),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, { message: "Date is required" }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTransaction() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const createTx = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetInsightQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setSuccess(true);
        setTimeout(() => {
          setLocation("/transactions");
        }, 800);
      },
      onError: () =>
        toast({ title: "Failed to save", variant: "destructive" }),
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      category: "",
      type: "expense",
      date: format(new Date(), "yyyy-MM-dd"),
      note: "",
    },
  });

  const txType = form.watch("type");

  function onSubmit(data: FormValues) {
    createTx.mutate({ data });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation(-1)}
          className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            New Entry
          </p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Add Transaction
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Type Toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Type
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {(["expense", "income"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.onChange(t)}
                          className={cn(
                            "flex items-center justify-center gap-2.5 h-12 rounded-xl border text-sm font-semibold transition-all",
                            field.value === t
                              ? t === "income"
                                ? "border-income/50 bg-income/10 text-income"
                                : "border-expense/50 bg-expense/10 text-expense"
                              : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
                          )}
                        >
                          {t === "income" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className={cn(
                          "pl-8 h-12 text-lg font-display font-bold bg-background border-border focus-visible:ring-primary",
                          txType === "income"
                            ? "focus-visible:ring-income/50"
                            : "focus-visible:ring-expense/50"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category + Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Category
                    </FormLabel>
                    <FormControl>
                      <div className="relative mt-1">
                        <Input
                          type="text"
                          placeholder="e.g. Groceries"
                          list="cat-suggestions"
                          className="h-12 bg-background border-border focus-visible:ring-primary"
                          {...field}
                        />
                        <datalist id="cat-suggestions">
                          {categories?.map((c) => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-12 mt-1 bg-background border-border focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Note{" "}
                    <span className="normal-case text-muted-foreground/60 font-normal tracking-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What was this for?"
                      className="h-12 mt-1 bg-background border-border focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={createTx.isPending || success}
                className={cn(
                  "w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  success
                    ? "bg-income text-white"
                    : txType === "income"
                    ? "bg-income text-white hover:bg-income/90 shadow-md shadow-income/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
                  (createTx.isPending || success) && "opacity-80 cursor-not-allowed"
                )}
              >
                {success ? (
                  <>
                    <Check className="w-4 h-4" /> Saved
                  </>
                ) : createTx.isPending ? (
                  "Saving..."
                ) : (
                  `Save ${txType === "income" ? "Income" : "Expense"}`
                )}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
