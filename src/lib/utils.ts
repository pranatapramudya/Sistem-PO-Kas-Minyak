/**
 * Format number to Indonesian Rupiah string
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 * Example: new Date() -> "29 Sep 2026"
 */
export function formatDateIndo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export function formatDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Convert number to Indonesian words (Terbilang)
 * Example: 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah"
 */
const units = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

const tens = [
  "",
  "",
  "Dua Puluh",
  "Tiga Puluh",
  "Empat Puluh",
  "Lima Puluh",
  "Enam Puluh",
  "Tujuh Puluh",
  "Delapan Puluh",
  "Sembilan Puluh",
];

function convertHundreds(num: number): string {
  if (num === 0) return "";
  if (num < 12) return units[num];
  if (num < 20) return units[num - 10] + " Belas";
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "");
  return units[Math.floor(num / 100)] + " Ratus" + (num % 100 ? " " + convertHundreds(num % 100) : "");
}

export function terbilang(num: number): string {
  if (num === 0) return "Nol Rupiah";
  if (num < 0) return "Minus " + terbilang(Math.abs(num));

  let result = "";
  const billions = Math.floor(num / 1_000_000_000);
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((num % 1_000_000) / 1_000);
  const hundreds = num % 1_000;

  if (billions > 0) result += convertHundreds(billions) + " Miliar ";
  if (millions > 0) result += convertHundreds(millions) + " Juta ";
  if (thousands > 0) {
    if (thousands === 1) result += "Seribu ";
    else result += convertHundreds(thousands) + " Ribu ";
  }
  if (hundreds > 0) result += convertHundreds(hundreds) + " ";

  return result.trim() + " Rupiah";
}

/**
 * Generate PO Number: PO-YYYYMM-NNNN
 */
export function generatePONumber(existingCount: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(existingCount + 1).padStart(4, "0");
  return `PO-${year}${month}-${sequence}`;
}

/**
 * Calculate PO status based on totalCost and totalCashInflow
 */
export function calculatePOStatus(totalCost: number, totalCashInflow: number): "OUTSTANDING" | "PARTIAL" | "CLOSED" {
  if (totalCashInflow >= totalCost) return "CLOSED";
  if (totalCashInflow > 0) return "PARTIAL";
  return "OUTSTANDING";
}

/**
 * Calculate profit: cashInflow - totalCost
 */
export function calculateProfit(totalCost: number, totalCashInflow: number): number {
  return totalCashInflow - totalCost;
}

/**
 * CN (Classnames) utility - merge tailwind classes
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}