"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createPOSchema,
  orderItemSchema,
  UNIT_OPTIONS,
  type CreatePOInput,
  type OrderItemInput,
} from "@/lib/validations";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/modern-toast";

export default function NewPOClient() {
  const router = useRouter();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = async (data: CreatePOInput) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("date", data.date);
      fd.append("supplierName", data.supplierName);
      if (data.subject) fd.append("subject", data.subject);
      if (data.deliveryTarget) fd.append("deliveryTarget", data.deliveryTarget);
      fd.append("items", JSON.stringify(data.items));
      fd.append("expectedRevenue", String(data.expectedRevenue || 0));
      fd.append("notes", data.notes || "");
      if (data.proofFile) fd.append("proofFile", data.proofFile);

      const res = await fetch("/api/po", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal membuat PO");

      toastSuccess(
        "PO Berhasil Dibuat",
        "Data PO baru telah berhasil disimpan ke sistem.",
      );
      router.refresh();
      router.push("/");
    } catch (e) {
      console.error(e);
      toastError(
        "Gagal Menyimpan PO",
        "Terjadi kesalahan saat menyimpan data PO.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSubtotal = (qty: any, unitPrice: any) =>
    (Number(qty) || 0) * (Number(unitPrice) || 0);
  const calculateTotal = () => {
    return form
      .watch("items")
      .reduce(
        (sum, item) => sum + calculateSubtotal(item.qty, item.unitPrice),
        0,
      );
  };

  const total = calculateTotal();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat PO Baru</h1>
          <p className="text-sm text-muted-foreground">
            Input Purchase Order ke Supplier/Distributor
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi PO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Tanggal PO *</Label>
                <Controller
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="date"
                      type="date"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplierName">
                  Nama Supplier / Distributor *
                </Label>
                <Controller
                  name="supplierName"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="supplierName"
                      placeholder="Contoh: CV. Minyak Jaya"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Perihal PO (Opsional)</Label>
                <Controller
                  name="subject"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="subject"
                      placeholder="Contoh: Pengadaan Stok Barang"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deliveryTarget">
                  Tujuan Pengiriman (Opsional)
                </Label>
                <Controller
                  name="deliveryTarget"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="deliveryTarget"
                      placeholder="Contoh: Gudang Utama"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Daftar Item Barang</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    itemName: "",
                    qty: 1,
                    unit: "Jerigen",
                    unitPrice: 0,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Tambah Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-end p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Label>Nama Barang *</Label>
                    <Controller
                      name={`items.${index}.itemName`}
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          placeholder="Contoh: Minyak Goreng Curah"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </div>
                  <div className="w-24 space-y-1.5">
                    <Label>Qty *</Label>
                    <Controller
                      name={`items.${index}.qty`}
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="1"
                          value={
                            field.value === 0 ||
                            field.value === undefined ||
                            field.value === null
                              ? ""
                              : field.value
                          }
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
                  <div className="w-28 space-y-1.5">
                    <Label>Satuan *</Label>
                    <Controller
                      name={`items.${index}.unit`}
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="w-36 space-y-1.5">
                    <Label>Harga Satuan *</Label>
                    <Controller
                      name={`items.${index}.unitPrice`}
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={
                            field.value !== undefined &&
                            field.value !== null &&
                            field.value !== 0
                              ? Number(field.value).toLocaleString("id-ID")
                              : ""
                          }
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            field.onChange(raw ? parseInt(raw, 10) : 0);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="w-36 space-y-1.5">
                    <Label>Subtotal</Label>
                    <Input
                      readOnly
                      value={formatRupiah(
                        calculateSubtotal(
                          form.watch(`items.${index}.qty`),
                          form.watch(`items.${index}.unitPrice`),
                        ),
                      )}
                      className="bg-muted font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Modal PO</p>
                <p className="text-2xl font-bold text-red-600 font-mono">
                  {formatRupiah(total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target & Catatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="expectedRevenue">
                  Estimasi Harga Jual / Target Kas Masuk
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
                      value={
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value !== 0
                          ? Number(field.value).toLocaleString("id-ID")
                          : ""
                      }
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        field.onChange(raw ? parseInt(raw, 10) : 0);
                      }}
                    />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bukti Transfer Modal (Opsional)</Label>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {proofFile && (
                  <p className="text-xs text-green-600">
                    {proofFile.name} ({Math.round(proofFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Catatan / Keterangan</Label>
              <Controller
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4 mr-2" />
            {submitting ? "Menyimpan..." : "Simpan PO"}
          </Button>
        </div>
      </form>
    </div>
  );
}
