import { cookies } from "next/headers";
import { DashboardClient } from "./DashboardClient";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, getSessionData, DEFAULT_TENANT_ID, getTenantById } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getDashboardDataAndMetrics(tenantId: string) {
  const pos = await prisma.purchaseOrder.findMany({
    where: { tenantId },
    include: {
      items: true,
      cashInflow: true,
    },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const outstandingPOs = pos.filter((p) => p.status !== "CLOSED");
  const totalOutstandingModal = outstandingPOs.reduce((sum, p) => sum + p.totalCost, 0);
  const totalOutstandingReceivables = outstandingPOs.reduce(
    (sum, p) => sum + Math.max(0, p.totalCost - p.cashInflow.reduce((s, c) => s + c.amount, 0)),
    0
  );
  const closedPOs = pos.filter((p) => p.status === "CLOSED");
  const monthlyProfit = closedPOs
    .filter((p) => p.cashInflow.some((c) => new Date(c.receivedDate) >= thisMonthStart))
    .reduce((sum, p) => sum + p.cashInflow.reduce((s, c) => s + c.amount, 0) - p.totalCost, 0);
  const closedPOCount = closedPOs.length;

  const data = pos.map((po) => {
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

  return {
    data,
    metrics: {
      activeCapital: totalOutstandingModal,
      outstandingReceivables: totalOutstandingReceivables,
      monthlyProfit,
      closedPOCount,
    },
  };
}

export default async function Page() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  const session = await getSessionData(sessionToken);
  const tenantId = session.valid && session.tenantId ? session.tenantId : DEFAULT_TENANT_ID;

  const [{ data, metrics }, tenant] = await Promise.all([
    getDashboardDataAndMetrics(tenantId),
    getTenantById(tenantId),
  ]);

  return (
    <DashboardClient
      initialData={data}
      initialMetrics={metrics}
      tenant={tenant ? {
        id: tenant.id,
        companyName: tenant.companyName,
        ownerName: tenant.ownerName,
        identifier: tenant.identifier,
      } : null}
    />
  );
}