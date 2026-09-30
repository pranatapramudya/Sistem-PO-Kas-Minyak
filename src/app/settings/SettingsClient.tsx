"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft, Building2, KeyRound } from "lucide-react";

interface TenantSettingsData {
  id: string;
  companyName: string;
  ownerName: string | null;
  identifier: string;
  phone: string | null;
  address: string | null;
  npwp: string | null;
  tagline?: string | null;
}

interface SettingsClientProps {
  initialTenant: TenantSettingsData | null;
  tagline?: string;
}

export function SettingsClient({ initialTenant }: { initialTenant: TenantSettingsData | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize immediately from server-provided initialTenant (0ms pop-in)
  const [companyName, setCompanyName] = useState(initialTenant?.companyName || "");
  const [ownerName, setOwnerName] = useState(initialTenant?.ownerName || "");
  const [identifier, setIdentifier] = useState(initialTenant?.identifier || "");
  const [appAddress, setAppAddress] = useState(initialTenant?.address || "");
  const [phone, setPhone] = useState(initialTenant?.phone || "");
  const [npwp, setNpwp] = useState(initialTenant?.npwp || "");
  const [tagline, setTagline] = useState(initialTenant?.tagline || "");
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  // Fallback to localStorage cache if initialTenant was not available on server
  useEffect(() => {
    if (!initialTenant) {
      try {
        const cached = localStorage.getItem("cached_tenant");
        if (cached) {
          const data = JSON.parse(cached);
          if (data.companyName) setCompanyName((prev) => prev || data.companyName);
          if (data.ownerName) setOwnerName((prev) => prev || data.ownerName);
          if (data.identifier) setIdentifier((prev) => prev || data.identifier);
        }
      } catch {}

      // Background fresh fetch only if server didn't provide data
      fetch("/api/tenant/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setCompanyName(data.companyName || "");
            setOwnerName(data.ownerName || "");
            setIdentifier(data.identifier || "");
            setAppAddress(data.address || "");
            setPhone(data.phone || "");
            setNpwp(data.npwp || "");
            setTagline(data.tagline || "");
          }
        })
        .catch((e) => console.error("Failed to load tenant fallback:", e));
    }
  }, [initialTenant]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Nama Usaha / Toko wajib diisi");
      return;
    }
    if (newPin && !/^\d{6}$/.test(newPin)) {
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
        phone,
        npwp,
        tagline,
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

      // Update local storage cache
      try {
        localStorage.setItem(
          "cached_tenant",
          JSON.stringify({
            companyName,
            ownerName,
            identifier,
          })
        );
      } catch {}

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
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-20 font-sans animate-in fade-in duration-100">
      {/* Header with instant back action & clear visual hierarchy */}
      <div className="border-b border-slate-200/90 pb-4 space-y-3">
        {/* Navigation Action Top Bar */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1 text-slate-600" /> Dashboard
          </Button>

          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pengaturan Akun
          </span>
        </div>

        {/* Title & Description with Dedicated Icon Badge */}
        <div className="flex items-start gap-3 pt-0.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs mt-0.5">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Pengaturan Profil Usaha
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Data ini digunakan untuk identitas pembukuan dan kop surat resmi (Kertas A4).
            </p>
          </div>
        </div>
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
              <Label htmlFor="companyName" className="text-xs font-bold text-slate-700">
                Nama Usaha / Toko / CV *
              </Label>
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
                <Label htmlFor="ownerName" className="text-xs font-bold text-slate-700">
                  Nama Pemilik / Pengelola
                </Label>
                <Input
                  id="ownerName"
                  placeholder="Contoh: Budi Prasetyo"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-xs font-bold text-slate-700">
                  Username / ID Login
                </Label>
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
              <Label htmlFor="appAddress" className="text-xs font-bold text-slate-700">
                Alamat Usaha / Gudang
              </Label>
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
                <Label htmlFor="appPhone" className="text-xs font-bold text-slate-700">
                  Nomor Telepon / WhatsApp
                </Label>
                <Input
                  id="appPhone"
                  placeholder="Contoh: 0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="npwp" className="text-xs font-bold text-slate-700">
                  NPWP Usaha (Opsional)
                </Label>
                <Input
                  id="npwp"
                  placeholder="00.000.000.0-000.000"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  className="h-10 text-sm font-medium"
                />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="tagline" className="text-xs font-bold text-slate-700">
                  Slogan / Sub-judul Kop Surat
                </Label>
                <Input
                  id="tagline"
                  placeholder="Contoh: Trading & Distribusi (Retail & Grosir)"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
            >
              {loading ? "Menyimpan Perubahan..." : "Simpan Profil Usaha"}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" /> Kembali ke Dashboard
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
