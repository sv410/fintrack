import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res) => {
  const rows = await db.select().from(transactionsTable);

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};

  for (const row of rows) {
    const amount = parseFloat(row.amount);
    if (row.type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      categoryTotals[row.category] = (categoryTotals[row.category] ?? 0) + amount;
    }
  }

  const netBalance = totalIncome - totalExpense;

  let topSpendingCategory: string | null = null;
  let topAmount = 0;
  for (const [cat, total] of Object.entries(categoryTotals)) {
    if (total > topAmount) {
      topAmount = total;
      topSpendingCategory = cat;
    }
  }

  res.json({
    totalIncome,
    totalExpense,
    netBalance,
    topSpendingCategory,
    transactionCount: rows.length,
  });
});

router.get("/summary/by-category", async (_req, res) => {
  const rows = await db
    .select({
      category: transactionsTable.category,
      total: sql<string>`SUM(${transactionsTable.amount}::numeric)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.type, "expense"))
    .groupBy(transactionsTable.category)
    .orderBy(sql`SUM(${transactionsTable.amount}::numeric) DESC`);

  res.json(
    rows.map((r) => ({
      category: r.category,
      total: parseFloat(r.total),
      count: r.count,
    })),
  );
});

router.get("/summary/insight", async (_req, res) => {
  const rows = await db.select().from(transactionsTable);

  if (rows.length === 0) {
    res.json({
      type: "no_data",
      message: "Add some transactions to see personalized insights about your spending.",
      severity: "info",
    });
    return;
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  let recentExpense = 0;
  let olderExpense = 0;

  for (const row of rows) {
    const amount = parseFloat(row.amount);
    const rowDate = new Date(row.date);
    if (row.type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      categoryTotals[row.category] = (categoryTotals[row.category] ?? 0) + amount;
      if (rowDate >= thirtyDaysAgo) {
        recentExpense += amount;
      } else {
        olderExpense += amount;
      }
    }
  }

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  let topCategory = "";
  let topAmount = 0;
  for (const [cat, total] of Object.entries(categoryTotals)) {
    if (total > topAmount) {
      topAmount = total;
      topCategory = cat;
    }
  }

  const topCategoryPct = totalExpense > 0 ? (topAmount / totalExpense) * 100 : 0;

  if (totalExpense > totalIncome && totalIncome > 0) {
    res.json({
      type: "overspending",
      message: `You're spending more than you earn. Your expenses exceed income by $${(totalExpense - totalIncome).toFixed(2)}. Consider reviewing your ${topCategory} spending.`,
      severity: "warning",
    });
    return;
  }

  if (savingsRate >= 20) {
    res.json({
      type: "good_savings",
      message: `Great job — you're saving ${savingsRate.toFixed(0)}% of your income. Keep it up to build a strong financial cushion.`,
      severity: "positive",
    });
    return;
  }

  if (topCategoryPct > 40 && topCategory) {
    res.json({
      type: "dominant_category",
      message: `${topCategory} accounts for ${topCategoryPct.toFixed(0)}% of your total spending. This single category dominates your budget.`,
      severity: "warning",
    });
    return;
  }

  if (recentExpense > olderExpense * 1.3 && olderExpense > 0) {
    res.json({
      type: "spending_increase",
      message: `Your spending in the last 30 days is significantly higher than before. Consider whether any recent expenses were one-time or recurring.`,
      severity: "warning",
    });
    return;
  }

  res.json({
    type: "on_track",
    message: `Your finances look balanced. You're saving ${savingsRate.toFixed(0)}% of your income and your spending is spread across ${Object.keys(categoryTotals).length} categories.`,
    severity: "info",
  });
});

router.get("/categories", async (_req, res) => {
  const rows = await db
    .selectDistinct({ category: transactionsTable.category })
    .from(transactionsTable)
    .orderBy(transactionsTable.category);

  res.json(rows.map((r) => r.category));
});

export default router;
