"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Delete, ShieldCheck, AlertCircle, KeyRound, ArrowLeft, CheckCircle2, Building, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "LOGIN" | "REGISTER" | "RESET";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("LOGIN");

  // Login states
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [remember, setRemember] = useState(true);

  // Register states
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regPinConfirm, setRegPinConfirm] = useState("");

  // Reset states
  const [recoveryKey, setRecoveryKey] = useState("");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [newPin, setNewPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Load last used identifier from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("last_identifier");
      if (saved) {
        setIdentifier(saved);
      } else {
        setIdentifier("admin");
      }
    } catch {
      setIdentifier("admin");
    }
  }, []);

  const triggerShake = (errMsg: string) => {
    setError(errMsg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setPin("");
  };

  const handleKeyPress = (num: string) => {
    if (loading) return;
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(null);

      // Auto submit when 6 digits reached
      if (nextPin.length === 6) {
        submitLogin(identifier, nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  // Submit Login
  const submitLogin = async (idToSubmit: string, pinToSubmit: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: idToSubmit.trim() || "admin",
          pin: pinToSubmit,
          remember,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Username atau PIN salah.");
      }

      // Save identifier for future logins
      try {
        localStorage.setItem("last_identifier", idToSubmit.trim() || "admin");
      } catch {}

      router.replace("/");
      router.refresh();
    } catch (err: any) {
      triggerShake(err.message || "Login gagal. Periksa username dan PIN Anda.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Register New Tenant
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName.trim()) {
      setError("Nama Usaha / Toko wajib diisi.");
      return;
    }
    if (!regIdentifier.trim()) {
      setError("Username / No. WhatsApp wajib diisi untuk login.");
      return;
    }
    if (regPin.length !== 6 || !/^\d{6}$/.test(regPin)) {
      setError("PIN harus 6 digit angka.");
      return;
    }
    if (regPin !== regPinConfirm) {
      setError("Konfirmasi PIN tidak cocok.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: regCompanyName.trim(),
          identifier: regIdentifier.trim(),
          ownerName: regOwnerName.trim() || undefined,
          pin: regPin,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan usaha baru.");
      }

      try {
        localStorage.setItem("last_identifier", regIdentifier.trim());
      } catch {}

      setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  // Physical keyboard support for numeric input
  useEffect(() => {
    if (mode !== "LOGIN") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in the identifier input
      if (document.activeElement?.tagName === "INPUT") return;

      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, mode, loading, identifier]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <div className="pt-4 sm:pt-6 flex flex-col items-center text-center space-y-2.5 w-full max-w-sm">
        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
          {mode === "REGISTER" ? (
            <UserPlus className="w-6 h-6 text-emerald-600" />
          ) : mode === "RESET" ? (
            <KeyRound className="w-6 h-6 text-amber-600" />
          ) : (
            <Lock className="w-6 h-6 text-slate-900" />
          )}
        </div>

        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Sistem PO &amp; Kas Minyak
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Platform Manajemen Pembukuan PO &amp; Kas Minyak
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl w-full text-xs font-bold gap-1 mt-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              setPin("");
              setMode("LOGIN");
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "LOGIN"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              setMode("REGISTER");
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "REGISTER"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Daftar Baru
          </button>
        </div>
      </div>

      {/* Mode: REGISTER */}
      {mode === "REGISTER" && (
        <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 my-auto">
          <div className="border-b pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" /> Daftar Toko / Usaha Baru
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Data transaksi Anda akan terpisah khusus untuk usaha Anda sendiri.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Usaha / Toko *</label>
              <Input
                placeholder="Contoh: Toko Minyak Barokah / CV. Sawit"
                value={regCompanyName}
                onChange={(e) => setRegCompanyName(e.target.value)}
                className="h-10 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Username / No. WhatsApp (Untuk Login) *</label>
              <Input
                placeholder="Contoh: 085812345678 atau nama_anda"
                value={regIdentifier}
                onChange={(e) => setRegIdentifier(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className="h-10 text-xs sm:text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Pemilik / Pengelola (Opsional)</label>
              <Input
                placeholder="Contoh: Budi Prasetyo"
                value={regOwnerName}
                onChange={(e) => setRegOwnerName(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Buat PIN (6 Angka) *</label>
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="123456"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ""))}
                  className="h-10 text-xs sm:text-sm font-mono tracking-widest text-center"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ulangi PIN *</label>
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="123456"
                  value={regPinConfirm}
                  onChange={(e) => setRegPinConfirm(e.target.value.replace(/\D/g, ""))}
                  className="h-10 text-xs sm:text-sm font-mono tracking-widest text-center"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {successMsg}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs mt-2"
            >
              {loading ? "Mendaftarkan Usaha..." : "Daftar & Buka Aplikasi"}
            </Button>
          </form>
        </div>
      )}

      {/* Mode: LOGIN (Keypad 0-Latency) */}
      {mode === "LOGIN" && (
        <div className="w-full max-w-xs flex flex-col items-center space-y-3.5 my-auto py-1">
          {/* Identifier Input Bar */}
          <div className="w-full bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Akun / Username Toko</span>
              <button
                type="button"
                onClick={() => setMode("REGISTER")}
                className="text-emerald-700 hover:underline"
              >
                + Daftar Toko Baru
              </button>
            </div>
            <Input
              type="text"
              placeholder="Username atau No. HP (Default: admin)"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(null);
              }}
              className="h-9 text-xs sm:text-sm font-mono border-slate-200 font-medium"
            />
          </div>

          {/* 6 Dot Indicators */}
          <div
            className={`flex items-center justify-center gap-3.5 transition-transform duration-150 pt-1 ${
              isShaking ? "animate-bounce text-rose-500" : ""
            }`}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-100 ${
                  i < pin.length
                    ? "bg-slate-900 border-slate-900 shadow-xs scale-110"
                    : "border-slate-300 bg-white"
                }`}
              />
            ))}
          </div>

          {/* Status / Message Display */}
          <div className="h-5 flex items-center justify-center text-center">
            {loading ? (
              <p className="text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Memeriksa keamanan...
              </p>
            ) : error ? (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Masukkan 6 digit PIN akun Anda
              </p>
            )}
          </div>

          {/* Numeric Keypad Grid (Light Mode) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                disabled={loading}
                className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-900 active:text-white border border-slate-200/90 text-xl font-bold font-mono text-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-xs disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Bottom Row */}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="h-13 sm:h-14 rounded-2xl text-[11px] sm:text-xs font-bold text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 touch-manipulation cursor-pointer"
            >
              HAPUS
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              disabled={loading}
              className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-900 active:text-white border border-slate-200/90 text-xl font-bold font-mono text-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-xs disabled:opacity-50 touch-manipulation cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-13 sm:h-14 rounded-2xl bg-slate-100/60 hover:bg-slate-200/80 active:scale-95 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center disabled:opacity-30 touch-manipulation cursor-pointer border border-slate-200/60"
              title="Hapus Satu Digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Remember me & Action Links */}
          <div className="flex flex-col items-center gap-1.5 pt-1 w-full text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-0 accent-slate-900 cursor-pointer"
              />
              <span>Ingat perangkat ini (30 Hari)</span>
            </label>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pb-3 text-center">
        <p className="text-xs text-slate-400 font-medium">
          🔒 Multi-Tenant Aman &bull; Data tiap usaha terpisah 100%
        </p>
      </div>
    </div>
  );
}
