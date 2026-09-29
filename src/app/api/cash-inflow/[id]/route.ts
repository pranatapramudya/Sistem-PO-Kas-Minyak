import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePOStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const inflow = await prisma.cashInflow.findUnique({
      where: { id },
      include: { po: { include: { cashInflow: true } } },
    });

    if (!inflow) {
      return NextResponse.json({ error: "Data kas masuk tidak ditemukan" }, { status: 404 });
    }

    const poId = inflow.poId;
    const poTotalCost = inflow.po.totalCost;
    const remainingInflows = inflow.po.cashInflow.filter((c) => c.id !== id);
    const newTotalCashInflow = remainingInflows.reduce((sum, c) => sum + c.amount, 0);
    const newStatus = calculatePOStatus(poTotalCost, newTotalCashInflow);

    await prisma.$transaction([
      prisma.cashInflow.delete({ where: { id } }),
      prisma.purchaseOrder.update({
        where: { id: poId },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("DELETE /api/cash-inflow/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus kas masuk" }, { status: 500 });
  }
}
