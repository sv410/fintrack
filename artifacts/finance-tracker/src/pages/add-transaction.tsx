import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  useCreateTransaction, useListCategories, getListCategoriesQueryKey,
  getListTransactionsQueryKey, getGetSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetInsightQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, TrendingDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const schema = z.object({
  amount: z.coerce.number().positive({ message: "Must be greater than 0" }),
  category: z.string().min(1, { message: "Required" }).max(50),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, { message: "Required" }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const fieldStyle: React.CSSProperties = {
  height: "48px",
  borderRadius: "12px",
  border: "1px solid hsl(225 18% 18%)",
  background: "hsl(230 25% 7%)",
  color: "hsl(210 40% 97%)",
  fontSize: "0.9rem",
  padding: "0 14px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const fieldFocusStyle: React.CSSProperties = {
  borderColor: "hsl(160 80% 50% / 0.5)",
  boxShadow: "0 0 0 3px hsl(160 80% 50% / 0.08)",
};

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-expense">{error}</p>}
    </div>
  );
}

export function AddTransaction() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [done, setDone] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const createTx = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetInsightQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setDone(true);
        setTimeout(() => setLocation("/transactions"), 900);
      },
      onError: () => toast({ title: "Failed to save", variant: "destructive" }),
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" as unknown as number, category: "", type: "expense", date: format(new Date(), "yyyy-MM-dd"), note: "" },
  });

  const txType = form.watch("type");
  const isIncome = txType === "income";

  const accentColor = isIncome ? "hsl(160 80% 50%)" : "hsl(0 75% 58%)";
  const accentBg = isIncome ? "hsl(160 80% 50% / 0.1)" : "hsl(0 75% 58% / 0.1)";

  function onSubmit(data: FormValues) {
    createTx.mutate({ data });
  }

  const getFocusStyle = (name: string) =>
    focused === name ? { ...fieldStyle, ...fieldFocusStyle } : fieldStyle;

  return (
    <div className="max-w-lg mx-auto space-y-6 pt-1">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: "hsl(225 18% 14%)", border: "1px solid hsl(225 18% 20%)", color: "hsl(215 20% 55%)" }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">New Entry</p>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Add Transaction</h1>
        </div>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "hsl(228 22% 10% / 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid hsl(225 18% 16% / 0.8)",
          boxShadow: "0 8px 40px hsl(230 25% 6% / 0.5)",
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Type toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type</label>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {(["expense", "income"] as const).map(t => {
                        const active = field.value === t;
                        const tColor = t === "income" ? "hsl(160 80% 50%)" : "hsl(0 75% 58%)";
                        const tBg = t === "income" ? "hsl(160 80% 50% / 0.12)" : "hsl(0 75% 58% / 0.12)";
                        const tBorder = t === "income" ? "hsl(160 80% 50% / 0.35)" : "hsl(0 75% 58% / 0.35)";
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => field.onChange(t)}
                            className="flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
                            style={
                              active
                                ? { background: tBg, border: `1px solid ${tBorder}`, color: tColor }
                                : { background: "hsl(230 25% 7%)", border: "1px solid hsl(225 18% 18%)", color: "hsl(215 20% 50%)" }
                            }
                          >
                            {t === "income"
                              ? <TrendingUp className="w-4 h-4" style={active ? { color: tColor } : {}} />
                              : <TrendingDown className="w-4 h-4" style={active ? { color: tColor } : {}} />}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        );
                      })}
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
                  <Field label="Amount" error={form.formState.errors.amount?.message}>
                    <FormControl>
                      <div className="relative">
                        <span
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold select-none"
                          style={{ color: accentColor }}
                        >
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          style={{
                            ...getFocusStyle("amount"),
                            paddingLeft: "28px",
                            fontSize: "1.25rem",
                            fontFamily: "var(--app-font-display)",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                          }}
                          onFocus={() => setFocused("amount")}
                          onBlur={() => setFocused(null)}
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </Field>
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
                    <Field label="Category" error={form.formState.errors.category?.message}>
                      <FormControl>
                        <div>
                          <input
                            type="text"
                            placeholder="e.g. Groceries"
                            list="cat-list"
                            style={getFocusStyle("category")}
                            onFocus={() => setFocused("category")}
                            onBlur={() => setFocused(null)}
                            {...field}
                          />
                          <datalist id="cat-list">
                            {categories?.map(c => <option key={c} value={c} />)}
                          </datalist>
                        </div>
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Field label="Date" error={form.formState.errors.date?.message}>
                      <FormControl>
                        <input
                          type="date"
                          style={getFocusStyle("date")}
                          onFocus={() => setFocused("date")}
                          onBlur={() => setFocused(null)}
                          {...field}
                        />
                      </FormControl>
                    </Field>
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
                  <Field label="Note (optional)">
                    <FormControl>
                      <input
                        type="text"
                        placeholder="What was this for?"
                        style={getFocusStyle("note")}
                        onFocus={() => setFocused("note")}
                        onBlur={() => setFocused(null)}
                        {...field}
                      />
                    </FormControl>
                  </Field>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={createTx.isPending || done}
                className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: done
                    ? "hsl(160 80% 50%)"
                    : `linear-gradient(135deg, ${accentColor}, ${isIncome ? "hsl(160 80% 38%)" : "hsl(0 75% 45%)"})`,
                  color: done || isIncome ? "hsl(230 25% 6%)" : "white",
                  boxShadow: done ? "none" : `0 0 24px ${accentColor.replace(")", " / 0.3)")}`,
                  opacity: createTx.isPending && !done ? 0.9 : 1,
                }}
              >
                {done ? (
                  <><Check className="w-4 h-4" strokeWidth={3} /> Saved!</>
                ) : createTx.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  `Save ${isIncome ? "Income" : "Expense"}`
                )}
              </button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
