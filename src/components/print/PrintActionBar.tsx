"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintActionBar({ poNumber }: { poNumber: string }) {
  return (
    <div className="no-print bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 px-3 sm:px-6 py-2.5 sticky top-0 z-50 shadow-xs mb-4">
      <div className="max-w-[210mm] mx-auto flex items-center justify-between gap-2">
        {/* Back to Dashboard Button */}
        <Link href="/" className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 sm:px-3 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>

        {/* Title / PO Badge (Centered & Never Overlapping) */}
        <div className="min-w-0 flex-1 text-center px-1">
          <div className="flex items-center justify-center gap-1.5 truncate">
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {poNumber}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              Standar A4
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">
            Pratinjau Cetak Surat Pesanan Resmi
          </p>
        </div>

        {/* Print Button */}
        <div className="shrink-0">
          <Button
            onClick={() => window.print()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-9 px-3 sm:px-4 font-bold shadow-xs flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Cetak Sekarang</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
