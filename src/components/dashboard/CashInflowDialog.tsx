"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cashInflowSchema, type CashInflowInput } from "@/lib/validations";
import { formatRupiah } from "@/lib/utils";
import type { POTableData } from "@/components/dashboard/PODashboardTable";
import { DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/modern-toast";

interface CashInflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPO: POTableData | null;
  availablePOs?: POTableData[];
  onSelectPO?: (po: POTableData | null) => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function CashInflowDialog({
  open,
  onOpenChange,
  selectedPO,
  availablePOs = [],
  onSelectPO,
  onSubmit,
  loading,
}: CashInflowDialogProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [currentPO, setCurrentPO] = useState<POTableData | null>(selectedPO);
  const { error: toastError } = useToast();

  const form = useForm<CashInflowInput>({
    resolver: zodResolver(cashInflowSchema),
    defaultValues: {
      poId: selectedPO?.id || "",
      amount: 0,
      receivedDate: new Date().toISOString().split("T")[0],
      paymentMethod: "TRANSFER_BANK",
      notes: "",
    },
  });

  // Sync currentPO with prop
  useEffect(() => {
    setCurrentPO(selectedPO);
    if (selectedPO) {
      const remainingCost = Math.max(0, selectedPO.totalCost - selectedPO.totalCashInflow);
      form.reset({
        poId: selectedPO.id,
        amount: remainingCost > 0 ? remainingCost : selectedPO.totalCost,
        receivedDate: new Date().toISOString().split("T")[0],
        paymentMethod: "TRANSFER_BANK",
        notes: "",
      });
      setProofFile(null);
    }
  }, [selectedPO, form]);

  const handlePOChange = (poId: string) => {
    const found = availablePOs.find((p) => p.id === poId) || null;
    setCurrentPO(found);
    if (onSelectPO) onSelectPO(found);
    if (found) {
      const remainingCost = Math.max(0, found.totalCost - found.totalCashInflow);
      form.setValue("poId", found.id);
      form.setValue("amount", remainingCost > 0 ? remainingCost : found.totalCost);
    }
  };

  const remaining = currentPO ? Math.max(0, currentPO.totalCost - currentPO.totalCashInflow) : 0;

  const handleSetFull = () => {
    if (remaining > 0) form.setValue("amount", remaining);
  };

  const handleSetHalf = () => {
    if (remaining > 0) form.setValue("amount", Math.round(remaining / 2));
  };

  const handleSubmit = async (data: CashInflowInput) => {
    const activePoId = currentPO?.id || data.poId;
    if (!activePoId) {
      toastError("Pilih Purchase Order", "Silakan pilih PO terlebih dahulu sebelum mencatat kas masuk.");
      return;
    }
    await onSubmit({ ...data, poId: activePoId, proofFile });
    form.reset({
      poId: "",
      amount: 0,
      receivedDate: new Date().toISOString().split("T")[0],
      paymentMethod: "TRANSFER_BANK",
      notes: "",
    });
    setProofFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white text-slate-900 border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Catat Kas Masuk (Pelunasan Pembeli)
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500">
            {currentPO
              ? `${currentPO.poNumber} — ${currentPO.supplierName}`
              : "Pilih PO yang menerima pembayaran pelunasan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3.5 pt-1">
          {/* PO Selector if not preselected */}
          {!selectedPO && availablePOs.length > 0 && (
            <div className="space-y-1">
              <Label htmlFor="poSelect" className="text-xs sm:text-sm font-semibold text-slate-700">
                Pilih Purchase Order *
              </Label>
              <Select value={currentPO?.id || ""} onValueChange={handlePOChange}>
                <SelectTrigger id="poSelect" className="text-xs sm:text-sm h-9 sm:h-10 bg-white border-slate-200">
                  <SelectValue placeholder="-- Pilih PO yang akan dilunasi --" />
                </SelectTrigger>
                <SelectContent>
                  {availablePOs.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.poNumber} — {p.supplierName} ({formatRupiah(p.totalCost)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* PO Summary Card */}
          {currentPO && (
            <Card className="border border-slate-200 bg-slate-50 shadow-xs">
              <CardHeader className="py-2 px-3 border-b border-slate-200/80 bg-slate-100/60">
                <CardTitle className="text-[11px] uppercase font-bold text-slate-600">
                  Status Tagihan PO Saat Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Modal PO:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {formatRupiah(currentPO.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kas Masuk Sebelumnya:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatRupiah(currentPO.totalCashInflow)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-medium text-slate-800">
                  <span>Sisa Belum Lunas:</span>
                  <span className="font-mono font-bold text-amber-600 text-sm">
                    {formatRupiah(remaining)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amount input & Quick Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-xs sm:text-sm font-semibold text-slate-700">
                Nominal Kas Masuk (Rp) *
              </Label>
              {remaining > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSetHalf}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={handleSetFull}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium border border-emerald-300"
                  >
                    Lunas Penuh
                  </button>
                </div>
              )}
            </div>

            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Contoh: 5000000"
                  className="text-sm font-mono font-bold h-10 bg-white border-slate-200"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
            {form.formState.errors.amount && (
              <p className="text-[11px] text-rose-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="receivedDate" className="text-xs sm:text-sm font-semibold text-slate-700">
                Tanggal Diterima *
              </Label>
              <Controller
                name="receivedDate"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="receivedDate"
                    type="date"
                    className="text-xs sm:text-sm h-9 sm:h-10 bg-white border-slate-200"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentMethod" className="text-xs sm:text-sm font-semibold text-slate-700">
                Metode Pembayaran
              </Label>
              <Controller
                name="paymentMethod"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="paymentMethod" className="text-xs sm:text-sm h-9 sm:h-10 bg-white border-slate-200">
                      <SelectValue placeholder="Pilih Metode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSFER_BANK" className="text-xs">
                        Transfer Bank (BCA/Mandiri/BRI)
                      </SelectItem>
                      <SelectItem value="TUNAI" className="text-xs">
                        Tunai / Cash Langsung
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Proof File */}
          <div className="space-y-1">
            <Label htmlFor="proofFile" className="text-xs sm:text-sm font-semibold text-slate-700">
              Bukti Transfer / Struk (Opsional)
            </Label>
            <Input
              id="proofFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="text-xs cursor-pointer h-9 sm:h-10 file:text-xs bg-white border-slate-200"
            />
            {proofFile && (
              <p className="text-[11px] text-emerald-600 font-medium">
                ✓ {proofFile.name} ({Math.round(proofFile.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs sm:text-sm font-semibold text-slate-700">
              Catatan Pembayaran (Opsional)
            </Label>
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Contoh: Transfer via rekening BCA Kakak Prana termin 2"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>

          <DialogFooter className="border-t border-slate-100 pt-3 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-9 text-xs sm:text-sm border-slate-200 text-slate-700"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !currentPO}
              className="h-9 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? "Menyimpan..." : "Simpan Kas Masuk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}