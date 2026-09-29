"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/modern-toast";
import {
  Printer,
  PlusCircle,
  FileText,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Building,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";

interface PODetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poId: string | null;
  onRecordCashInflow: (po: any) => void;
  onPrint: (id: string) => void;
  onEdit?: (po: any) => void;
  onRefresh?: () => void;
}

export function PODetailDialog({
  open,
  onOpenChange,
  poId,
  onRecordCashInflow,
  onPrint,
  onEdit,
  onRefresh,
}: PODetailDialogProps) {
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();
  const [inflowToDelete, setInflowToDelete] = useState<any | null>(null);
  const [deleteInflowLoading, setDeleteInflowLoading] = useState(false);

  const fetchDetail = () => {
    if (poId) {
      setLoading(true);
      fetch(`/api/po/${poId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setPo(data);
          }
        })
        .catch((err) => console.error("Error fetching PO detail:", err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (open && poId) {
      fetchDetail();
    } else {
      setPo(null);
    }
  }, [open, poId]);

  const handleConfirmDeleteInflow = async () => {
    if (!inflowToDelete) return;
    setDeleteInflowLoading(true);
    try {
      const res = await fetch(`/api/cash-inflow/${inflowToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kas masuk");
      toastSuccess(
        "Catatan Kas Masuk Dihapus",
        `Pelunasan sebesar ${formatRupiah(inflowToDelete.amount)} telah dihapus. Status PO telah dihitung ulang.`
      );
      setInflowToDelete(null);
      fetchDetail();
      onRefresh?.();
    } catch (err: any) {
      console.error(err);
      toastError("Gagal Menghapus Kas Masuk", err.message || "Terjadi kesalahan saat menghapus data.");
    } finally {
      setDeleteInflowLoading(false);
    }
  };

  if (!open) return null;

  const statusConfig = {
    OUTSTANDING: { label: "Outstanding", variant: "warning" as const },
    PARTIAL: { label: "Partial", variant: "destructive" as const },
    CLOSED: { label: "Lunas (Closed)", variant: "success" as const },
  };

  const status = (po?.status as keyof typeof statusConfig) || "OUTSTANDING";
  const statusInfo = statusConfig[status] || statusConfig.OUTSTANDING;
  const remaining = po ? Math.max(0, po.totalCost - po.totalCashInflow) : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white text-slate-900 border border-slate-200">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-xs sm:text-sm text-slate-500">Memuat detail Purchase Order...</p>
          </div>
        ) : po ? (
          <div className="space-y-4">
            {/* Header */}
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <DialogTitle className="text-lg sm:text-xl font-bold font-mono tracking-tight text-slate-900">
                      {po.poNumber}
                    </DialogTitle>
                    <Badge variant={statusInfo.variant} className="text-xs font-semibold">
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <DialogDescription className="mt-1 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateIndo(po.date)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {po.supplierName}
                    </span>
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        onEdit(po);
                      }}
                      className="h-8 text-xs border-slate-200 text-slate-700 hover:text-amber-600"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit PO
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => onPrint(po.id)} className="h-8 text-xs border-slate-200">
                    <Printer className="h-3.5 w-3.5 mr-1" /> Cetak PO
                  </Button>
                  {po.status !== "CLOSED" && (
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      onClick={() => {
                        onOpenChange(false);
                        onRecordCashInflow(po);
                      }}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" /> Catat Kas Masuk
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Financial Overview 2x2 on mobile, 1x4 on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-[10px] sm:text-xs text-rose-600 font-semibold uppercase">Total Modal</p>
                <p className="text-xs sm:text-base font-bold font-mono text-rose-700 mt-0.5 truncate">
                  {formatRupiah(po.totalCost)}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold uppercase">Kas Masuk</p>
                <p className="text-xs sm:text-base font-bold font-mono text-emerald-700 mt-0.5 truncate">
                  {formatRupiah(po.totalCashInflow || 0)}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[10px] sm:text-xs text-amber-600 font-semibold uppercase">Sisa Piutang</p>
                <p className="text-xs sm:text-base font-bold font-mono text-amber-700 mt-0.5 truncate">
                  {formatRupiah(remaining)}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Laba Bersih</p>
                <p
                  className="text-xs sm:text-base font-bold font-mono mt-0.5 truncate"
                  style={{ color: (po.profit || 0) >= 0 ? "#16a34a" : "#dc2626" }}
                >
                  {formatRupiah(po.profit || 0)}
                </p>
              </div>
            </div>

            {/* Rincian Item Barang */}
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
                <Package className="h-4 w-4 text-blue-600" /> Rincian Item Barang ({po.items?.length || 0})
              </h3>

              {/* Mobile Item Cards (< sm): zero horizontal scroll */}
              <div className="block sm:hidden space-y-2">
                {po.items?.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{item.itemName}</span>
                      <span className="font-mono text-slate-700">{item.qty} {item.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Harga: {formatRupiah(item.unitPrice)}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatRupiah(item.subtotal || item.qty * item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-800">Total Modal PO</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {formatRupiah(po.totalCost)}
                  </span>
                </div>
              </div>

              {/* Desktop Item Table (>= sm) */}
              <div className="hidden sm:block border border-slate-200 rounded-md overflow-x-auto bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left w-10">No</th>
                      <th className="px-3 py-2 text-left">Nama Barang</th>
                      <th className="px-3 py-2 text-center w-20">Qty</th>
                      <th className="px-3 py-2 text-center w-20">Satuan</th>
                      <th className="px-3 py-2 text-right w-28">Harga Satuan</th>
                      <th className="px-3 py-2 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {po.items?.map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{item.itemName}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                        <td className="px-3 py-2 text-center text-slate-500">{item.unit}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">
                          {formatRupiah(item.subtotal || item.qty * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right text-[11px] uppercase text-slate-700">
                        Total Modal PO
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-rose-600 font-bold">
                        {formatRupiah(po.totalCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Riwayat Kas Masuk */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Riwayat Kas Masuk Pembeli ({po.cashInflow?.length || 0})
                </h3>
                {po.status !== "CLOSED" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      onOpenChange(false);
                      onRecordCashInflow(po);
                    }}
                  >
                    + Tambah Pembayaran
                  </Button>
                )}
              </div>

              {po.cashInflow && po.cashInflow.length > 0 ? (
                <>
                  {/* Mobile Payments Cards (< sm): zero horizontal scroll */}
                  <div className="block sm:hidden space-y-2">
                    {po.cashInflow.map((cin: any, idx: number) => (
                      <div key={cin.id || idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700">{formatDateIndo(cin.receivedDate)}</span>
                          <span className="font-mono font-bold text-emerald-600">{formatRupiah(cin.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                              {cin.paymentMethod === "TRANSFER_BANK" ? "Transfer Bank" : "Tunai"}
                            </span>
                            {cin.proofFileUrl && (
                              <a
                                href={cin.proofFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                              >
                                Bukti <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInflowToDelete(cin)}
                            className="h-6 px-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-[11px]"
                            title="Hapus pembayaran ini"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Hapus
                          </Button>
                        </div>
                        {cin.notes && (
                          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">{cin.notes}</p>
                        )}
                      </div>
                    ))}
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-800">Total Kas Masuk</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {formatRupiah(po.totalCashInflow || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Payments Table (>= sm) */}
                  <div className="hidden sm:block border border-slate-200 rounded-md overflow-x-auto bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 text-left w-10">No</th>
                          <th className="px-3 py-2 text-left">Tanggal</th>
                          <th className="px-3 py-2 text-left">Metode</th>
                          <th className="px-3 py-2 text-left">Catatan</th>
                          <th className="px-3 py-2 text-center w-20">Struk</th>
                          <th className="px-3 py-2 text-right w-32">Nominal</th>
                          <th className="px-3 py-2 text-center w-16">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {po.cashInflow.map((cin: any, idx: number) => (
                          <tr key={cin.id || idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-700">{formatDateIndo(cin.receivedDate)}</td>
                            <td className="px-3 py-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                {cin.paymentMethod === "TRANSFER_BANK" ? "Transfer" : "Tunai"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{cin.notes || "-"}</td>
                            <td className="px-3 py-2 text-center">
                              {cin.proofFileUrl ? (
                                <a
                                  href={cin.proofFileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                                >
                                  Lihat <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600">
                              {formatRupiah(cin.amount)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setInflowToDelete(cin)}
                                className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Hapus catatan kas masuk"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                        <tr>
                          <td colSpan={5} className="px-3 py-2 text-right text-[11px] uppercase text-slate-700">
                            Total Kas Masuk Terkumpul
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600 font-bold">
                            {formatRupiah(po.totalCashInflow || 0)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center border border-dashed border-slate-200 rounded-md bg-slate-50/50">
                  <p className="text-xs text-slate-500">Belum ada pembayaran kas masuk tercatat untuk PO ini.</p>
                </div>
              )}
            </div>

            {/* Additional info & Uploaded Proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Penjualan</span>
                <p className="font-mono font-semibold text-slate-800">
                  {po.expectedRevenue ? formatRupiah(po.expectedRevenue) : "Tidak ditentukan"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Struk Modal Keluar</span>
                <p>
                  {po.proofFileUrl ? (
                    <a
                      href={po.proofFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                    >
                      <FileText className="h-3.5 w-3.5" /> Buka Lampiran Struk <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Tidak ada lampiran</span>
                  )}
                </p>
              </div>

              {po.notes && (
                <div className="sm:col-span-2 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Catatan PO</span>
                  <p className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap">
                    {po.notes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-slate-100 pt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs border-slate-200">
                Tutup
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-500">
            Data PO tidak ditemukan.
          </div>
        )}
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={!!inflowToDelete}
      onOpenChange={(val) => !val && setInflowToDelete(null)}
      title="Hapus Catatan Kas Masuk?"
      description="Apakah Anda yakin ingin menghapus data penerimaan uang ini?"
      itemBadge={inflowToDelete ? formatRupiah(inflowToDelete.amount) : undefined}
      itemDetail={
        inflowToDelete
          ? `Metode: ${inflowToDelete.paymentMethod === "TRANSFER_BANK" ? "Transfer Bank" : "Tunai"} • Tgl: ${formatDateIndo(
              inflowToDelete.receivedDate
            )}`
          : undefined
      }
      warningNote="Status pelunasan PO akan otomatis dihitung ulang oleh sistem setelah catatan ini dihapus."
      confirmLabel="Ya, Hapus Kas Masuk"
      cancelLabel="Batal"
      isLoading={deleteInflowLoading}
      onConfirm={handleConfirmDeleteInflow}
    />
  </>
  );
}
