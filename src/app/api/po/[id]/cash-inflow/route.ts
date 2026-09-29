import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadFile, validateUploadFile } from "@/lib/upload";
import { cashInflowSchema } from "@/lib/validations";
import { calculatePOStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await request.formData();

    const amount = parseFloat(formData.get("amount") as string);
    const receivedDate = formData.get("receivedDate") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const notes = (formData.get("notes") as string) || "";
    const proofFile = formData.get("proofFile") as File | null;

    const parsed = cashInflowSchema.safeParse({
      poId: id,
      amount,
      receivedDate,
      paymentMethod,
      notes,
      proofFile,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Handle file upload
    let proofFileUrl: string | null = null;
    if (proofFile && proofFile.size > 0) {
      const validation = validateUploadFile(proofFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      proofFileUrl = await saveUploadFile(proofFile);
    }

    // Get existing PO to calculate new status
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { cashInflow: true },
    });

    if (!po) {
      return NextResponse.json({ error: "PO tidak ditemukan" }, { status: 404 });
    }

    const existingCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
    const newTotalCashInflow = existingCashInflow + amount;
    const newStatus = calculatePOStatus(po.totalCost, newTotalCashInflow);

    // Create cash inflow and update PO status in a transaction
    const [cashInflow] = await prisma.$transaction([
      prisma.cashInflow.create({
        data: {
          poId: id,
          amount,
          receivedDate: new Date(receivedDate),
          paymentMethod: paymentMethod as "TRANSFER_BANK" | "TUNAI",
          proofFileUrl,
          notes,
        },
      }),
      prisma.purchaseOrder.update({
        where: { id },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({ success: true, cashInflow, status: newStatus });
  } catch (error) {
    console.error("POST /api/po/[id]/cash-inflow error:", error);
    return NextResponse.json({ error: "Gagal mencatat kas masuk" }, { status: 500 });
  }
}
