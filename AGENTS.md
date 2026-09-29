# 🤖 AGENTS.md — Agent & Developer Operational Guide

Dokumentasi arsitektur, aturan bisnis, dan panduan teknis bagi AI Agent (Antigravity, Claude, Copilot, dll.) dan pengembang yang bekerja pada repositori **Sistem PO & Kas Minyak**.

---

## 🏛️ Arsitektur & Teknologi

| Komponen | Pilihan Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | React Server Components (RSC) + Client Components |
| **Bahasa** | TypeScript | Strict type checking |
| **Styling** | Tailwind CSS (Vanilla) | Custom CSS di `globals.css` dengan antialiasing `font-weight: 500` |
| **Icons** | Lucide React | Ikon modern seragam |
| **Database** | PostgreSQL | Neon Serverless PostgreSQL (AWS Singapore ap-southeast-1) |
| **ORM** | Prisma ORM | Model `PurchaseOrder`, `POItem`, `CashInflow`, `SecurityConfig` |
| **PWA** | Web App Manifest | Mendukung Add to Home Screen & offline metadata |
| **Export** | SheetJS (`xlsx`) | Streaming download Excel di `/api/export/excel` |

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

## 🗄️ Skema Database (Prisma)

File: [`prisma/schema.prisma`](prisma/schema.prisma)

* **`PurchaseOrder`**:
  * `id`: UUID (Primary Key)
  * `poNumber`: Kode unik format `PO-YYYYMM-XXXX`
  * `date`: Tanggal PO dibuat
  * `supplierName`: Nama rekanan / vendor minyak
  * `status`: Enum (`OUTSTANDING`, `PARTIAL`, `CLOSED`)
  * `totalCost`: Akumulasi modal beli
  * `expectedRevenue`: Estimasi omzet penjualan
  * `totalCashInflow`: Total pelunasan kas masuk
  * `profit`: Laba bersih
  * `items`: Relasi One-to-Many ke `POItem`
  * `cashInflow`: Relasi One-to-Many ke `CashInflow`
* **`SecurityConfig`**:
  * Menyimpan hash SHA-256 PIN keamanan private (`pinHash` + `salt`).

---

## 🔒 Sistem Autentikasi Private

1. **First-Time Setup Flow:**
   * Jika tabel `SecurityConfig` kosong, endpoint `/api/auth/status` mengembalikan `{ hasPin: false }`.
   * Halaman login `/login` secara otomatis membuka alur pembuatan PIN (`SETUP_CREATE` &rarr; `SETUP_CONFIRM`).
2. **Keypad 0-Latency:**
   * Keypad PIN angka di `/login` dirancang dengan touch-action manipulation tanpa blocking/lag.
3. **Master Recovery Reset:**
   * Kata kunci pemulihan darurat adalah `sim2026`. Memasukkan kunci ini mengizinkan pengguna mengatur ulang PIN tanpa kehilangan data transaksi.

---

## 📄 Standar Dokumen Cetak Surat Pesanan (A4)

File: [`src/app/po/[id]/print/page.tsx`](src/app/po/%5Bid%5D/print/page.tsx)

* **Aturan Kritis:**
  * Layout dokumen A4 **TIDAK BOLEH** runtuh (*collapse*) menjadi 1 kolom vertikal saat dibuka di perangkat mobile.
  * Kop surat dan tabel rincian barang harus tetap mempertahankan struktur dokumen fisik resmi:
    * Kop surat sejajar: Kiri (Nama Perusahaan), Kanan (`SURAT PESANAN (PO)` & No. Dokumen).
    * Metadata 2 kolom (`grid-cols-2`): Ditujukan Kepada & Detail Transaksi.
    * Tabel rincian barang: 6 kolom lengkap (`No`, `Nama Barang`, `Qty`, `Satuan`, `Harga Satuan`, `Subtotal`).
    * Tanda tangan 2 kolom: Penerima/Gudang dan Pimpinan CV.
  * Preview di layar sempit menggunakan kontainer `overflow-x-auto` berskala A4 asli (`w-[794px] max-w-[210mm]`).

---

## 📱 Mobile Navigation Bar

File: [`src/app/DashboardClient.tsx`](src/app/DashboardClient.tsx)

Menu navigasi mobile bawah (`<nav aria-label="Menu Navigasi Mobile">`) hanya tampil di layar `< md`:
1. **Refresh:** Memuat ulang data dari database Neon secara instan dan menampilkan notifikasi sukses.
2. **+ Kas:** Membuka dialog pencatatan kas masuk cepat.
3. **Buat PO (Floating Action Button):** Tombol utama di tengah dengan aksen lingkaran hitam menonjol.
4. **Export:** Mengunduh rekap Excel langsung dari HP.
5. **Pengaturan:** Mengarahkan ke halaman pengaturan kop surat `/settings`.

---

## 🛡️ Panduan Perubahan Kode (Best Practices)

1. **Keamanan Kredensial:**
   * Jangan pernah meng-commit file `.env` atau mengekspos string koneksi Neon PostgreSQL.
   * Gunakan `.env.example` sebagai referensi struktur environment variables.
2. **Verifikasi Build:**
   * Selalu jalankan `npx tsc --noEmit` sebelum melakukan commit untuk memastikan nol error tipe TypeScript.
3. **Optimistic Updates:**
   * Setiap mutasi (tambah PO, catat kas, hapus PO) harus menerapkan 0-latency optimistic feedback pada UI pengguna dengan rollback aman jika request API gagal.
