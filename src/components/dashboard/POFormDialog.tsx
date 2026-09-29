"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, PackagePlus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { createPOSchema, UNIT_OPTIONS, type CreatePOInput } from "@/lib/validations";
import { formatRupiah } from "@/lib/utils";

interface POFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  editData?: any | null;
  loading?: boolean;
}

export function POFormDialog({ open, onOpenChange, onSubmit, editData, loading }: POFormDialogProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);

  const form = useForm<CreatePOInput>({
    resolver: zodResolver(createPOSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      supplierName: "",
      items: [{ itemName: "", qty: 1, unit: "Jerigen", unitPrice: 0 }],
      expectedRevenue: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (editData && open) {
      form.reset({
        date: typeof editData.date === "string" ? editData.date.split("T")[0] : new Date(editData.date).toISOString().split("T")[0],
        supplierName: editData.supplierName || "",
        items: editData.items && editData.items.length > 0
          ? editData.items.map((i: any) => ({
              itemName: i.itemName,
              qty: i.qty,
              unit: i.unit || "Jerigen",
              unitPrice: i.unitPrice || 0,
            }))
          : [{ itemName: "", qty: 1, unit: "Jerigen", unitPrice: 0 }],
        expectedRevenue: editData.expectedRevenue || 0,
        notes: editData.notes || "",
      });
      setProofFile(null);
    } else if (!editData && open) {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        supplierName: "",
        items: [{ itemName: "", qty: 1, unit: "Jerigen", unitPrice: 0 }],
        expectedRevenue: 0,
        notes: "",
      });
      setProofFile(null);
    }
  }, [editData, open, form]);

  const handleSubmit = async (data: CreatePOInput) => {
    await onSubmit({ ...data, proofFile });
    form.reset({
      date: new Date().toISOString().split("T")[0],
      supplierName: "",
      items: [{ itemName: "", qty: 1, unit: "Jerigen", unitPrice: 0 }],
      expectedRevenue: 0,
      notes: "",
    });
    setProofFile(null);
  };

  const calculateSubtotal = (qty: any, unitPrice: any) => (Number(qty) || 0) * (Number(unitPrice) || 0);
  const items = form.watch("items") || [];
  const totalModal = items.reduce(
    (sum, item) => sum + calculateSubtotal(item.qty, item.unitPrice),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white text-slate-900 border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-slate-900">
            {editData ? (
              <>
                <Edit className="h-5 w-5 text-amber-600" />
                Edit Purchase Order ({editData.poNumber})
              </>
            ) : (
              <>
                <PackagePlus className="h-5 w-5 text-blue-600" />
                Buat PO Baru (Modal Keluar)
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500">
            {editData
              ? "Perbarui informasi supplier, kuantitas item, harga modal, atau keterangan transaksi PO"
              : "Catat pemesanan minyak ke distributor / supplier untuk memotong modal aktif"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs sm:text-sm font-semibold text-slate-700">Tanggal PO *</Label>
              <Controller
                name="date"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="date"
                    type="date"
                    className="text-xs sm:text-sm h-9 sm:h-10 bg-white border-slate-200"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {form.formState.errors.date && (
                <p className="text-[11px] text-rose-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supplierName" className="text-xs sm:text-sm font-semibold text-slate-700">
                Nama Supplier / Distributor *
              </Label>
              <Controller
                name="supplierName"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="supplierName"
                    placeholder="Contoh: PT. Wilmar Sawit / CV. Sumber Berkah"
                    className="text-xs sm:text-sm h-9 sm:h-10 bg-white border-slate-200"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {form.formState.errors.supplierName && (
                <p className="text-[11px] text-rose-500">{form.formState.errors.supplierName.message}</p>
              )}
            </div>
          </div>

          {/* Items Card */}
          <Card className="border border-slate-200 shadow-none bg-slate-50/60">
            <CardHeader className="py-2.5 px-3 sm:px-4 flex flex-row items-center justify-between border-b border-slate-200/80 bg-slate-100/70">
              <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                Daftar Barang yang Dipesan ({fields.length})
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                onClick={() => append({ itemName: "", qty: 1, unit: "Jerigen", unitPrice: 0 })}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Item
              </Button>
            </CardHeader>

            <CardContent className="p-2.5 sm:p-4 space-y-3">
              {fields.map((field, index) => {
                const itemQty = form.watch(`items.${index}.qty`) || 0;
                const itemUnitPrice = form.watch(`items.${index}.unitPrice`) || 0;
                const subtotal = calculateSubtotal(itemQty, itemUnitPrice);

                return (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white shadow-xs space-y-2.5 transition-all"
                  >
                    {/* Header item index and delete */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">
                        Item #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-xs"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                        </Button>
                      )}
                    </div>

                    {/* Responsive inputs: stacked on mobile, inline grid on tablet/desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
                      {/* Nama Barang */}
                      <div className="col-span-2 sm:col-span-5 space-y-1">
                        <Label className="text-[11px] font-medium text-slate-500">Nama Barang</Label>
                        <Controller
                          name={`items.${index}.itemName`}
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              placeholder="Contoh: Minyak Goreng Curah"
                              className="text-xs h-8 sm:h-9 bg-white"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      </div>

                      {/* Qty */}
                      <div className="col-span-1 sm:col-span-2 space-y-1">
                        <Label className="text-[11px] font-medium text-slate-500">Qty</Label>
                        <Controller
                          name={`items.${index}.qty`}
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="1"
                              className="text-xs h-8 sm:h-9 font-mono bg-white"
                              value={field.value === 0 || field.value === undefined || field.value === null ? "" : field.value}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/,/g, ".");
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  field.onChange(val === "" ? 0 : val);
                                }
                              }}
                              onBlur={(e) => {
                                const num = parseFloat(String(e.target.value)) || 0;
                                field.onChange(num);
                              }}
                            />
                          )}
                        />
                      </div>

                      {/* Satuan */}
                      <div className="col-span-1 sm:col-span-2 space-y-1">
                        <Label className="text-[11px] font-medium text-slate-500">Satuan</Label>
                        <Controller
                          name={`items.${index}.unit`}
                          control={form.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="text-xs h-8 sm:h-9 bg-white">
                                <SelectValue placeholder="Satuan" />
                              </SelectTrigger>
                              <SelectContent>
                                {UNIT_OPTIONS.map((u) => (
                                  <SelectItem key={u} value={u} className="text-xs">
                                    {u}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      {/* Harga Satuan */}
                      <div className="col-span-1 sm:col-span-3 space-y-1">
                        <Label className="text-[11px] font-medium text-slate-500">Harga Beli Satuan</Label>
                        <Controller
                          name={`items.${index}.unitPrice`}
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              className="text-xs h-8 sm:h-9 font-mono bg-white"
                              value={field.value !== undefined && field.value !== null && field.value !== 0 ? Number(field.value).toLocaleString("id-ID") : ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                field.onChange(raw ? parseInt(raw, 10) : 0);
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>

                    {/* Subtotal row */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 text-[11px]">Subtotal:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Total Summary Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-rose-50 border border-rose-200 rounded-lg gap-2 mt-2">
                <span className="text-xs sm:text-sm font-semibold text-rose-800">
                  Total Modal PO yang Dikeluarkan:
                </span>
                <span className="text-lg sm:text-2xl font-bold font-mono text-rose-600">
                  {formatRupiah(totalModal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue target & upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="expectedRevenue" className="text-xs sm:text-sm font-semibold text-slate-700">
                Estimasi Penjualan / Target Kas Masuk
              </Label>
              <Controller
                name="expectedRevenue"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="expectedRevenue"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="text-xs sm:text-sm h-9 sm:h-10 font-mono bg-white border-slate-200"
                    value={field.value !== undefined && field.value !== null && field.value !== 0 ? Number(field.value).toLocaleString("id-ID") : ""}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(raw ? parseInt(raw, 10) : 0);
                    }}
                  />
                )}
              />
              <p className="text-[11px] text-slate-500">Opsional: untuk acuan target laba PO ini</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proofUpload" className="text-xs sm:text-sm font-semibold text-slate-700">
                Bukti Transfer Modal (Opsional)
              </Label>
              <Input
                id="proofUpload"
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
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs sm:text-sm font-semibold text-slate-700">
              Catatan / Keterangan (Opsional)
            </Label>
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Contoh: No. Truk AB 1234 CD, sopir Pak Joko, tempo 7 hari"
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
              disabled={loading || totalModal <= 0}
              className="h-9 text-xs sm:text-sm font-semibold"
            >
              {loading ? "Menyimpan..." : editData ? "Simpan Perubahan" : "Simpan Purchase Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}