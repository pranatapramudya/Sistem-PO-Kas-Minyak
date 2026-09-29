"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import {
  Eye,
  Printer,
  Trash2,
  PlusCircle,
  Calendar,
  Building,
  Package,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface POTableData {
  id: string;
  poNumber: string;
  date: string | Date;
  supplierName: string;
  status: "OUTSTANDING" | "PARTIAL" | "CLOSED";
  totalCost: number;
  totalCashInflow: number;
  profit: number;
  itemSummary: string;
  items?: { itemName: string; qty: number; unit: string; unitPrice?: number }[];
  expectedRevenue?: number;
  notes?: string;
}

export interface POTableRowProps {
  po: POTableData;
  onView: (id: string) => void;
  onEdit?: (po: POTableData) => void;
  onPrint: (id: string) => void;
  onDelete: (po: POTableData) => void;
  onRecordCashInflow?: (po: POTableData) => void;
}

const statusConfig = {
  OUTSTANDING: {
    label: "Pending",
    variant: "warning" as const,
    description: "Pending: Belum ada pembayaran masuk sama sekali (Kas masuk = Rp 0)",
  },
  PARTIAL: {
    label: "Partial (Cicil)",
    variant: "destructive" as const,
    description: "Partial: Pembayaran sudah masuk sebagian, belum lunas",
  },
  CLOSED: {
    label: "Lunas",
    variant: "success" as const,
    description: "Lunas: Pembayaran telah diterima 100% penuh",
  },
};

// Desktop Table Row
export function POTableRow({ po, onView, onEdit, onPrint, onDelete, onRecordCashInflow }: POTableRowProps) {
  const config = statusConfig[po.status] || statusConfig.OUTSTANDING;

  return (
    <TableRow className="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <TableCell className="whitespace-nowrap font-medium text-xs text-slate-500">
        {formatDateIndo(po.date)}
      </TableCell>
      <TableCell className="py-3">
        <div className="font-bold text-slate-900 font-mono text-sm tracking-tight">
          {po.poNumber}
        </div>
        <div className="text-xs mt-0.5 line-clamp-1">
          <span className="font-bold text-slate-800">{po.supplierName}</span> — <span className="font-medium text-slate-600">{po.itemSummary}</span>
        </div>
      </TableCell>
      <TableCell className="text-right text-rose-600 font-mono font-bold whitespace-nowrap text-sm">
        {formatRupiah(po.totalCost)}
      </TableCell>
      <TableCell className="text-right text-emerald-600 font-mono font-bold whitespace-nowrap text-sm">
        {formatRupiah(po.totalCashInflow)}
      </TableCell>
      <TableCell
        className="text-right font-mono font-black whitespace-nowrap text-sm"
        style={{ color: po.profit >= 0 ? "#16a34a" : "#dc2626" }}
      >
        {formatRupiah(po.profit)}
      </TableCell>
      <TableCell className="text-center w-[110px]">
        <Badge variant={config.variant} className="text-xs font-bold px-2 py-0.5 cursor-help" title={config.description}>
          {config.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right pr-4 w-[260px] whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {onRecordCashInflow && po.status !== "CLOSED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRecordCashInflow(po)}
              title="Catat Kas Masuk"
              className="h-8 px-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1 stroke-[2.2]" /> Kas Masuk
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(po.id)}
            title="Lihat Detail"
            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(po)}
              title="Edit PO"
              className="h-8 w-8 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPrint(po.id)}
            title="Cetak PO"
            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(po)}
            title="Hapus"
            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Mobile Card Component
export function POMobileCard({ po, onView, onEdit, onPrint, onDelete, onRecordCashInflow }: POTableRowProps) {
  const config = statusConfig[po.status] || statusConfig.OUTSTANDING;

  return (
    <Card className="border border-slate-200/90 shadow-xs bg-white rounded-xl overflow-hidden hover:shadow-sm transition-all">
      <CardContent className="p-3.5 space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <div className="font-mono font-black text-base text-slate-900">
              {po.poNumber}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateIndo(po.date)}
            </div>
          </div>
          <Badge variant={config.variant} className="text-xs font-bold px-2.5 py-0.5 cursor-help" title={config.description}>
            {config.label}
          </Badge>
        </div>

        {/* Supplier & Items */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <Building className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{po.supplierName}</span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-700 text-xs font-medium">
            <Package className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{po.itemSummary}</span>
          </div>
        </div>

        {/* Financial Numbers Breakdown: Full width so currency never truncates */}
        <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-bold text-xs">Modal PO:</span>
            <span className="font-mono font-black text-sm text-rose-600">
              {formatRupiah(po.totalCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-bold text-xs">Kas Masuk:</span>
            <span className="font-mono font-black text-sm text-emerald-600">
              {formatRupiah(po.totalCashInflow)}
            </span>
          </div>
          {po.status !== "CLOSED" && (
            <div className="flex items-center justify-between">
              <span className="text-amber-800 font-bold text-xs">Sisa Piutang:</span>
              <span className="font-mono font-black text-sm text-amber-600">
                {formatRupiah(Math.max(0, po.totalCost - po.totalCashInflow))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80">
            <span className="text-slate-900 font-extrabold text-xs sm:text-sm">Laba Bersih:</span>
            <span
              className="font-mono font-black text-sm sm:text-base"
              style={{ color: po.profit >= 0 ? "#16a34a" : "#dc2626" }}
            >
              {formatRupiah(po.profit)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1 gap-1.5">
          <div className="flex items-center gap-1 flex-1">
            {onRecordCashInflow && po.status !== "CLOSED" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecordCashInflow(po)}
                className="h-9 flex-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300"
              >
                <PlusCircle className="h-4 w-4 mr-1 stroke-[2.2]" /> + Kas Masuk
              </Button>
            ) : (
              <span className="text-xs text-emerald-800 font-bold px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                ✓ Lunas Penuh
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(po.id)}
              className="h-9 px-3 text-xs font-bold text-slate-700"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Detail
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(po)}
                className="h-8 w-8 text-slate-700 hover:text-amber-600"
                title="Edit PO"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPrint(po.id)}
              className="h-8 w-8 text-slate-700"
              title="Cetak PO"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(po)}
              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
              title="Hapus"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PODashboardTableProps {
  data: POTableData[];
  onView: (id: string) => void;
  onEdit?: (po: POTableData) => void;
  onPrint: (id: string) => void;
  onDelete: (po: POTableData) => void;
  onRecordCashInflow?: (po: POTableData) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function PODashboardTable({
  data,
  onView,
  onEdit,
  onPrint,
  onDelete,
  onRecordCashInflow,
  loading,
  emptyMessage = "Belum ada transaksi PO tercatat",
}: PODashboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 whenever data length changes (e.g. search or filter changed)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const currentData = data.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-slate-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 px-4 text-slate-500 space-y-2 bg-white rounded-xl border border-slate-200">
        <Package className="h-10 w-10 mx-auto text-slate-300" />
        <p className="text-sm sm:text-base font-semibold text-slate-700">{emptyMessage}</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Klik tombol &quot;+ Buat PO&quot; di atas untuk mencatat pembelian minyak ke supplier.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      {/* Mobile Card List View (< md) - Clean, standalone cards with zero nested card borders */}
      <div className="block md:hidden space-y-3 w-full">
        {currentData.map((po) => (
          <POMobileCard
            key={po.id}
            po={po}
            onView={onView}
            onEdit={onEdit}
            onPrint={onPrint}
            onDelete={onDelete}
            onRecordCashInflow={onRecordCashInflow}
          />
        ))}

        {/* Mobile Pagination Control (only appears when > 10 transactions) */}
        {data.length > 0 && totalPages > 1 && (
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between text-xs mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="h-8 px-2.5 text-xs border-slate-200 text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <div className="text-center font-medium text-slate-600">
              <span className="font-bold text-slate-900 font-mono">Hal {validPage}</span> dari <span className="font-mono">{totalPages}</span>
              <p className="text-[10px] text-slate-400 font-mono">
                ({startIndex + 1}-{endIndex} dari {data.length} transaksi)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="h-8 px-2.5 text-xs border-slate-200 text-slate-700 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table View (>= md) - Clean table inside rounded card */}
      <div className="hidden md:block border border-slate-200 shadow-xs bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[110px] text-xs font-semibold uppercase tracking-wider text-slate-600">Tanggal</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-600">No. PO & Supplier / Barang</TableHead>
                <TableHead className="w-[140px] text-right text-xs font-semibold uppercase tracking-wider text-rose-600">Modal PO</TableHead>
                <TableHead className="w-[140px] text-right text-xs font-semibold uppercase tracking-wider text-emerald-600">Kas Masuk</TableHead>
                <TableHead className="w-[140px] text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Laba Bersih</TableHead>
                <TableHead className="w-[110px] text-center text-xs font-semibold uppercase tracking-wider text-slate-600">Status</TableHead>
                <TableHead className="w-[260px] text-right pr-4 text-xs font-semibold uppercase tracking-wider text-slate-600">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((po) => (
                <POTableRow
                  key={po.id}
                  po={po}
                  onView={onView}
                  onEdit={onEdit}
                  onPrint={onPrint}
                  onDelete={onDelete}
                  onRecordCashInflow={onRecordCashInflow}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Desktop Table Pagination Footer */}
        {data.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Menampilkan</span>
              <span className="font-semibold text-slate-900 font-mono">
                {startIndex + 1}-{endIndex}
              </span>
              <span>dari</span>
              <span className="font-semibold text-slate-900 font-mono">{data.length}</span>
              <span>transaksi</span>
              <span className="text-slate-400">({pageSize} per halaman)</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={validPage <= 1}
                  className="h-8 px-2 text-xs border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validPage <= 1}
                  className="h-8 px-2.5 text-xs border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Sebelumnya
                </Button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      totalPages > 7 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - validPage) > 1
                    ) {
                      if (pageNum === 2 && validPage > 3) {
                        return <span key="dot-start" className="px-1 text-slate-400">...</span>;
                      }
                      if (pageNum === totalPages - 1 && validPage < totalPages - 2) {
                        return <span key="dot-end" className="px-1 text-slate-400">...</span>;
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={validPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs font-mono font-semibold ${validPage === pageNum
                            ? "bg-slate-900 text-white shadow-xs"
                            : "border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validPage >= totalPages}
                  className="h-8 px-2.5 text-xs border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  Selanjutnya
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validPage >= totalPages}
                  className="h-8 px-2 text-xs border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}