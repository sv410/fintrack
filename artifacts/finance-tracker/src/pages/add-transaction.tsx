import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateTransaction, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, ChevronDown } from "lucide-react";

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
  
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const createTx = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Entry saved",
          description: "Your transaction has been recorded.",
        });
        queryClient.invalidateQueries();
        setLocation("/transactions");
      },
      onError: () => {
        toast({
          title: "Failed to save",
          description: "There was an error saving your transaction.",
          variant: "destructive"
        });
      }
    }
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

  function onSubmit(data: FormValues) {
    createTx.mutate({ data });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation(-1)}
          className="rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">New Entry</h1>
        </div>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif">Transaction Details</CardTitle>
          <CardDescription>Log a new income or expense manually.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 bg-muted/30 border border-border p-4 rounded-xl flex-1 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-base w-full">
                            Expense
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 bg-muted/30 border border-border p-4 rounded-xl flex-1 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-base w-full">
                            Income
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            $
                          </div>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="pl-8 text-lg font-serif h-12"
                            {...field} 
                          />
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
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="text" 
                          placeholder="e.g. Groceries, Rent, Salary" 
                          list="categories-list"
                          className="h-12"
                          {...field} 
                        />
                        <datalist id="categories-list">
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
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What was this for?" 
                        className="h-12"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={createTx.isPending}
                  className="w-full sm:w-auto font-medium tracking-wide rounded-full px-8"
                >
                  {createTx.isPending ? "Saving..." : (
                    <>
                      Save Entry <CheckCircle2 className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}