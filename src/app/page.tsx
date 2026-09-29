import { Suspense } from "react";
import { DashboardClient } from "./DashboardClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      items: true,
      cashInflow: true,
    },
    orderBy: { date: "desc" },
  });

  return pos.map((po) => {
    const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
    const profit = totalCashInflow - po.totalCost;
    const itemSummary = po.items.map((i) => `${i.itemName} (${i.qty} ${i.unit})`).join(", ");

    return {
      id: po.id,
      poNumber: po.poNumber,
      date: po.date.toISOString(),
      supplierName: po.supplierName,
      status: po.status as "OUTSTANDING" | "PARTIAL" | "CLOSED",
      totalCost: po.totalCost,
      totalCashInflow,
      profit,
      itemSummary,
      items: po.items.map((i) => ({
        itemName: i.itemName,
        qty: i.qty,
        unit: i.unit,
      })),
    };
  });
}

async function getMetrics() {
  const pos = await prisma.purchaseOrder.findMany({
    include: { cashInflow: true },
  });

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const outstandingPOs = pos.filter((p) => p.status !== "CLOSED");
  const totalOutstandingModal = outstandingPOs.reduce((sum, p) => sum + p.totalCost, 0);
  const totalCashInflow = pos.reduce((sum, p) => sum + p.cashInflow.reduce((s, c) => s + c.amount, 0), 0);
  const totalOutstandingReceivables = outstandingPOs.reduce(
    (sum, p) => sum + p.totalCost - p.cashInflow.reduce((s, c) => s + c.amount, 0),
    0
  );
  const closedPOs = pos.filter((p) => p.status === "CLOSED");
  const monthlyProfit = closedPOs
    .filter((p) => p.cashInflow.some((c) => new Date(c.receivedDate) >= thisMonthStart))
    .reduce((sum, p) => sum + p.cashInflow.reduce((s, c) => s + c.amount, 0) - p.totalCost, 0);
  const closedPOCount = closedPOs.length;

  return {
    activeCapital: 80_000_000 - totalOutstandingModal,
    outstandingReceivables: totalOutstandingReceivables,
    monthlyProfit,
    closedPOCount,
  };
}

export default async function Page() {
  const [data, metrics] = await Promise.all([getDashboardData(), getMetrics()]);

  return (
    <DashboardClient
      initialData={data}
      initialMetrics={metrics}
    />
  );
}