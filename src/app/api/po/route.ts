import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePONumber } from "@/lib/utils";
import { saveUploadFile, validateUploadFile } from "@/lib/upload";
import { createPOSchema } from "@/lib/validations";
import { getTenantIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);

    const pos = await prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        items: true,
        cashInflow: true,
      },
      orderBy: { date: "desc" },
    });

    const data = pos.map((po) => {
      const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
      const profit = totalCashInflow - po.totalCost;
      const itemSummary = po.items.map((i) => `${i.itemName} (${i.qty} ${i.unit})`).join(", ");

      return {
        id: po.id,
        poNumber: po.poNumber,
        date: po.date.toISOString(),
        supplierName: po.supplierName,
        status: po.status,
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/po error:", error);
    return NextResponse.json({ error: "Gagal mengambil data PO" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const formData = await request.formData();

    const date = formData.get("date") as string;
    const supplierName = formData.get("supplierName") as string;
    const subject = formData.get("subject") as string | null;
    const deliveryTarget = formData.get("deliveryTarget") as string | null;
    const itemsJson = formData.get("items") as string;
    const expectedRevenue = parseFloat(formData.get("expectedRevenue") as string) || 0;
    const notes = (formData.get("notes") as string) || "";
    const proofFile = formData.get("proofFile") as File | null;

    // Validate
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

    // Handle file upload
    let proofFileUrl: string | null = null;
    if (proofFile && proofFile.size > 0) {
      const validation = validateUploadFile(proofFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      proofFileUrl = await saveUploadFile(proofFile);
    }

    // Generate PO Number scoped by tenant for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `PO-${year}${month}-`;

    const latestPO = await prisma.purchaseOrder.findFirst({
      where: {
        tenantId,
        poNumber: { startsWith: prefix },
      },
      orderBy: { poNumber: "desc" },
      select: { poNumber: true },
    });

    let nextSequence = 1;
    if (latestPO) {
      const parts = latestPO.poNumber.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    // Safety fallback: ensure generated number does not collide within this tenant
    let poNumber = `${prefix}${String(nextSequence).padStart(4, "0")}`;
    while (
      await prisma.purchaseOrder.findFirst({
        where: {
          tenantId,
          poNumber,
        },
        select: { id: true },
      })
    ) {
      nextSequence++;
      poNumber = `${prefix}${String(nextSequence).padStart(4, "0")}`;
    }

    // Calculate total cost
    const items = parsed.data.items;
    const totalCost = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

    // Create PO with items scoped to active tenant
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        date: new Date(date),
        supplierName,
        subject: subject || "Pengadaan Stok Barang",
        deliveryTarget: deliveryTarget || "Gudang Utama",
        totalCost,
        expectedRevenue,
        proofFileUrl,
        notes,
        tenantId,
        items: {
          create: items.map((item) => ({
            itemName: item.itemName,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            subtotal: item.qty * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("POST /api/po error:", error);
    return NextResponse.json({ error: "Gagal membuat PO" }, { status: 500 });
  }
}