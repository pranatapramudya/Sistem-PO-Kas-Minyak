import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { formatRupiah, formatDateIndo, terbilang } from "@/lib/utils";

import { getTenantIdFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    const year = searchParams.get("year");   // YYYY

    const pos = await prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        items: true,
        cashInflow: true,
      },
      orderBy: { date: "desc" },
    });

    // Filter by month/year if provided
    let filteredPOs = pos;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      filteredPOs = pos.filter((p) => p.date.getFullYear() === y && p.date.getMonth() + 1 === m);
    } else if (year) {
      const y = parseInt(year);
      filteredPOs = pos.filter((p) => p.date.getFullYear() === y);
    }

    // Prepare workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Rekap Harian
    const dailyData = filteredPOs.map((po, idx) => {
      const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
      const profit = totalCashInflow - po.totalCost;
      const itemSummary = po.items.map((i) => `${i.itemName} (${i.qty} ${i.unit})`).join(", ");

      const statusLabel = {
        OUTSTANDING: "Outstanding",
        PARTIAL: "Partial",
        CLOSED: "Lunas",
      }[po.status];

      return {
        No: idx + 1,
        "Tanggal": formatDateIndo(po.date),
        "No. PO": po.poNumber,
        "Supplier": po.supplierName,
        "Barang (Qty)": itemSummary,
        "Modal PO": po.totalCost,
        "Kas Masuk": totalCashInflow,
        "Laba Bersih": profit,
        "Status": statusLabel,
      };
    });

    const ws1 = XLSX.utils.json_to_sheet(dailyData);
    // Set column widths
    ws1["!cols"] = [
      { wch: 5 },   // No
      { wch: 15 },  // Tanggal
      { wch: 20 },  // No. PO
      { wch: 25 },  // Supplier
      { wch: 40 },  // Barang
      { wch: 18 },  // Modal PO
      { wch: 18 },  // Kas Masuk
      { wch: 18 },  // Laba Bersih
      { wch: 15 },  // Status
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Rekap Harian");

    // Sheet 2: Rekap Bulanan (group by month)
    const monthlyMap = new Map<string, typeof dailyData>();
    filteredPOs.forEach((po) => {
      const key = `${po.date.getFullYear()}-${String(po.date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, []);
      const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
      const profit = totalCashInflow - po.totalCost;
      const itemSummary = po.items.map((i) => `${i.itemName} (${i.qty} ${i.unit})`).join(", ");

      const statusLabel = {
        OUTSTANDING: "Outstanding",
        PARTIAL: "Partial",
        CLOSED: "Lunas",
      }[po.status];

      monthlyMap.get(key)!.push({
        No: monthlyMap.get(key)!.length + 1,
        "Tanggal": formatDateIndo(po.date),
        "No. PO": po.poNumber,
        "Supplier": po.supplierName,
        "Barang (Qty)": itemSummary,
        "Modal PO": po.totalCost,
        "Kas Masuk": totalCashInflow,
        "Laba Bersih": profit,
        "Status": statusLabel,
      });
    });

    const monthlyData = Array.from(monthlyMap.entries()).flatMap(([monthKey, rows]) => [
      { No: "", Tanggal: `=== BULAN ${monthKey} ===`, "No. PO": "", Supplier: "", "Barang (Qty)": "", "Modal PO": "", "Kas Masuk": "", "Laba Bersih": "", Status: "" },
      ...rows,
      { No: "", Tanggal: "SUBTOTAL", "No. PO": "", Supplier: "", "Barang (Qty)": "",
        "Modal PO": rows.reduce((s, r) => s + r["Modal PO"], 0),
        "Kas Masuk": rows.reduce((s, r) => s + r["Kas Masuk"], 0),
        "Laba Bersih": rows.reduce((s, r) => s + r["Laba Bersih"], 0),
        Status: "" },
      { No: "", Tanggal: "", "No. PO": "", Supplier: "", "Barang (Qty)": "", "Modal PO": "", "Kas Masuk": "", "Laba Bersih": "", Status: "" },
    ]);

    const ws2 = XLSX.utils.json_to_sheet(monthlyData);
    ws2["!cols"] = ws1["!cols"];
    XLSX.utils.book_append_sheet(wb, ws2, "Rekap Bulanan");

    // Sheet 3: Outstanding Only
    const outstandingPOs = filteredPOs.filter((p) => p.status !== "CLOSED");
    const outstandingData = outstandingPOs.map((po, idx) => {
      const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
      const profit = totalCashInflow - po.totalCost;
      const remaining = po.totalCost - totalCashInflow;
      const itemSummary = po.items.map((i) => `${i.itemName} (${i.qty} ${i.unit})`).join(", ");

      return {
        No: idx + 1,
        "Tanggal": formatDateIndo(po.date),
        "No. PO": po.poNumber,
        "Supplier": po.supplierName,
        "Barang (Qty)": itemSummary,
        "Modal PO": po.totalCost,
        "Kas Masuk": totalCashInflow,
        "Sisa Piutang": remaining,
        "Status": po.status === "OUTSTANDING" ? "Outstanding" : "Partial",
      };
    });

    const ws3 = XLSX.utils.json_to_sheet(outstandingData);
    ws3["!cols"] = [
      { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 40 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws3, "Outstanding");

    // Sheet 4: Laba Detail
    const profitData = filteredPOs.map((po, idx) => {
      const totalCashInflow = po.cashInflow.reduce((sum, c) => sum + c.amount, 0);
      const profit = totalCashInflow - po.totalCost;
      const itemSummary = po.items.map((i) => `${i.itemName} (${i.qty} ${i.unit})`).join(", ");

      return {
        No: idx + 1,
        "Tanggal": formatDateIndo(po.date),
        "No. PO": po.poNumber,
        "Supplier": po.supplierName,
        "Barang": itemSummary,
        "Modal PO": po.totalCost,
        "Kas Masuk": totalCashInflow,
        "Laba/Rugi": profit,
        "Status": po.status === "CLOSED" ? "Lunas" : po.status === "PARTIAL" ? "Partial" : "Outstanding",
        "Target Jual": po.expectedRevenue,
        "Selisih Target": po.expectedRevenue - totalCashInflow,
      };
    });

    const ws4 = XLSX.utils.json_to_sheet(profitData);
    ws4["!cols"] = [
      { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 40 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, ws4, "Laba Detail");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = `Rekap-Trading-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export/excel error:", error);
    return NextResponse.json({ error: "Gagal export Excel" }, { status: 500 });
  }
}