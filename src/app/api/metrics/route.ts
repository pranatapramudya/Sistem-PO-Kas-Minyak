import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: { cashInflow: true },
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const outstandingPOs = pos.filter((p) => p.status !== "CLOSED");
    const totalOutstandingModal = outstandingPOs.reduce((sum, p) => sum + p.totalCost, 0);
    const totalOutstandingReceivables = outstandingPOs.reduce(
      (sum, p) => sum + p.totalCost - p.cashInflow.reduce((s, c) => s + c.amount, 0),
      0
    );
    const closedPOs = pos.filter((p) => p.status === "CLOSED");
    const monthlyProfit = closedPOs
      .filter((p) => p.cashInflow.some((c) => new Date(c.receivedDate) >= thisMonthStart))
      .reduce((sum, p) => sum + p.cashInflow.reduce((s, c) => s + c.amount, 0) - p.totalCost, 0);
    const closedPOCount = closedPOs.length;

    return NextResponse.json({
      activeCapital: 80_000_000 - totalOutstandingModal,
      outstandingReceivables: totalOutstandingReceivables,
      monthlyProfit,
      closedPOCount,
    });
  } catch (error) {
    console.error("GET /api/metrics error:", error);
    return NextResponse.json({ error: "Gagal mengambil metrik" }, { status: 500 });
  }
}