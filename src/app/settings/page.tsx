"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import { CheckCircle, AlertCircle, ArrowLeft, Building2, Lock } from "lucide-react";

const DEFAULT_SETTINGS: SettingsInput = {
  appName: "CV. TRADING MINYAK",
  appAddress: "Jl. Raya Utama No. 123, Jakarta Selatan",
  appPhone: "0812-3456-7890",
  npwp: "00.000.000.0-000.000",
};

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  });

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem("sim-trading-settings");
      if (stored) {
        form.reset(JSON.parse(stored));
      }
    } catch {
      form.reset(DEFAULT_SETTINGS);
    }
  };

  const handleSubmit = (data: SettingsInput) => {
    try {
      localStorage.setItem("sim-trading-settings", JSON.stringify(data));
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Gagal menyimpan pengaturan ke localStorage");
    }
  };

  // Load on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Pengaturan Usaha
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Data ini digunakan untuk kop surat pada cetakan PO resmi (Kop Surat A4).
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Identitas & Kop Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="appName">Nama Usaha / CV *</Label>
              <Controller
                name="appName"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="appName"
                    placeholder="Contoh: CV. Minyak Bersaudara"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {form.formState.errors.appName && (
                <p className="text-xs text-red-600">{form.formState.errors.appName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appAddress">Alamat Lengkap *</Label>
              <Controller
                name="appAddress"
                control={form.control}
                render={({ field }) => (
                  <textarea
                    id="appAddress"
                    rows={2}
                    placeholder="Contoh: Jl. Gudang Minyak No. 88, Surabaya, Jawa Timur"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {form.formState.errors.appAddress && (
                <p className="text-xs text-red-600">{form.formState.errors.appAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="appPhone">Nomor Telepon / WhatsApp *</Label>
                <Controller
                  name="appPhone"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="appPhone"
                      placeholder="0812-3456-7890"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                {form.formState.errors.appPhone && (
                  <p className="text-xs text-red-600">{form.formState.errors.appPhone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="npwp">NPWP (Opsional)</Label>
                <Controller
                  name="npwp"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="npwp"
                      placeholder="00.000.000.0-000.000"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 p-3 rounded border border-emerald-200">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Pengaturan berhasil disimpan di browser (100% offline).</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-rose-700 text-sm bg-rose-50 p-3 rounded border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full">
              Simpan Pengaturan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600" /> Keamanan &amp; Kunci PIN Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            Aplikasi ini bersifat <strong>Private Internal</strong>. Tidak ada pendaftaran publik (Sign Up). Akses dilindungi sistem PIN 6-digit dengan sesi tersimpan otomatis di perangkat Anda.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 text-slate-700">
            <p className="font-semibold text-slate-900">Manajemen PIN &amp; Pemulihan:</p>
            <p>&bull; <strong>Tersimpan Aman</strong>: PIN di-hash menggunakan algoritma SHA-256 dan disimpan di database cloud Neon.</p>
            <p>&bull; <strong>Lupa PIN</strong>: Jika Anda lupa PIN, Anda dapat meresetnya langsung di halaman login menggunakan Kode Pemulihan (Default: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold">sim2026</code>).</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/70">
        <CardContent className="p-4 text-xs sm:text-sm text-amber-900">
          <strong>Mode Private Cloud:</strong> Seluruh transaksi tersimpan aman di database cloud Neon PostgreSQL dan dilindungi proteksi enkripsi cookie session.
        </CardContent>
      </Card>
    </div>
  );
}