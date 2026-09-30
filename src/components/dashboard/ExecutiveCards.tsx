"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, cn } from "@/lib/utils";

interface ExecutiveCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: "blue" | "orange" | "green" | "gray";
  icon?: React.ReactNode;
  isCurrency?: boolean;
  trend?: { value: number; label: string };
}

const colorStyles = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    badge: "text-blue-700",
    topLine: "border-t-blue-500",
  },
  orange: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    badge: "text-amber-700",
    topLine: "border-t-amber-500",
  },
  green: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    badge: "text-emerald-700",
    topLine: "border-t-emerald-500",
  },
  gray: {
    iconBg: "bg-slate-50 text-slate-600 border border-slate-200",
    badge: "text-slate-700",
    topLine: "border-t-slate-400",
  },
};

export function ExecutiveCard({
  title,
  value,
  subtitle,
  color = "blue",
  icon,
  isCurrency = true,
  trend,
}: ExecutiveCardProps) {
  const displayValue =
    typeof value === "number"
      ? isCurrency
        ? formatRupiah(value)
        : `${value.toLocaleString("id-ID")} PO`
      : value;

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <Card className={cn(
      "border border-slate-200/90 shadow-xs hover:shadow-sm bg-white rounded-xl transition-all overflow-hidden flex flex-col justify-between border-t-[3px]",
      style.topLine
    )}>
      <CardContent className="pt-4 sm:pt-4.5 pb-3.5 sm:pb-4 px-3.5 sm:px-4 flex flex-col justify-between h-full space-y-2.5">
        {/* Top Row: Title + Icon */}
        <div className="flex items-start justify-between gap-1.5 min-h-[2.25rem]">
          <p className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-700 leading-snug break-words">
            {title}
          </p>
          {icon && (
            <div className={cn("p-1.5 rounded-lg shrink-0", style.iconBg)}>
              {icon}
            </div>
          )}
        </div>

        {/* Big Number: Full card width */}
        <div>
          <p className="text-sm sm:text-lg md:text-2xl font-black font-mono tracking-tight text-slate-900 leading-tight break-words">
            {displayValue}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight break-words">
              {subtitle}
            </p>
          )}

          {trend && (
            <p className={cn("text-xs mt-1 font-semibold", trend.value >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}