"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ExecutiveCard } from "@/components/dashboard/ExecutiveCards";
import { PODashboardTable, type POTableData } from "@/components/dashboard/PODashboardTable";
import { POFormDialog } from "@/components/dashboard/POFormDialog";
import { CashInflowDialog } from "@/components/dashboard/CashInflowDialog";
import { PODetailDialog } from "@/components/dashboard/PODetailDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/modern-toast";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Package,
  Plus,
  Download,
  Search,
  Settings,
  PlusCircle,
  Database,
  RefreshCw,
  LogOut,
  X,
  BookOpen,
} from "lucide-react";

import { InstallPrompt } from "@/components/pwa/InstallPrompt";

interface DashboardClientProps {
  initialData: POTableData[];
  initialMetrics: {
    activeCapital: number;
    outstandingReceivables: number;
    monthlyProfit: number;
    closedPOCount: number;
  };
  tenant?: {
    id: string;
    companyName: string;
    ownerName?: string | null;
    identifier: string;
  } | null;
}

export function DashboardClient({ initialData, initialMetrics, tenant }: DashboardClientProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [data, setData] = useState<POTableData[]>(initialData);
  const [metrics, setMetrics] = useState(initialMetrics);

  const [poFormOpen, setPoFormOpen] = useState(false);
  const [cashInflowOpen, setCashInflowOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedPO, setSelectedPO] = useState<POTableData | null>(null);
  const [detailPoId, setDetailPoId] = useState<string | null>(null);
  const [editPO, setEditPO] = useState<any | null>(null);
  const [poToDelete, setPoToDelete] = useState<POTableData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OUTSTANDING" | "PARTIAL" | "CLOSED">("ALL");

  // 0-Latency Memoized search & status filter
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q && statusFilter === "ALL") return data;

    return data.filter((po) => {
      const matchesSearch =
        !q ||
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.itemSummary.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  // Single-pass memoized tab counters & payable POs list
  const { countAll, countOutstanding, countPartial, countClosed, payablePOs } = useMemo(() => {
    let out = 0;
    let part = 0;
    let cls = 0;
    const payables: POTableData[] = [];

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (p.status === "OUTSTANDING") out++;
      else if (p.status === "PARTIAL") part++;
      else if (p.status === "CLOSED") cls++;

      if (p.status !== "CLOSED") payables.push(p);
    }

    return {
      countAll: data.length,
      countOutstanding: out,
      countPartial: part,
      countClosed: cls,
      payablePOs: payables,
    };
  }, [data]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, metricsRes] = await Promise.all([
        fetch("/api/po"),
        fetch("/api/metrics"),
      ]);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      if (metricsRes.ok) {
        const json = await metricsRes.json();
        setMetrics(json);
      }
    } catch (e) {
      console.error("Failed to refresh:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditPO = async (po: POTableData) => {
    try {
      const res = await fetch(`/api/po/${po.id}`);
      if (res.ok) {
        const fullPO = await res.json();
        setEditPO(fullPO);
      } else {
        setEditPO(po);
      }
    } catch {
      setEditPO(po);
    }
    setPoFormOpen(true);
  };

  const handleSavePO = async (formData: any) => {
    const isEdit = !!editPO;
    const targetId = editPO?.id;

    // Instant modal close for 0-latency feel
    setPoFormOpen(false);
    setEditPO(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("date", formData.date);
      fd.append("supplierName", formData.supplierName);
      fd.append("items", JSON.stringify(formData.items));
      fd.append("expectedRevenue", String(formData.expectedRevenue || 0));
      fd.append("notes", formData.notes || "");
      if (formData.proofFile) fd.append("proofFile", formData.proofFile);

      const url = isEdit ? `/api/po/${targetId}` : "/api/po";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || (isEdit ? "Gagal memperbarui PO" : "Gagal membuat PO"));
      }

      await refreshData();
      toastSuccess(
        isEdit ? "PO Berhasil Diperbarui" : "PO Baru Berhasil Dibuat",
        `Data PO untuk ${formData.supplierName} telah disimpan.`
      );
    } catch (e: any) {
      console.error(e);
      await refreshData();
      toastError("Gagal Menyimpan PO", e.message || "Periksa kembali input form Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashInflow = async (formData: any) => {
    const poId = formData.poId;
    const amount = Number(formData.amount);

    // 0ms Optimistic Close: Instant feedback without blocking UI
    setCashInflowOpen(false);
    setSelectedPO(null);

    // Optimistically update table data immediately
    setData((prev) =>
      prev.map((p) => {
        if (p.id !== poId) return p;
        const newTotalInflow = (p.totalCashInflow || 0) + amount;
        const newProfit = newTotalInflow - p.totalCost;
        const newStatus = newTotalInflow >= p.totalCost ? "CLOSED" : "PARTIAL";
        return {
          ...p,
          totalCashInflow: newTotalInflow,
          profit: newProfit,
          status: newStatus,
        };
      })
    );

    toastSuccess(
      "Kas Masuk Berhasil Dicatat",
      `Pelunasan sebesar ${formatRupiah(amount)} berhasil dibukukan.`
    );

    try {
      const fd = new FormData();
      fd.append("poId", formData.poId);
      fd.append("amount", String(formData.amount));
      fd.append("receivedDate", formData.receivedDate);
      fd.append("paymentMethod", formData.paymentMethod);
      fd.append("notes", formData.notes || "");
      if (formData.proofFile) fd.append("proofFile", formData.proofFile);

      const res = await fetch(`/api/po/${formData.poId}/cash-inflow`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal mencatat kas masuk");
      }
      // Background sync fresh data
      await refreshData();
    } catch (e: any) {
      console.error(e);
      await refreshData();
      toastError("Gagal Mencatat Kas Masuk", e.message || "Periksa kembali data kas masuk.");
    }
  };

  const handlePromptDelete = (po: POTableData) => {
    setPoToDelete(po);
  };

  // 0-Latency Optimistic Delete
  const handleConfirmDelete = async () => {
    if (!poToDelete) return;
    const target = poToDelete;
    const targetId = target.id;
    const previousData = [...data];

    // Immediately remove from UI and close dialogs in 0ms
    setPoToDelete(null);
    if (detailPoId === targetId) setDetailOpen(false);
    setData((prev) => prev.filter((p) => p.id !== targetId));

    toastSuccess(
      `PO ${target.poNumber} Berhasil Dihapus`,
      `Data PO untuk ${target.supplierName} telah dihapus.`
    );

    try {
      const res = await fetch(`/api/po/${targetId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menghapus PO di server");
      }
      // Background sync metrics
      fetch("/api/metrics")
        .then((r) => r.ok && r.json())
        .then((json) => json && setMetrics(json))
        .catch(() => {});
    } catch (e: any) {
      console.error(e);
      // Rollback on failure
      setData(previousData);
      toastError("Gagal Menghapus PO", e.message || "Data transaksi dikembalikan.");
    }
  };

  const handlePrint = (id: string) => {
    window.open(`/po/${id}/print`, "_blank");
  };

  const handleExportExcel = async () => {
    window.open("/api/export/excel", "_blank");
  };

  const handleViewDetail = (id: string) => {
    setDetailPoId(id);
    setDetailOpen(true);
  };

  const handleOpenCashInflowForPO = (po: POTableData) => {
    setSelectedPO(po);
    setCashInflowOpen(true);
  };

  const handleOpenGeneralCashInflow = () => {
    setSelectedPO(null);
    setCashInflowOpen(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refreshData();
    toastSuccess("Data Diperbarui", "Data transaksi dan ringkasan kas telah dimuat ulang.");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <div className="p-3 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden">
      {/* PWA Install Banner (Auto appears if installable on Android/Chrome) */}
      <InstallPrompt />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3 sm:pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {tenant?.companyName || "Sistem PO & Kas Minyak"}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 truncate">
            {tenant ? `${tenant.companyName} • Akun: ${tenant.identifier}` : "CV. TRADING MINYAK • Pembukuan PO & Kas"}
          </p>
        </div>

        {/* Mobile Quick Actions (Top-Right) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <Link href="/panduan">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border-blue-200 rounded-lg shadow-2xs"
              title="Buku Panduan Cara Pakai"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1 text-blue-600" /> Panduan
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-lg shadow-2xs"
            title="Keluar / Logout"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
          </Button>
        </div>

        {/* Desktop Action Buttons: Hidden on Mobile, Visible on md+ */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/panduan">
            <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 font-semibold" title="Buku Panduan Cara Pakai">
              <BookOpen className="h-3.5 w-3.5 mr-1 text-blue-600" /> Panduan
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm border-slate-200" title="Pengaturan Kop Surat">
              <Settings className="h-3.5 w-3.5 mr-1" /> Pengaturan
            </Button>
          </Link>

          <Button
            onClick={handleExportExcel}
            variant="outline"
            size="sm"
            className="h-9 text-xs sm:text-sm border-slate-200"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Export Excel
          </Button>

          <Button
            onClick={handleOpenGeneralCashInflow}
            size="sm"
            variant="secondary"
            className="h-9 text-xs sm:text-sm font-semibold border text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-300"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> + Kas Masuk
          </Button>

          <Button
            onClick={() => {
              setEditPO(null);
              setPoFormOpen(true);
            }}
            size="sm"
            className="h-9 text-xs sm:text-sm font-bold shadow-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> + Buat PO
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-9 text-xs sm:text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
            title="Keluar / Logout"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
          </Button>
        </div>
      </div>

      {/* Executive Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <ExecutiveCard
          title="Sisa Modal Aktif"
          value={metrics.activeCapital}
          color="blue"
          icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
        <ExecutiveCard
          title="Piutang Berjalan"
          value={metrics.outstandingReceivables}
          subtitle="Uang di pembeli"
          color="orange"
          icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
        <ExecutiveCard
          title="Laba Bulan Ini"
          value={metrics.monthlyProfit}
          subtitle="Kas Masuk - Modal"
          color="green"
          icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
        <ExecutiveCard
          title="PO Selesai"
          value={metrics.closedPOCount}
          subtitle="Total PO lunas"
          color="gray"
          isCurrency={false}
          icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
        />
      </div>

      {/* Standalone Search Bar (Terpisah dari Card Filter) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari No. PO, Supplier, Nama Barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 text-sm sm:text-base h-11 bg-white border border-slate-200/90 shadow-2xs rounded-xl focus-visible:ring-2 focus-visible:ring-slate-900 font-medium placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full"
              title="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={loading}
          title="Perbarui Data Transaksi"
          className="h-11 w-11 shrink-0 bg-white border-slate-200/90 rounded-xl shadow-2xs text-slate-700 hover:text-slate-900 hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filter Status Chips Card (Terpisah) */}
      <Card className="border border-slate-200/90 shadow-xs bg-white rounded-xl">
        <CardContent className="p-3 sm:p-4 space-y-2.5">
          {/* Quick Filter: 4-Column Grid on Mobile, Flex on Desktop */}
          <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              title="Tampilkan seluruh transaksi PO"
              className={`flex items-center justify-center px-1.5 sm:px-3 py-2 rounded-lg sm:rounded-full font-bold transition-all text-xs sm:text-sm text-center truncate ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua ({countAll})
            </button>
            <button
              onClick={() => setStatusFilter("OUTSTANDING")}
              title="Pending: Belum ada pembayaran masuk sama sekali (Kas = Rp 0)"
              className={`flex items-center justify-center px-1.5 sm:px-3 py-2 rounded-lg sm:rounded-full font-bold transition-all text-xs sm:text-sm text-center truncate ${
                statusFilter === "OUTSTANDING"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Pending ({countOutstanding})
            </button>
            <button
              onClick={() => setStatusFilter("PARTIAL")}
              title="Partial: Pembayaran sudah dicicil sebagian, belum lunas"
              className={`flex items-center justify-center px-1.5 sm:px-3 py-2 rounded-lg sm:rounded-full font-bold transition-all text-xs sm:text-sm text-center truncate ${
                statusFilter === "PARTIAL"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200"
              }`}
            >
              <span className="sm:hidden">Partial ({countPartial})</span>
              <span className="hidden sm:inline">Partial / Cicil ({countPartial})</span>
            </button>
            <button
              onClick={() => setStatusFilter("CLOSED")}
              title="Lunas: Pembayaran telah diterima 100% penuh"
              className={`flex items-center justify-center px-1.5 sm:px-3 py-2 rounded-lg sm:rounded-full font-bold transition-all text-xs sm:text-sm text-center truncate ${
                statusFilter === "CLOSED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              Lunas ({countClosed})
            </button>
          </div>

          {/* Kriteria Explanatory Helper Banner */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              {statusFilter === "ALL" && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">ℹ️</span>
                  <span><strong>Semua Transaksi:</strong> Menampilkan seluruh data ({countAll} PO) baik yang belum bayar, dicicil, maupun sudah lunas.</span>
                </>
              )}
              {statusFilter === "OUTSTANDING" && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">⏳</span>
                  <span><strong>Kriteria Pending (Belum Bayar):</strong> Modal PO sudah keluar tapi <strong>kas masuk masih Rp 0</strong> (belum ada setoran).</span>
                </>
              )}
              {statusFilter === "PARTIAL" && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">🔄</span>
                  <span><strong>Kriteria Partial (Dicicil):</strong> Pembeli <strong>sudah bayar sebagian</strong> tapi belum lunas (masih ada sisa piutang modal).</span>
                </>
              )}
              {statusFilter === "CLOSED" && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">✅</span>
                  <span><strong>Kriteria Lunas (Selesai):</strong> Pembayaran dari pembeli <strong>sudah masuk 100% penuh</strong> atau melebihi modal PO.</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold self-end sm:self-auto">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Kas = 0</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Dicicil</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lunas 100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO Transactions: Rendered directly without double-card box */}
      <PODashboardTable
        data={filteredData}
        onView={handleViewDetail}
        onEdit={handleEditPO}
        onPrint={handlePrint}
        onDelete={handlePromptDelete}
        onRecordCashInflow={handleOpenCashInflowForPO}
        loading={loading}
      />

      {/* Dialogs */}
      <POFormDialog
        open={poFormOpen}
        onOpenChange={(open) => {
          setPoFormOpen(open);
          if (!open) setEditPO(null);
        }}
        editData={editPO}
        onSubmit={handleSavePO}
        loading={loading}
      />

      <CashInflowDialog
        open={cashInflowOpen}
        onOpenChange={setCashInflowOpen}
        selectedPO={selectedPO}
        availablePOs={payablePOs.length > 0 ? payablePOs : data}
        onSelectPO={setSelectedPO}
        onSubmit={handleCashInflow}
        loading={loading}
      />

      <PODetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        poId={detailPoId}
        onRecordCashInflow={(po) => {
          setSelectedPO(po);
          setCashInflowOpen(true);
        }}
        onPrint={handlePrint}
        onEdit={(po) => {
          handleEditPO(po);
        }}
        onRefresh={refreshData}
      />

      {/* Modern Confirm Delete Dialog for PO */}
      <ConfirmDialog
        open={!!poToDelete}
        onOpenChange={(open) => !open && setPoToDelete(null)}
        title="Hapus Purchase Order?"
        description="Apakah Anda yakin ingin menghapus data Purchase Order ini dari sistem?"
        itemBadge={poToDelete?.poNumber}
        itemDetail={poToDelete ? `${poToDelete.supplierName} • Total Modal: ${formatRupiah(poToDelete.totalCost)}` : undefined}
        warningNote="Semua rincian barang dan riwayat catatan kas masuk yang terhubung dengan PO ini akan dihapus secara permanen."
        confirmLabel="Ya, Hapus PO"
        cancelLabel="Batal"
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* Modern Mobile Bottom Navigation Bar (Visible only on mobile < md) */}
      <nav aria-label="Menu Navigasi Mobile" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
          {/* 1. Refresh (Menggantikan Beranda) */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-700 active:text-slate-900 active:scale-95 transition-all group"
            title="Refresh & Muat Ulang Data Transaksi"
          >
            <div className="p-1 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-200 shadow-2xs">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-800 mt-0.5">Refresh</span>
          </button>

          {/* 2. Kas Masuk */}
          <button
            onClick={handleOpenGeneralCashInflow}
            className="flex flex-col items-center justify-center flex-1 py-1 text-emerald-700 active:text-emerald-800 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mb-0.5 stroke-[2.2]" />
            <span className="text-xs font-bold tracking-tight text-emerald-700">+ Kas</span>
          </button>

          {/* 3. Center Prominent Action Button (FAB) for "+ Buat PO" */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-5">
            <button
              onClick={() => {
                setEditPO(null);
                setPoFormOpen(true);
              }}
              className="w-12 h-12 rounded-full bg-slate-900 active:bg-slate-800 text-white shadow-lg shadow-slate-900/30 flex items-center justify-center transition-transform active:scale-90 border-2 border-white ring-2 ring-slate-100"
              title="Buat PO Baru"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
            <span className="text-xs font-black text-slate-900 mt-0.5">Buat PO</span>
          </div>

          {/* 4. Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-700 active:text-slate-900 transition-colors"
          >
            <Download className="h-5 w-5 mb-0.5 stroke-[2.2]" />
            <span className="text-xs font-bold tracking-tight text-slate-700">Export</span>
          </button>

          {/* 5. Pengaturan */}
          <Link
            href="/settings"
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-700 active:text-slate-900 transition-colors"
          >
            <Settings className="h-5 w-5 mb-0.5 stroke-[2.2]" />
            <span className="text-xs font-bold tracking-tight text-slate-700">Pengaturan</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}