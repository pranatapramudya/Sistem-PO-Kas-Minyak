"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

interface ProofPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string | null;
  title?: string;
  subtitle?: string;
}

function getBlobFromDataUrl(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const header = parts[0] || "";
  const base64 = parts[1] || "";
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

export function ProofPreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  title = "Lampiran Bukti Transaksi",
  subtitle,
}: ProofPreviewDialogProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Reset zoom on open
  React.useEffect(() => {
    if (open) {
      setZoomLevel(1);
      setHasError(false);
    }
  }, [open, fileUrl]);

  if (!fileUrl) return null;

  const isPdf =
    fileUrl.startsWith("data:application/pdf") ||
    fileUrl.toLowerCase().endsWith(".pdf");

  const handleOpenInNewTab = () => {
    if (!fileUrl) return;
    if (fileUrl.startsWith("data:")) {
      try {
        const blob = getBlobFromDataUrl(fileUrl);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      } catch (err) {
        console.error("Gagal membuka tab baru dari data URL:", err);
      }
    }
    window.open(fileUrl, "_blank");
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    let downloadUrl = fileUrl;
    let shouldRevoke = false;

    if (fileUrl.startsWith("data:")) {
      try {
        const blob = getBlobFromDataUrl(fileUrl);
        downloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      } catch (err) {
        console.error("Gagal menyiapkan unduhan:", err);
      }
    }

    const ext = isPdf
      ? "pdf"
      : fileUrl.includes("png")
      ? "png"
      : fileUrl.includes("webp")
      ? "webp"
      : "jpg";

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `bukti-struk-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <DialogHeader className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {isPdf ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-base font-semibold text-white truncate">
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">{subtitle}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content Preview */}
        <div className="relative flex-1 overflow-auto bg-slate-950 p-2 sm:p-4 flex items-center justify-center min-h-[300px] max-h-[68vh]">
          {hasError ? (
            <div className="text-center p-6 space-y-2">
              <p className="text-xs text-rose-400">Gagal memuat pratinjau gambar.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Coba Unduh File Langsung
              </Button>
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-[60vh] rounded border border-slate-800 bg-white"
              title="Preview Dokumen PDF"
            />
          ) : (
            <div className="relative overflow-auto max-w-full max-h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt="Lampiran Struk"
                onError={() => setHasError(true)}
                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                className="max-h-[62vh] w-auto max-w-full object-contain rounded-md shadow-2xl mx-auto origin-center"
              />
            </div>
          )}

          {/* Floating Zoom Controls for Images */}
          {!isPdf && !hasError && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg z-10">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full"
                title="Perkecil"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] font-mono text-slate-300 px-1 select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full"
                title="Perbesar"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              {zoomLevel !== 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoomLevel(1)}
                  className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full"
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Unduh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleOpenInNewTab}
              className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
              title="Buka tampilan penuh di jendela baru"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Tab Baru
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
