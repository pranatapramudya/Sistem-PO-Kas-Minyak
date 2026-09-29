# PRD.md — SIM-TRADING (Sistem Informasi Manajemen PO & Kas Trading Minyak)

**Versi:** 1.0  
**Tanggal:** 2026-09-29  
**Mode:** 100% Offline / Local-First (Standalone Desktop Browser)  
**Target User:** Kakak Prana (UMKM Trading Minyak Retail & Grosir)  
**Modal Kerja:** Rp 80.000.000  

---

## 1. RINGKASAN & TUJUAN BISNIS

Aplikasi pencatatan cepat untuk melacak perputaran modal Rp 80 juta agar tidak ada uang yang nyangkut di pembeli/mitra tanpa kejelasan.  
Sistem berfokus pada **4 metrik utama**:

1. **Modal Keluar** (Nilai PO ke supplier/distributor)
2. **Kas Masuk** (Pembayaran pelunasan dari buyer/mitra)
3. **Laba Bersih Realtime** (Selisih otomatis: Kas Masuk - Modal PO)
4. **Outstanding Invoice** (Daftar PO yang barang sudah jalan tapi belum lunas/dibukukan)

---

## 2. TECH STACK (MINIMALIS & OFFLINE)

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework** | Next.js 14+ (App Router) | Single Page Dashboard / Tab-based UX cepat, React Server Components |
| **Database** | SQLite via Prisma ORM | 1 file `.db` di laptop, zero config, tidak perlu internet |
| **Styling** | Tailwind CSS + Shadcn-style components | Clean, kontras tinggi, gampang dibaca, aksesibel |
| **Excel Export** | `xlsx` (SheetJS) | Export laporan rekapitulasi langsung dari browser |
| **Print Dokumen** | CSS `@media print` | Cetak surat PO resmi standar A4 (tombol "Cetak PO") |
| **Upload File** | Penyimpanan lokal `public/uploads/` | Struk/bukti transfer disimpan lokal, tidak cloud |

**Dependencies Utama:**
- `next`, `react`, `react-dom`
- `@prisma/client`, `prisma`
- `xlsx` (SheetJS)
- `date-fns` (format tanggal Indonesia)
- `lucide-react` (icon)
- `zod` (validasi form)
- `react-hook-form` + `@hookform/resolvers/zod`

---

## 3. ALUR OPERASIONAL (END-TO-END WORKFLOW)

### TAHAP 1: INPUT PO BARU (MODAL KELUAR)

**Trigger:** User klik tombol `+ Buat PO Baru`

**Form Input:**
| Field | Tipe | Validasi | Default |
|-------|------|----------|---------|
| Tanggal PO | Date | Required | Hari ini (WIB) |
| Nama Supplier / Distributor | Text | Required, max 100 char | - |
| Item Barang | Array of rows | Min 1 row | - |
| - Nama Barang | Text | Required | - |
| - Qty | Number | Required, > 0 | 1 |
| - Satuan | Select | Required | `Jerigen` / `Drum` / `Liter` / `Pcs` |
| - Harga Beli Satuan | Number | Required, > 0 | - |
| Estimasi Harga Jual / Target Kas Masuk | Number | Optional, >= 0 | - |
| Upload Bukti Transfer Modal | File (image/pdf) | Optional, max 5MB | - |
| Catatan / Keterangan | Textarea | Optional, max 500 char | - |

**Perhitungan Otomatis:**
- `Subtotal Item = Qty × Harga Beli Satuan`
- `Total Modal PO = Σ Subtotal Item`

**Saat Disimpan:**
- Generate **No. PO Unik** berurutan: `PO-YYYYMM-NNNN` (contoh: `PO-202609-0001`)
- Status awal = `OUTSTANDING`
- Simpan ke SQLite via Prisma

---

### TAHAP 2: KAS MASUK (PELUNASAN DARI BUYER)

**Trigger:** User buka modal "Catat Kas Masuk"

**Form Input:**
| Field | Tipe | Validasi |
|-------|------|----------|
| Pilih PO | Select | Required, hanya PO dengan status `OUTSTANDING` atau `PARTIAL` |
| Nominal Kas Masuk | Number | Required, > 0 |
| Tanggal Terima Uang | Date | Required, default hari ini |
| Metode Pembayaran | Select | Required: `Transfer Bank` / `Tunai` |
| Upload Bukti Transfer Masuk | File | Optional, max 5MB |
| Catatan | Textarea | Optional |

**Logika Otomatis Saat Disimpan:**
- `Laba = Kas Masuk (kumulatif) - Total Modal PO`
- **Status Transition:**
  - Kas Masuk kumulatif >= Total Modal PO → Status = `CLOSED`
  - Kas Masuk kumulatif > 0 & < Total Modal PO → Status = `PARTIAL`
  - Kas Masuk = 0 → Status = `OUTSTANDING`

---

### TAHAP 3: DASHBOARD REKAPITULASI REALTIME

**Tampilan Utama:** Tabel horizontal (mirip Excel kakak)

| No | Kolom | Format / Aturan |
|----|-------|-----------------|
| 1 | Tanggal Transaksi | `dd MMM yyyy` (Indonesia) |
| 2 | No. PO & Nama Barang (Qty) | `PO-202609-0001 — Minyak Goreng Curah (50)` |
| 3 | Total Modal PO | Rp dengan pemisah ribuan, merah |
| 4 | Kas Masuk | Rp dengan pemisah ribuan, hijau |
| 5 | Laba Bersih | Rp, **Hijau** jika ≥ 0, **Merah** jika < 0 |
| 6 | Status | Badge: `OUTSTANDING` (kuning), `PARTIAL` (orange), `CLOSED` (hijau) |
| 7 | Aksi | `[Lihat Detail]` `[Cetak PO]` `[Hapus]` |

**Executive Cards (Atas Tabel):**
| Card | Formula | Warna |
|------|---------|-------|
| 💰 **Sisa Modal Aktif** | `80.000.000 - Σ Total Modal PO (status OUTSTANDING/PARTIAL)` | Biru |
| ⏳ **Total Piutang Berjalan** | `Σ (Total Modal PO - Kas Masuk kumulatif) WHERE status ≠ CLOSED` | Orange |
| 📈 **Total Laba Terkumpul Bulan Ini** | `Σ Laba WHERE receivedDate bulan ini` | Hijau |
| 📦 **Total PO Selesai** | `COUNT WHERE status = CLOSED` | Abu-abu |

**Filter & Search:**
- Filter per Bulan / Tahun (default: bulan berjalan)
- Search by No. PO, Supplier, Nama Barang
- Sort by kolom (default: Tanggal desc)

---

### TAHAP 4: CETAK SURAT PO RESMI & EXPORT EXCEL

#### A. Cetak Surat PO (CSS `@media print`)
**Template A4 Standar:**
- **Kop Surat:** Nama Usaha, Alamat, Telepon, NPWP (konfigurasi di `.env` / settings)
- **Header:** "SURAT PESANAN (PURCHASE ORDER)", No. PO, Tanggal
- **Data Supplier:** Nama, Alamat, Kontak
- **Tabel Rincian Barang:** No, Nama Barang, Qty, Satuan, Harga Satuan, Subtotal
- **Total:** Total Modal PO (angka + **Terbilang** bahasa Indonesia)
- **Footer:** Kolom tanda tangan:
  - `Petugas Gudang` (Nama, Tanda Tangan, Tanggal)
  - `Pimpinan` (Nama, Tanda Tangan, Tanggal)
- **Catatan Kaki:** "Barang yang diterima harus sesuai dengan PO ini. Setiap keluhan maksimal 2x24 jam setelah barang tiba."

**Implementasi:** Halaman `/po/[id]/print` dengan `@media print` stylesheet, tombol `window.print()`.

#### B. Export Excel (SheetJS `xlsx`)
**File Output:** `Rekap-Trading-YYYY-MM-DD.xlsx`

**Sheets:**
1. **Rekap Harian** — Tabel persis seperti dashboard (filter tanggal)
2. **Rekap Bulanan** — Ringkasan per PO per bulan
3. **Outstanding** — Hanya PO status `OUTSTANDING` / `PARTIAL`
4. **Laba Detail** — Per PO: Modal, Kas Masuk, Laba, Status

**Format Kolon Excel:** Number format untuk Rp, Date format `dd/mm/yyyy`, Auto-width kolom.

---

## 4. STRUKTUR DATABASE (PRISMA SCHEMA)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum POStatus {
  OUTSTANDING
  PARTIAL
  CLOSED
}

enum PaymentMethod {
  TRANSFER_BANK
  TUNAI
}

model PurchaseOrder {
  id              String       @id @default(cuid())
  poNumber        String       @unique
  date            DateTime     @db.DateTime
  supplierName    String
  status          POStatus     @default(OUTSTANDING)
  totalCost       Float        @default(0)      // Modal keluar
  expectedRevenue Float        @default(0)      // Target kas masuk
  proofFileUrl    String?      // Path file bukti transfer keluar
  notes           String?      @db.Text
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  items      OrderItem[]
  cashInflow CashInflow[]

  @@index([date])
  @@index([status])
  @@index([supplierName])
}

model OrderItem {
  id        String         @id @default(cuid())
  poId      String
  po        PurchaseOrder  @relation(fields: [poId], references: [id], onDelete: Cascade)
  itemName  String
  qty       Float          @default(1)
  unit      String
  unitPrice Float
  subtotal  Float          @default(0)  // qty * unitPrice

  @@index([poId])
}

model CashInflow {
  id             String         @id @default(cuid())
  poId           String
  po             PurchaseOrder  @relation(fields: [poId], references: [id], onDelete: Cascade)
  amount         Float
  receivedDate   DateTime       @db.DateTime
  paymentMethod  PaymentMethod
  proofFileUrl   String?
  notes          String?        @db.Text
  createdAt      DateTime       @default(now())

  @@index([poId])
  @@index([receivedDate])
}
```

**Catatan Desain:**
- `totalCost` & `expectedRevenue` denormalisasi di `PurchaseOrder` untuk query dashboard cepat (tidak perlu aggregate setiap render).
- `subtotal` di `OrderItem` denormalisasi sama.
- `Cascade` delete: hapus PO → hapus item & cashInflow otomatis.
- SQLite `DateTime` disimpan sebagai ISO string, Prisma handle konversi.

---

## 5. STRUKTUR FOLDER NEXT.JS (APP ROUTER)

```
sim-trading/
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/                 # Bukti transfer (gitignore)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout, providers, font
│   │   ├── page.tsx             # Dashboard utama (tab-based)
│   │   ├── globals.css          # Tailwind + print styles
│   │   ├── api/
│   │   │   ├── po/
│   │   │   │   ├── route.ts          # GET list, POST create
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET detail, PUT update, DELETE
│   │   │   │       ├── print/
│   │   │   │       │   └── route.ts  # HTML untuk print
│   │   │   │       └── cash-inflow/
│   │   │   │           └── route.ts  # POST catat kas masuk
│   │   │   └── export/
│   │   │       └── excel/
│   │   │           └── route.ts      # GET export xlsx
│   │   ├── po/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Form buat PO baru
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Detail PO
│   │   │       └── print/
│   │   │           └── page.tsx      # Halaman print PO
│   │   └── settings/
│   │       └── page.tsx              # Konfigurasi usaha (kop surat)
│   ├── components/
│   │   ├── ui/                       # Shadcn-style primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── dashboard/
│   │   │   ├── ExecutiveCards.tsx
│   │   │   ├── PODashboardTable.tsx
│   │   │   ├── POFormDialog.tsx
│   │   │   ├── CashInflowDialog.tsx
│   │   │   └── PODetailDialog.tsx
│   │   └── print/
│   │       └── POPrintTemplate.tsx
│   ├── lib/
│   │   ├── prisma.ts               # Prisma singleton
│   │   ├── utils.ts                # Format rupiah, terbilang, date
│   │   ├── validations.ts          # Zod schemas
│   │   └── upload.ts               # Handle file upload ke public/uploads
│   ├── hooks/
│   │   ├── usePO.ts                # SWR/TanStack Query untuk PO
│   │   └── useCashInflow.ts
│   └── types/
│       └── index.ts                # TypeScript types
├── .env                            # DATABASE_URL, APP_NAME, APP_ADDRESS, NPWP
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 6. KONFIGURASI AWAL (ENV & SETTINGS)

**File `.env` (root):**
```env
DATABASE_URL="file:./dev.db"
APP_NAME="CV. [NAMA USAHA KAKAK]"
APP_ADDRESS="Jl. Contoh No. 123, Kota, Provinsi"
APP_PHONE="08xx-xxxx-xxxx"
NPWP="00.000.000.0-000.000"
```

**Settings Page (`/settings`):** Form edit 4 field di atas, simpan ke `localStorage` (offline-first), dipakai saat cetak PO.

---

## 7. STATUS EKSEKUSI & FITUR IMPLEMENTASI

1. ✅ **Simpan PRD.md** — `D:/Coding/sim-trading/PRD.md` (SELESAI)
2. ✅ **Buat `prisma/schema.prisma`** — SQLite standalone (`dev.db`), models `PurchaseOrder`, `OrderItem`, `CashInflow`
3. ✅ **Inisialisasi project Next.js** — Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, Radix UI
4. ✅ **Struktur folder & file boilerplate** — `src/app`, `src/components`, `src/lib`, `src/types`
5. ✅ **Prisma Client singleton** — `src/lib/prisma.ts` dengan caching dev mode
6. ✅ **API Routes CRUD PO & CashInflow** — 
   - `GET /api/po` (list realtime + profit calculation)
   - `POST /api/po` (generate No. PO otomatis `PO-YYYYMM-NNNN` + upload struk)
   - `GET /api/po/[id]` & `DELETE /api/po/[id]`
   - `POST /api/po/[id]/cash-inflow` (catat termin/pelunasan + update status otomatis: CLOSED/PARTIAL/OUTSTANDING)
   - `GET /api/metrics` (executive cards: sisa modal dari Rp 80jt, piutang berjalan, laba bulan ini, PO selesai)
7. ✅ **Dashboard UI + Executive Cards + Tabel** —
   - 4 Kartu Executive metrik perputaran modal Rp 80.000.000
   - Tabel responsif warna kontras (Modal Merah, Kas Masuk Hijau, Laba Bersih Hijau/Merah)
   - Filter status (`Semua`, `Outstanding`, `Partial`, `Lunas`) dan search realtime
8. ✅ **Form Buat PO + Dialog Kas Masuk + Detail PO Dialog** —
   - `POFormDialog`: Dynamic row items, kalkulasi otomatis subtotal & total modal, upload struk
   - `CashInflowDialog`: Pilihan PO dinamis, kalkulasi sisa piutang modal, termin/pelunasan, upload bukti bayar
   - `PODetailDialog`: Rincian lengkap item, histori termin kas masuk pembeli, link berkas bukti transfer
9. ✅ **Print PO Template (A4 @media print)** —
   - Halaman `/po/[id]/print` dengan kop surat A4 standar, tabel item, total terbilang Rupiah, kolom ttd gudang & pimpinan
   - `PrintActionBar` on-screen dengan tombol cepat Cetak dan kembali ke Dashboard
10. ✅ **Export Excel (SheetJS `xlsx`)** —
    - `/api/export/excel` menghasilkan 4 sheet: `Rekap Harian`, `Rekap Bulanan`, `Outstanding`, `Laba Detail`
11. ✅ **Upload File ke `public/uploads/`** — Struk transfer disimpan secara lokal di laptop
12. ✅ **Database Seeding & Test Offline** —
    - Script `npm run db:seed` (`prisma/seed.js`) untuk inisialisasi data sampel realistis
    - Build test Next.js (`npm run build`) 100% lolos (Exit code 0) tanpa warning/error

---

## 8. PERINTAH AWAL YANG HARUS DIJALANKAN SEKARANG

```bash
cd D:/Coding/sim-trading

# 1. Inisialisasi package.json minimal
npm init -y

# 2. Install dependencies (production)
npm install next@latest react@latest react-dom@latest
npm install @prisma/client prisma
npm install xlsx date-fns lucide-react zod react-hook-form @hookform/resolvers/zod
npm install clsx tailwind-merge

# 3. Install dev dependencies
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
npm install -D @types/xlsx

# 4. Init Prisma
npx prisma init --datasource-provider sqlite

# 5. Init Tailwind
npx tailwindcss init -p

# 6. Setup TypeScript
npx tsc --init

# 7. Generate Prisma Client
npx prisma generate

# 8. Push schema ke SQLite (buat file dev.db)
npx prisma db push

# 9. Jalankan dev server
npm run dev
```

**Catatan:** Semua perintah dijalankan dari folder `D:/Coding/sim-trading`. Pastikan Node.js v18+ (sudah v26.7.0 ✅).