import { pgTable, serial, text, numeric, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.number().min(0.01),
    category: z.string().min(1),
    type: z.enum(["income", "expense"]),
    date: z.string().min(1),
    note: z.string().optional(),
  });

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
