import { POStatus, PaymentMethod } from "@/lib/validations";

export interface OrderItem {
  id: string;
  poId: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface CashInflow {
  id: string;
  poId: string;
  amount: number;
  receivedDate: Date | string;
  paymentMethod: PaymentMethod;
  proofFileUrl: string | null;
  notes: string | null;
  createdAt: Date | string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: Date | string;
  supplierName: string;
  status: POStatus;
  totalCost: number;
  expectedRevenue: number;
  proofFileUrl: string | null;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderItem[];
  cashInflow: CashInflow[];
}

export interface DashboardPO extends PurchaseOrder {
  totalCashInflow: number;
  profit: number;
  itemSummary: string; // "Minyak Goreng Curah (50), Jerigen 18L (20)"
}

export interface ExecutiveMetrics {
  activeCapital: number;        // 80jt - total outstanding modal
  outstandingReceivables: number; // total piutang berjalan
  monthlyProfit: number;        // total laba bulan ini
  closedPOCount: number;        // total PO selesai
}

export interface FilterParams {
  month?: string; // YYYY-MM
  year?: string;  // YYYY
  search?: string;
  status?: POStatus | "ALL";
}

export interface Settings {
  appName: string;
  appAddress: string;
  appPhone: string;
  npwp: string;
}

export interface POFormData {
  date: string;
  supplierName: string;
  subject?: string;
  deliveryTarget?: string;
  items: {
    itemName: string;
    qty: number;
    unit: string;
    unitPrice: number;
  }[];
  expectedRevenue: number;
  notes: string;
  proofFile?: File | null;
}

export interface CashInflowFormData {
  poId: string;
  amount: number;
  receivedDate: string;
  paymentMethod: PaymentMethod;
  notes: string;
  proofFile: File | null;
}