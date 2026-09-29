"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft, Building2, Lock, KeyRound, User } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [appAddress, setAppAddress] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [npwp, setNpwp] = useState("");
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    async function loadTenant() {
      try {
        const res = await fetch("/api/tenant/me");
        if (res.ok) {
          const data = await res.json();
          setCompanyName(data.companyName || "");
          setOwnerName(data.ownerName || "");
          setIdentifier(data.identifier || "");
          setAppAddress(data.address || "");
          setAppPhone(data.phone || "");
          setNpwp(data.npwp || "");
        }
      } catch (e) {
        console.error("Failed to load tenant data:", e);
      } finally {
        setFetching(false);
      }
    }
    loadTenant();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Nama Usaha / Toko wajib diisi");
      return;
    }
    if (newPin && (!/^\d{6}$/.test(newPin))) {
      setError("PIN baru harus berupa 6 digit angka");
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const payload: any = {
        companyName,
        ownerName,
        address: appAddress,
        phone: appPhone,
        npwp,
      };
      if (newPin) {
        payload.newPin = newPin;
      }

      const res = await fetch("/api/tenant/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan pengaturan");
      }

      setSaved(true);
      setNewPin("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-20 font-sans">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-slate-900" /> Pengaturan Profil Usaha
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Data ini digunakan untuk identitas pembukuan dan kop surat resmi (Kertas A4).
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="h-9 font-semibold text-slate-700">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border border-slate-200/90 shadow-xs bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
            Identitas Usaha &amp; Kop Surat Resmi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-bold text-slate-700">Nama Usaha / Toko / CV *</Label>
              <Input
                id="companyName"
                placeholder="Contoh: CV. Minyak Bersaudara / Toko Barokah"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-10 text-sm font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="ownerName" className="text-xs font-bold text-slate-700">Nama Pemilik / Pengelola</Label>
                <Input
                  id="ownerName"
                  placeholder="Contoh: Budi Prasetyo"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-xs font-bold text-slate-700">Username / ID Login</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  disabled
                  className="h-10 text-sm font-mono bg-slate-100/80 text-slate-500 cursor-not-allowed"
                  title="Username login tidak dapat diubah"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appAddress" className="text-xs font-bold text-slate-700">Alamat Usaha / Gudang</Label>
              <textarea
                id="appAddress"
                rows={2}
                placeholder="Contoh: Jl. Gudang Minyak No. 88, Surabaya, Jawa Timur"
                value={appAddress}
                onChange={(e) => setAppAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="appPhone" className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp</Label>
                <Input
                  id="appPhone"
                  placeholder="Contoh: 0812-3456-7890"
                  value={appPhone}
                  onChange={(e) => setAppPhone(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="npwp" className="text-xs font-bold text-slate-700">NPWP Usaha (Opsional)</Label>
                <Input
                  id="npwp"
                  placeholder="00.000.000.0-000.000"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>
            </div>

            {/* Change PIN Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Label htmlFor="newPin" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Ganti PIN 6-Digit (Kosongkan jika tidak ingin ganti)
              </Label>
              <Input
                id="newPin"
                type="password"
                maxLength={6}
                placeholder="Masukkan 6 angka baru..."
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className="h-10 text-sm font-mono tracking-widest text-center"
              />
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-emerald-800 text-xs sm:text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-200 font-semibold animate-in fade-in">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Pengaturan berhasil diperbarui ke database cloud!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-rose-800 text-xs sm:text-sm bg-rose-50 p-3 rounded-lg border border-rose-200 font-semibold animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-10 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
              {loading ? "Menyimpan Perubahan..." : "Simpan Profil Usaha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}