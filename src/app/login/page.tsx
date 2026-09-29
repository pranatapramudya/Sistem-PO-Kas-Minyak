"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Delete, AlertCircle, KeyRound, ArrowLeft, CheckCircle2, Building, UserPlus, LogIn } from "lucide-react";
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

  // Submit Reset PIN
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setError("Username / No. HP toko wajib diisi.");
      return;
    }
    if (!recoveryKey.trim()) {
      setError("Kode pemulihan (master key) wajib diisi.");
      return;
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError("PIN baru harus berupa 6 digit angka.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: resetIdentifier.trim(),
          recoveryKey: recoveryKey.trim(),
          newPin: newPin.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengatur ulang PIN. Periksa kode pemulihan Anda.");
      }

      try {
        localStorage.setItem("last_identifier", resetIdentifier.trim());
      } catch {}

      setSuccessMsg("PIN berhasil diperbarui! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Gagal mengatur ulang PIN.");
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
        {mode === "RESET" ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              setPin("");
              setMode("LOGIN");
            }}
            className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-50 cursor-pointer mt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" /> Kembali ke Pilihan Masuk / Daftar
          </button>
        ) : (
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
        )}
      </div>

      {/* Mode: REGISTER */}
      {mode === "REGISTER" && (
        <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 my-auto">
          {/* Helper Guidance Callout */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pendaftaran Toko Baru:</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Belum punya akun? Isi data toko di bawah ini untuk memulai pembukuan PO &amp; kas minyak Anda. Data Anda 100% terisolasi khusus untuk usaha Anda.
            </p>
          </div>

          <div className="border-b pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" /> Formulir Buka Akun Toko
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hanya butuh 30 detik untuk membuat akun usaha Anda.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Usaha / Toko *</label>
              <Input
                placeholder="Contoh: Toko Minyak Barokah / CV. Sawit"
                value={regCompanyName}
                onChange={(e) => setRegCompanyName(e.target.value)}
                className="h-10 text-xs sm:text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Username / No. WhatsApp (Untuk Login) *</label>
              <Input
                placeholder="Contoh: 085812345678 atau nama_anda"
                value={regIdentifier}
                onChange={(e) => setRegIdentifier(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className="h-10 text-xs sm:text-sm font-mono font-medium"
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
                  className="h-10 text-xs sm:text-sm font-mono tracking-widest text-center font-bold"
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
                  className="h-10 text-xs sm:text-sm font-mono tracking-widest text-center font-bold"
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
              className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs mt-2"
            >
              {loading ? "Mendaftarkan Usaha..." : "Daftar & Buka Aplikasi"}
            </Button>
          </form>

          {/* Quick switch to Login if already have account */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPin("");
                setMode("LOGIN");
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-600" />
              Sudah punya akun toko? Masuk ke Akun Anda
            </button>
          </div>
        </div>
      )}

      {/* Mode: RESET */}
      {mode === "RESET" && (
        <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 my-auto">
          {/* Helper Guidance Callout */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Pemulihan PIN Akun Toko:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Masukkan Username/No. HP toko Anda, kode pemulihan (default: <code className="font-bold bg-amber-100/90 px-1 py-0.5 rounded text-amber-950">sim2026</code>), dan buat 6 angka PIN baru.
            </p>
          </div>

          <div className="border-b pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" /> Atur Ulang PIN (Reset PIN)
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Akses akun toko Anda akan segera dipulihkan setelah PIN diperbarui.
            </p>
          </div>

          <form onSubmit={handleResetSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Akun / Username / No. HP Toko *</label>
              <Input
                placeholder="Contoh: 08123456789 atau admin"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className="h-10 text-xs sm:text-sm font-mono font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kode Pemulihan (Master Key) *</label>
              <Input
                type="text"
                placeholder="Default: sim2026"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                className="h-10 text-xs sm:text-sm font-mono"
                required
              />
              <p className="text-[10px] text-slate-400">Kode standar master bawaan: <code className="font-mono text-slate-700 font-bold bg-slate-100 px-1 rounded">sim2026</code></p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Buat PIN Baru (6 Digit Angka) *</label>
              <Input
                type="password"
                maxLength={6}
                placeholder="Contoh: 123456"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className="h-10 text-xs sm:text-sm font-mono tracking-widest text-center font-bold"
                required
              />
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
              disabled={loading || newPin.length !== 6 || !recoveryKey.trim()}
              className="w-full h-11 font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs mt-2"
            >
              {loading ? "Menyimpan PIN Baru..." : "Simpan PIN & Masuk"}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setPin("");
                setMode("LOGIN");
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              Kembali ke Halaman Masuk
            </button>
          </div>
        </div>
      )}

      {/* Mode: LOGIN (Keypad 0-Latency) */}
      {mode === "LOGIN" && (
        <div className="w-full max-w-[360px] sm:max-w-sm flex flex-col items-center space-y-3.5 my-auto py-1">
          {/* Helper Guidance Callout */}
          <div className="w-full bg-blue-50/80 border border-blue-200/80 rounded-xl p-2.5 text-left space-y-0.5">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Masuk ke Toko Anda
              </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPin("");
                  setMode("REGISTER");
                }}
                className="text-emerald-700 hover:underline text-[11px] font-bold"
              >
                + Belum Punya Akun?
              </button>
            </div>
            <p className="text-[11px] text-blue-800 leading-snug">
              Jika <strong>sudah punya akun</strong>, ketik Username/No. HP lalu tekan 6 angka PIN. Jika <strong>belum punya akun</strong>, silakan daftar baru terlebih dahulu.
            </p>
          </div>

          {/* Identifier Input Bar */}
          <div className="w-full bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Akun / Username / No. HP Toko</span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPin("");
                  setMode("REGISTER");
                }}
                className="text-emerald-700 hover:underline font-bold"
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
              className="h-10 text-sm font-mono border-slate-200 font-bold text-slate-900"
            />
          </div>

          {/* 6 Dot Indicators */}
          <div
            className={`flex items-center justify-center gap-3.5 sm:gap-4 transition-transform duration-150 py-1 ${
              isShaking ? "animate-bounce text-rose-500" : ""
            }`}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-100 ${
                  i < pin.length
                    ? "bg-slate-900 border-slate-900 shadow-sm scale-110"
                    : "border-slate-300 bg-white"
                }`}
              />
            ))}
          </div>

          {/* Status / Message Display */}
          <div className="min-h-[28px] flex items-center justify-center text-center px-2">
            {loading ? (
              <p className="text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Memeriksa keamanan akun...
              </p>
            ) : error ? (
              <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1 animate-in fade-in duration-200 leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Ketik 6 digit PIN akun toko Anda pada tombol di bawah
              </p>
            )}
          </div>

          {/* Numeric Keypad Grid (Besar & Jelas di HP) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                disabled={loading}
                className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-900 active:text-white border-2 border-slate-200/90 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 transition-all active:scale-95 flex items-center justify-center shadow-xs disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Bottom Row */}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="h-14 sm:h-16 rounded-2xl text-xs sm:text-sm font-black text-rose-600 bg-rose-50/70 hover:bg-rose-100 active:scale-95 border border-rose-200/80 transition-all flex items-center justify-center disabled:opacity-30 touch-manipulation cursor-pointer shadow-2xs"
            >
              HAPUS
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              disabled={loading}
              className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-900 active:text-white border-2 border-slate-200/90 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 transition-all active:scale-95 flex items-center justify-center shadow-xs disabled:opacity-50 touch-manipulation cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-14 sm:h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center disabled:opacity-30 touch-manipulation cursor-pointer border border-slate-200 shadow-2xs"
              title="Hapus Satu Digit"
            >
              <Delete className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Quick Switch Button to Register if No Account */}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setPin("");
              setMode("REGISTER");
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            Belum punya akun usaha? Daftar Toko Baru di Sini
          </button>

          {/* Remember me & Action Links */}
          <div className="flex flex-col items-center gap-2 pt-1 w-full text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-0 accent-slate-900 cursor-pointer"
              />
              <span>Ingat perangkat ini (30 Hari)</span>
            </label>

            {/* Tombol Lupa PIN */}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setResetIdentifier(identifier.trim() || "admin");
                setRecoveryKey("");
                setNewPin("");
                setMode("RESET");
              }}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline inline-flex items-center gap-1.5 py-1 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              Lupa PIN? Reset di sini
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pb-3 text-center space-y-1">
        <p className="text-xs text-slate-400 font-medium">
          🔒 Multi-Tenant Aman &bull; Data tiap usaha terpisah 100%
        </p>
      </div>
    </div>
  );
}
