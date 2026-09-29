"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemBadge?: string;
  itemDetail?: string;
  warningNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Konfirmasi Hapus Data",
  description = "Tindakan ini permanen dan tidak dapat dibatalkan.",
  itemBadge,
  itemDetail,
  warningNote,
  confirmLabel = "Ya, Hapus Data",
  cancelLabel = "Batal",
  isLoading = false,
  onConfirm,
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="max-w-md w-full p-5 sm:p-6 bg-white text-slate-900 border border-slate-200 shadow-xl rounded-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Icon Badge */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              variant === "danger"
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-6 h-6 animate-in zoom-in-50 duration-200" />
            ) : (
              <AlertTriangle className="w-6 h-6 animate-in zoom-in-50 duration-200" />
            )}
          </div>

          {/* Texts */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <DialogHeader className="p-0 text-center sm:text-left">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>

            {/* Optional Item Highlight Box */}
            {(itemBadge || itemDetail) && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
                {itemBadge && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Item Terpilih:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {itemBadge}
                    </span>
                  </div>
                )}
                {itemDetail && <div className="text-slate-700 font-medium">{itemDetail}</div>}
              </div>
            )}

            {/* Optional Warning Note */}
            {warningNote && (
              <div className="mt-2 text-[11px] text-red-600 bg-red-50/60 p-2 rounded border border-red-100 flex items-start gap-1.5 text-left">
                <span className="font-bold shrink-0">Perhatian:</span>
                <span>{warningNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="mt-5 pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto h-9 text-slate-700 border-slate-200 hover:bg-slate-50 font-medium"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto h-9 font-semibold text-white shadow-xs gap-1.5 ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
