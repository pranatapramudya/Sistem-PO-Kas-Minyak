"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: Event) => {
      // Prevent automatic mini-infobar on mobile Chrome
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-3.5 py-2.5 rounded-xl shadow-md border border-slate-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="truncate">
          <p className="text-xs font-bold leading-tight truncate">
            Pasang Aplikasi di HP (PWA)
          </p>
          <p className="text-[11px] text-slate-300 leading-tight truncate">
            Akses cepat tanpa browser &amp; layar penuh
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="h-8 px-3 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Install
        </Button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
