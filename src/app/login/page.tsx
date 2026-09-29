"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Delete, ShieldCheck, AlertCircle, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "CHECKING" | "SETUP_CREATE" | "SETUP_CONFIRM" | "LOGIN" | "RESET";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("CHECKING");
  const [pin, setPin] = useState("");
  const [createdPin, setCreatedPin] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  // Check whether a PIN has already been set up in Neon database
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          if (data.isInitialized) {
            setMode("LOGIN");
          } else {
            setMode("SETUP_CREATE");
          }
        } else {
          setMode("LOGIN");
        }
      } catch {
        setMode("LOGIN");
      }
    }
    checkStatus();
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
        handleCompletePin(nextPin);
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

  const handleCompletePin = async (inputPin: string) => {
    if (mode === "LOGIN") {
      submitLogin(inputPin);
    } else if (mode === "SETUP_CREATE") {
      setCreatedPin(inputPin);
      setPin("");
      setError(null);
      setMode("SETUP_CONFIRM");
    } else if (mode === "SETUP_CONFIRM") {
      if (inputPin !== createdPin) {
        triggerShake("PIN konfirmasi tidak cocok. Silakan buat ulang.");
        setCreatedPin("");
        setMode("SETUP_CREATE");
        return;
      }
      submitSetup(inputPin);
    }
  };

  // Submit Login
  const submitLogin = async (pinToSubmit: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToSubmit, remember }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "PIN yang dimasukkan salah.");
      }

      router.replace("/");
      router.refresh();
    } catch (err: any) {
      triggerShake(err.message || "PIN salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Submit First-Time Setup
  const submitSetup = async (pinToSubmit: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToSubmit, recoveryKey: "sim2026" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat PIN.");
      }

      setSuccessMsg("PIN berhasil dibuat! Mengalihkan...");
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 700);
    } catch (err: any) {
      triggerShake(err.message || "Gagal membuat PIN. Silakan ulangi.");
      setMode("SETUP_CREATE");
      setCreatedPin("");
    } finally {
      setLoading(false);
    }
  };

  // Submit Reset PIN via Recovery Key
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKey.trim()) {
      setError("Masukkan kode pemulihan.");
      return;
    }
    if (pin.length !== 6) {
      setError("PIN baru harus 6 digit angka.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryKey: recoveryKey.trim(), newPin: pin }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Kode pemulihan salah.");
      }

      setSuccessMsg("PIN berhasil direset! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Gagal mereset PIN.");
    } finally {
      setLoading(false);
    }
  };

  // Allow physical keyboard for numeric input
  useEffect(() => {
    if (mode === "RESET" || mode === "CHECKING") return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [pin, mode, loading, createdPin]);

  if (mode === "CHECKING") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat sistem keamanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between items-center p-4 sm:p-6 select-none font-sans">
      {/* Top Header */}
      <div className="pt-6 sm:pt-8 flex flex-col items-center text-center space-y-3 w-full max-w-xs">
        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
          {mode === "RESET" ? (
            <KeyRound className="w-6 h-6" />
          ) : mode === "SETUP_CREATE" || mode === "SETUP_CONFIRM" ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Sistem PO &amp; Kas Minyak
          </h1>
          {mode === "LOGIN" && (
            <p className="text-xs text-slate-500">
              Masukkan 6 digit PIN Anda untuk masuk
            </p>
          )}
        </div>

        {/* Clear Step-by-Step Instruction Cards */}
        {mode === "SETUP_CREATE" && (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center space-y-1 w-full animate-in fade-in duration-200">
            <p className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Langkah 1 dari 2: Buat PIN Baru
            </p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Tekan <strong>6 angka</strong> pilihan Anda pada tombol keypad di bawah untuk dijadikan PIN login rahasia.
            </p>
          </div>
        )}

        {mode === "SETUP_CONFIRM" && (
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-center space-y-1 w-full animate-in fade-in duration-200">
            <p className="text-xs font-bold text-blue-900 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Langkah 2 dari 2: Konfirmasi PIN
            </p>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Ketik kembali <strong>6 angka yang sama</strong> untuk memastikan Anda tidak salah tekan.
            </p>
          </div>
        )}

        {mode === "RESET" && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center space-y-1 w-full animate-in fade-in duration-200">
            <p className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Pemulihan &amp; Ganti PIN
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Masukkan kode pemulihan master lalu tentukan PIN baru Anda.
            </p>
          </div>
        )}
      </div>

      {/* Main Body */}
      {mode === "RESET" ? (
        /* Reset PIN View */
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 my-auto">
          <div className="flex items-center gap-2 border-b pb-3">
            <button
              onClick={() => {
                setError(null);
                setPin("");
                setMode("LOGIN");
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Kembali ke Login"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-900">Reset PIN Anda</h2>
          </div>

          <form onSubmit={handleResetSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Kode Pemulihan (Recovery Key)</label>
              <Input
                type="text"
                placeholder="Default: sim2026"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                className="h-10 text-xs sm:text-sm font-mono border-slate-300"
                autoFocus
              />
              <p className="text-[11px] text-slate-500">Kode standar master: <code>sim2026</code></p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">PIN Baru (6 Digit Angka)</label>
              <Input
                type="password"
                maxLength={6}
                placeholder="Contoh: 123456"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="h-10 text-xs sm:text-sm font-mono tracking-widest text-center border-slate-300"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {successMsg}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || pin.length !== 6 || !recoveryKey}
              className="w-full h-10 font-bold bg-slate-900 hover:bg-slate-800 text-white"
            >
              {loading ? "Menyimpan PIN Baru..." : "Simpan & Masuk ke Aplikasi"}
            </Button>
          </form>
        </div>
      ) : (
        /* PIN Keypad View (Light Theme) */
        <div className="w-full max-w-xs flex flex-col items-center space-y-4 sm:space-y-5 my-auto py-2">
          {/* 6 Dot Indicators */}
          <div
            className={`flex items-center justify-center gap-3.5 transition-transform duration-150 ${
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
          <div className="h-6 flex items-center justify-center text-center">
            {loading ? (
              <p className="text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Memproses keamanan...
              </p>
            ) : successMsg ? (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {successMsg}
              </p>
            ) : error ? (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            ) : mode === "SETUP_CREATE" ? (
              <p className="text-xs text-emerald-800 font-semibold">
                Tekan 6 angka pada tombol keypad di bawah
              </p>
            ) : mode === "SETUP_CONFIRM" ? (
              <p className="text-xs text-blue-800 font-semibold">
                Ketik kembali 6 angka yang sama seperti sebelumnya
              </p>
            ) : (
              <p className="text-xs text-slate-600 font-medium">
                Ketik 6 digit PIN untuk membuka aplikasi
              </p>
            )}
          </div>

          {/* Numeric Keypad Grid (Light Mode) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full pt-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                disabled={loading}
                className="h-14 sm:h-15 rounded-2xl bg-white hover:bg-slate-100/80 active:bg-slate-900 active:text-white border border-slate-200/90 text-xl font-bold font-mono text-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-xs disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Bottom Row */}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="h-14 sm:h-15 rounded-2xl text-[11px] sm:text-xs font-bold text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 touch-manipulation cursor-pointer"
            >
              HAPUS
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              disabled={loading}
              className="h-14 sm:h-15 rounded-2xl bg-white hover:bg-slate-100/80 active:bg-slate-900 active:text-white border border-slate-200/90 text-xl font-bold font-mono text-slate-800 transition-all active:scale-95 flex items-center justify-center shadow-xs disabled:opacity-50 touch-manipulation cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-14 sm:h-15 rounded-2xl bg-slate-100/60 hover:bg-slate-200/80 active:scale-95 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center disabled:opacity-30 touch-manipulation cursor-pointer border border-slate-200/60"
              title="Hapus Satu Digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Actions: Remember me & Lupa PIN */}
          <div className="flex flex-col items-center gap-2 pt-2 w-full">
            {mode === "LOGIN" && (
              <>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-0 accent-slate-900 cursor-pointer"
                  />
                  <span>Ingat perangkat ini (30 Hari)</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPin("");
                    setMode("RESET");
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold hover:underline pt-1 cursor-pointer"
                >
                  Lupa PIN? Reset di sini
                </button>
              </>
            )}

            {mode === "SETUP_CONFIRM" && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPin("");
                  setCreatedPin("");
                  setMode("SETUP_CREATE");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ulangi Buat PIN Baru
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pb-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          🔒 Aplikasi Private &bull; Sesi tersimpan aman di perangkat Anda
        </p>
      </div>
    </div>
  );
}
