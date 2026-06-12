import { Router } from "express";
import { db, transactionsTable, insertTransactionSchema } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import {
  ListTransactionsQueryParams,
  CreateTransactionBody,
  DeleteTransactionParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/transactions", async (req, res) => {
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { category, type, dateFrom, dateTo } = parsed.data;

  const toDateStr = (d: Date | string | undefined): string | undefined =>
    d instanceof Date ? d.toISOString().slice(0, 10) : d;

  const conditions = [];
  if (category) conditions.push(eq(transactionsTable.category, category));
  if (type) conditions.push(eq(transactionsTable.type, type));
  if (dateFrom) conditions.push(gte(transactionsTable.date, toDateStr(dateFrom)!));
  if (dateTo) conditions.push(lte(transactionsTable.date, toDateStr(dateTo)!));

  const rows = await db
    .select()
    .from(transactionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${transactionsTable.date} DESC, ${transactionsTable.createdAt} DESC`);

  const result = rows.map((r) => ({
    ...r,
    amount: parseFloat(r.amount),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/transactions", async (req, res) => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { amount, category, type, date, note } = parsed.data;

  const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : String(date);

  const [row] = await db
    .insert(transactionsTable)
    .values({
      amount: String(amount),
      category,
      type,
      date: dateStr,
      note: note ?? null,
    })
    .returning();

  res.status(201).json({
    ...row,
    amount: parseFloat(row.amount),
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/transactions/:id", async (req, res) => {
  const parsed = DeleteTransactionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.status(204).send();
});

export default router;
