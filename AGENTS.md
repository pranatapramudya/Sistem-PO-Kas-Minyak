# 🤖 AGENTS.md — Agent & Developer Operational Guide

Dokumentasi arsitektur, aturan bisnis, dan panduan teknis bagi AI Agent (Antigravity, Claude, Copilot, dll.) dan pengembang yang bekerja pada repositori **Sistem PO & Kas Minyak**.

---

## 🏛️ Arsitektur & Teknologi

| Komponen | Pilihan Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | React Server Components (RSC) + Client Components |
| **Arsitektur** | Multi-Tenant (Shared DB, Tenant Isolation) | Data terisolasi penuh per-tenant via `tenantId` |
| **Bahasa** | TypeScript | Strict type checking |
| **Styling** | Tailwind CSS (Vanilla) | Custom CSS di `globals.css` dengan antialiasing `font-weight: 500` |
| **Icons** | Lucide React | Ikon modern seragam |
| **Database** | PostgreSQL | Neon Serverless PostgreSQL (AWS Singapore ap-southeast-1) |
| **ORM** | Prisma ORM | Model `Tenant`, `PurchaseOrder`, `POItem`, `CashInflow`, `SecurityConfig` |
| **PWA** | Web App Manifest | Mendukung Add to Home Screen & offline metadata |
| **Export** | SheetJS (`xlsx`) | Streaming download Excel di `/api/export/excel` per-tenant |

---

## 🏢 Arsitektur Multi-Tenancy

Aplikasi ini menerapkan **Multi-Tenant dengan Shared Database & Tenant Isolation**:

1. **Model `Tenant` (Prisma):**
   * Menyimpan entitas bisnis/toko (`id`, `companyName`, `ownerName`, `identifier`, `address`, `phone`, `npwp`, `pinHash`, `recoveryKey`).
   * `identifier`: Unik (No. HP / Username / Email).
2. **Relasi Transaksi:**
   * Setiap data `PurchaseOrder` dan `CashInflow` terhubung ke `tenantId`.
   * **Aturan Kritis:** Setiap API Route dan Server Component **WAJIB** memfilter data dengan `where: { tenantId }`.
   * Tenant B tidak boleh memiliki akses untuk melihat, mengedit, atau menghapus transaksi milik Tenant A.
3. **Session Token Multi-Tenant:**
   * Format payload token: `auth:${tenantId}:${expiry}`.
   * Ditandatangani menggunakan HMAC SHA-256 dengan secret key `AUTH_SECRET`.
   * Middleware mengekstrak `tenantId` dan meneruskannya via request header `x-tenant-id`.
4. **Default Tenant:**
   * Tenant bawaan ber-ID `default-cv-trading-minyak` (`admin` / `CV. TRADING MINYAK`) memegang seluruh 12 transaksi awal agar tidak terjadi data loss saat migrasi.

---

## 📊 Aturan Bisnis & Rumus Keuangan

Setiap agen yang memodifikasi perhitungan transaksi keuangan **WAJIB** mematuhi rumus baku berikut:

1. **Total Modal PO ($C_{total}$):**
   $$\sum (\text{item.qty} \times \text{item.unitPrice})$$
2. **Total Kas Masuk ($I_{total}$):**
   $$\sum (\text{cashInflow.amount})$$
3. **Sisa Piutang Modal ($R$):**
   $$\max(0, C_{total} - I_{total})$$
4. **Laba Bersih Transaksi ($P$):**
   $$I_{total} - C_{total}$$
5. **Klasifikasi Status PO:**
   * **`OUTSTANDING` (Pending):** Saat $I_{total} = 0$ (belum ada cicilan masuk sama sekali).
   * **`PARTIAL` (Dicicil):** Saat $0 < I_{total} < C_{total}$ (sudah bayar sebagian, masih ada sisa piutang modal).
   * **`CLOSED` (Lunas):** Saat $I_{total} \ge C_{total}$ (seluruh modal telah tertutup lunas).

---

## 📄 Standar Dokumen Cetak Surat Pesanan (A4)

File: [`src/app/po/[id]/print/page.tsx`](src/app/po/%5Bid%5D/print/page.tsx)

* **Aturan Kritis:**
  * Layout dokumen A4 **TIDAK BOLEH** runtuh (*collapse*) menjadi 1 kolom vertikal saat dibuka di perangkat mobile.
  * Kop surat dan tabel rincian barang harus tetap mempertahankan struktur dokumen fisik resmi:
    * Kop surat sejajar: Kiri (Nama Perusahaan Tenant), Kanan (`SURAT PESANAN (PO)` & No. Dokumen).
    * Metadata 2 kolom (`grid-cols-2`): Ditujukan Kepada & Detail Transaksi.
    * Tabel rincian barang: 6 kolom lengkap (`No`, `Nama Barang`, `Qty`, `Satuan`, `Harga Satuan`, `Subtotal`).
    * Tanda tangan 2 kolom: Penerima/Gudang dan Pimpinan Usaha Tenant.
  * Preview di layar sempit menggunakan kontainer `overflow-x-auto` berskala A4 asli (`w-[794px] max-w-[210mm]`).

---

## 🛡️ Panduan Perubahan Kode (Best Practices)

1. **Keamanan Kredensial:**
   * Jangan pernah meng-commit file `.env` atau mengekspos string koneksi Neon PostgreSQL.
   * Gunakan `.env.example` sebagai referensi struktur environment variables.
2. **Verifikasi Build:**
   * Selalu jalankan `npx tsc --noEmit` atau `npm run build` sebelum melakukan commit untuk memastikan nol error tipe TypeScript.
3. **Optimistic Updates:**
   * Setiap mutasi (tambah PO, catat kas, hapus PO) harus menerapkan 0-latency optimistic feedback pada UI pengguna dengan rollback aman jika request API gagal.
