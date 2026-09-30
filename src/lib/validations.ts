import { z } from "zod";

/**
 * Unit options for order items
 */
export const UNIT_OPTIONS = [
  "Dus",
  "Karton",
  "Karung",
  "Sak",
  "Bal",
  "Pack",
  "Kg",
  "Liter",
  "Pcs",
  "Jerigen",
  "Drum",
  "Krat",
  "Kaleng",
  "Renceng",
  "Box",
] as const;
export type Unit = (typeof UNIT_OPTIONS)[number];

/**
 * Payment method options
 */
export const PAYMENT_METHOD_OPTIONS = ["TRANSFER_BANK", "TUNAI"] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number];

/**
 * PO Status options
 */
export const PO_STATUS_OPTIONS = ["OUTSTANDING", "PARTIAL", "CLOSED"] as const;
export type POStatus = (typeof PO_STATUS_OPTIONS)[number];

/**
 * Order Item schema (for form array)
 */
export const orderItemSchema = z.object({
  itemName: z.string().min(1, "Nama barang wajib diisi"),
  qty: z.coerce.number().min(0.01, "Qty minimal 0.01"),
  unit: z.enum(UNIT_OPTIONS),
  unitPrice: z.coerce.number().min(1, "Harga satuan minimal 1"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

/**
 * Create PO schema
 */
export const createPOSchema = z.object({
  date: z.string().min(1, "Tanggal PO wajib diisi"),
  supplierName: z.string().min(1, "Nama supplier wajib diisi").max(100),
  items: z.array(orderItemSchema).min(1, "Minimal 1 item barang"),
  expectedRevenue: z.coerce.number().min(0).optional().default(0),
  notes: z.string().max(500).optional(),
  proofFile: z.instanceof(File).optional().nullable(),
});

export type CreatePOInput = z.infer<typeof createPOSchema>;

/**
 * Cash Inflow schema
 */
export const cashInflowSchema = z.object({
  poId: z.string().min(1, "PO wajib dipilih"),
  amount: z.coerce.number().min(1, "Nominal minimal 1"),
  receivedDate: z.string().min(1, "Tanggal terima wajib diisi"),
  paymentMethod: z.enum(PAYMENT_METHOD_OPTIONS),
  notes: z.string().max(500).optional(),
  proofFile: z.instanceof(File).optional().nullable(),
});

export type CashInflowInput = z.infer<typeof cashInflowSchema>;

/**
 * Settings schema
 */
export const settingsSchema = z.object({
  appName: z.string().min(1, "Nama usaha wajib diisi").max(100),
  appAddress: z.string().min(1, "Alamat wajib diisi").max(200),
  appPhone: z.string().min(1, "Telepon wajib diisi").max(20),
  npwp: z.string().max(30).optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/**
 * Filter schema for dashboard
 */
export const filterSchema = z.object({
  month: z.string().optional(), // YYYY-MM
  year: z.string().optional(),  // YYYY
  search: z.string().optional(),
  status: z.enum([...PO_STATUS_OPTIONS, "ALL"] as [POStatus, ...POStatus[], "ALL"]).optional().default("ALL"),
});

export type FilterInput = z.infer<typeof filterSchema>;