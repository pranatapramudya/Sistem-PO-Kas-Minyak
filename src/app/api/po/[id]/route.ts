import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadFile, validateUploadFile } from "@/lib/upload";
import { cashInflowSchema, createPOSchema } from "@/lib/validations";
import { calculatePOStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET single PO
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
        cashInflow: {
          orderBy: { receivedDate: "desc" },
        },
      },
    });

    if (!po) {
      return NextResponse.json({ error: "PO tidak ditemukan" }, { status: 404 });
    }

    const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
    const profit = totalCashInflow - po.totalCost;

    return NextResponse.json({
      ...po,
      totalCashInflow,
      profit,
    });
  } catch (error) {
    console.error("GET /api/po/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil detail PO" }, { status: 500 });
  }
}

// PUT /api/po/[id] - Update PO
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { cashInflow: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "PO tidak ditemukan" }, { status: 404 });
    }

    const formData = await request.formData();
    const date = formData.get("date") as string;
    const supplierName = formData.get("supplierName") as string;
    const itemsJson = formData.get("items") as string;
    const expectedRevenue = parseFloat(formData.get("expectedRevenue") as string) || 0;
    const notes = (formData.get("notes") as string) || "";
    const proofFile = formData.get("proofFile") as File | null;

    const parsed = createPOSchema.safeParse({
      date,
      supplierName,
      items: JSON.parse(itemsJson),
      expectedRevenue,
      notes,
      proofFile,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    let proofFileUrl = existing.proofFileUrl;
    if (proofFile && proofFile.size > 0) {
      const validation = validateUploadFile(proofFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      proofFileUrl = await saveUploadFile(proofFile);
    }

    const items = parsed.data.items;
    const totalCost = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const totalCashInflow = existing.cashInflow.reduce((sum, c) => sum + c.amount, 0);
    const newStatus = calculatePOStatus(totalCost, totalCashInflow);

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { poId: id } }),
      prisma.purchaseOrder.update({
        where: { id },
        data: {
          date: new Date(date),
          supplierName,
          totalCost,
          expectedRevenue,
          proofFileUrl,
          notes,
          status: newStatus,
          items: {
            create: items.map((i) => ({
              itemName: i.itemName,
              qty: i.qty,
              unit: i.unit,
              unitPrice: i.unitPrice,
              subtotal: i.qty * i.unitPrice,
            })),
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/po/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui PO" }, { status: 500 });
  }
}

// DELETE PO
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.purchaseOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/po/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus PO" }, { status: 500 });
  }
}

// POST Cash Inflow (alias support)
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

    // Create cash inflow and update PO status
    await prisma.$transaction([
      prisma.cashInflow.create({
        data: {
          poId: id,
          amount,
          receivedDate: new Date(receivedDate),
          paymentMethod: paymentMethod as "TRANSFER_BANK" | "TUNAI",
          proofFileUrl,
          notes,
          tenantId: po.tenantId,
        },
      }),
      prisma.purchaseOrder.update({
        where: { id },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("POST /api/po/[id] error:", error);
    return NextResponse.json({ error: "Gagal mencatat kas masuk" }, { status: 500 });
  }
}