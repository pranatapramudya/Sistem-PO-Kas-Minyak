import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);

    const pos = await prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: { cashInflow: true },
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

    return NextResponse.json({
      activeCapital: totalOutstandingModal,
      outstandingReceivables: totalOutstandingReceivables,
      monthlyProfit,
      closedPOCount,
    });
  } catch (error) {
    console.error("GET /api/metrics error:", error);
    return NextResponse.json({ error: "Gagal mengambil metrik" }, { status: 500 });
  }
}