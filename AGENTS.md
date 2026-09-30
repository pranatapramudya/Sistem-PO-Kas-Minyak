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
2. **Relasi Transaksi & Penomoran PO:**
   * Setiap data `PurchaseOrder` dan `CashInflow` terhubung ke `tenantId`.
   * **Aturan Kritis:** Setiap API Route dan Server Component **WAJIB** memfilter data dengan `where: { tenantId }`.
   * **Nomor PO Scoped per Tenant:** `PurchaseOrder` menggunakan constraint `@@unique([tenantId, poNumber])`. Setiap tenant memiliki penomoran PO independen mulai dari `PO-YYYYMM-0001`. Generator nomor PO mencari urutan tertinggi pada bulan berjalan (`PO-YYYYMM-XXXX`) milik tenant aktif untuk mencegah tabrakan saat ada PO yang dihapus.
   * **Satuan Barang (Sembako):** Mendukung satuan luas untuk kebutuhan grosir dan eceran sembako: `Dus`, `Karton`, `Karung`, `Sak`, `Bal`, `Pack`, `Kg`, `Liter`, `Pcs`, `Jerigen`, `Drum`, `Krat`, `Kaleng`, `Renceng`, `Box`.
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

8. **In-App Lightbox Lampiran Struk (`ProofPreviewDialog.tsx`):**
   * Mengatasi pemblokiran navigasi top-frame Chromium pada `data:` URL (`about:blank#blocked`).
   * Mengonversi Base64 Data URL ke Blob URL biner untuk unduhan lokal aman dan pembukaan tab baru tanpa layar hitam.
   * Mendukung pratinjau gambar dengan kontrol zoom in/out/reset dan iframe dokumen PDF.
9. **Full Clean Loading & Indeterminate Progress (`animate-progress-slide`):**
   * Transisi sesi pada Login, Pendaftaran, dan Logout menggunakan layar penuh `fixed inset-0 z-50 bg-slate-50` agar elemen di latar belakang (keypad/formulir) tidak membayang atau bertumpuk.
   * Indikator progress menggunakan animasi CSS keyframe geser kontinu (*sliding left-to-right*).
   * Pengalihan sesi autentikasi menggunakan `window.location.href` langsung untuk mencegah pending transition router Next.js.
10. **0ms Instant SSR Data di Pengaturan Toko (`/settings`):**
    * `SettingsPage` diimplementasikan sebagai Server Component yang memuat `initialTenant` langsung dari Prisma sebelum HTML dikirim ke browser.
    * `SettingsClient` membaca `initialTenant` pada initial state React sehingga formulir langsung terisi sejak detik ke-0 tanpa efek kedip / teks melompat (*pop-in*).

---

## 🛡️ Panduan Perubahan Kode (Best Practices)

1. **Keamanan Kredensial:**
   * Jangan pernah meng-commit file `.env` atau mengekspos string koneksi Neon PostgreSQL.
   * Gunakan `.env.example` sebagai referensi struktur environment variables.
2. **Verifikasi Build:**
   * Selalu jalankan `npx tsc --noEmit` atau `npm run build` sebelum melakukan commit untuk memastikan nol error tipe TypeScript.
3. **Optimistic Updates:**
   * Setiap mutasi (tambah PO, catat kas, hapus PO) harus menerapkan 0-latency optimistic feedback pada UI pengguna dengan rollback aman jika request API gagal.
