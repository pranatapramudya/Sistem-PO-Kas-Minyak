# 🌾 Sistem PO & Sembako (Multi-Tenant SaaS)

Aplikasi manajemen **Purchase Order (PO)**, pembukuan **Kas Masuk**, monitoring **Piutang Berjalan**, dan perhitungan **Laba Bersih** berbasis web modern dan Progressive Web App (PWA) dengan arsitektur **Multi-Tenant (Multi-Usaha)** untuk perdagangan & distribusi sembako serta bahan pangan.

---

## 🌟 Fitur Utama

1. **Multi-Tenant / Multi-Usaha (Terisolasi 100%)**
   * **Daftar Toko Baru Langsung:** Siapa pun (rekanan, keluarga, cabang lain) dapat mendaftarkan usaha baru langsung dari halaman login.
   * **Data Terisolasi:** Setiap usaha/toko memiliki ruang data sendiri. Toko B **tidak akan pernah bisa melihat** data PO, kas masuk, supplier, maupun modal milik Toko A.
   * **Kop Surat Dinamis:** Dokumen cetak surat pesanan resmi A4 otomatis menggunakan identitas, logo nama, alamat, nomor telepon/WA, dan NPWP milik masing-masing usaha yang sedang login.

2. **Dashboard Eksekutif & Metrik Real-Time**
   * **Sisa Modal Aktif:** Monitoring modal berjalan yang belum kembali.
   * **Piutang Berjalan:** Total tagihan ke pembeli/pelanggan yang belum lunas.
   * **Laba Bulan Ini:** Akumulasi keuntungan bersih (Kas Masuk - Modal PO).
   * **PO Selesai:** Total transaksi yang telah 100% lunas.

3. **Manajemen PO & Pembukuan Kas Masuk**
   * Pencatatan PO ke supplier dengan multi-item barang, kuantitas, satuan, dan harga beli.
   * Pencatatan pelunasan kas masuk bertahap (cicilan/parsial) dengan bukti transfer.
   * 3 Klasifikasi Status Transaksi:
     * 🟡 **Pending (Belum Bayar):** Modal keluar, belum ada kas masuk (Kas = Rp 0).
     * 🟠 **Partial (Dicicil):** Pembayaran telah dicicil sebagian, masih ada sisa piutang modal.
     * 🟢 **Lunas (Selesai):** Pembayaran diterima penuh 100% atau lebih dari modal PO.

4. **Cetak Surat Pesanan (PO) Standar Resmi A4**
   * Format cetak resmi dokumen A4 dengan kop surat nama toko dinamis, rincian barang 6-kolom, kalimat terbilang rupiah otomatis, dan kolom tanda tangan dua pihak.
   * Tampilan mobile responsif berskala A4 asli (`overflow-x-auto`) sehingga tata letak dokumen fisik tidak runtuh atau rusak saat dibuka dari HP.

5. **Keamanan Akses Private (PIN 6-Digit & Keypad 0-Latency)**
   * Login cepat menggunakan Username / No. HP + Keypad PIN angka 6-digit dengan haptic feedback getaran taktil di HP.
   * Full Clean Modern Loading Screen saat Login, Daftar Baru, dan Logout dengan indikator progress geser dinamis (*sliding progress bar*).
   * Mekanisme *Lupa PIN / Reset PIN* dengan Master Recovery Key (`sim2026`).

6. **PWA (Progressive Web App) & Mobile First**
   * Menu navigasi bawah modern (*Bottom Navigation Bar*) untuk kenyamanan penggunaan di smartphone.
   * Tombol shortcut *Refresh* data 0-latency dengan sinkronisasi instan ke Neon PostgreSQL.
   * Banner instalasi cepat (*Add to Home Screen*) di perangkat Android/Chrome/iOS.
   * Halaman Pengaturan Toko dengan **0ms Instant SSR Loading** (data langsung tampil tanpa jeda).

7. **In-App Lightbox Viewer Lampiran Struk & Bukti Transfer**
   * Melihat foto bukti transfer dan struk modal keluar langsung di dalam aplikasi (in-modal) tanpa risiko layar blank hitam browser.
   * Dilengkapi kontrol interaktif Zoom In, Zoom Out, Reset, tombol simpan/unduh berkas biner Blob, serta pratinjau dokumen PDF.

8. **Export Laporan Excel Profesional Khusus Sembako**
   * Mengunduh laporan rekapitulasi data PO dan kas milik usaha yang login ke format spreadsheet `.xlsx`.
   * Format nama file profesional dinamis: `Laporan-PO-Kas-Sembako-[NamaUsaha]-[Tanggal].xlsx`.
   * Rincian 4 worksheet terstruktur: *Rekap Harian Sembako, Rekap Bulanan Sembako, Piutang Modal Berjalan, dan Rincian Laba Sembako*.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
* **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
* **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) ([Neon Serverless](https://neon.tech/)) & [Prisma ORM](https://www.prisma.io/)
* **PWA:** Web App Manifest & Service Worker Ready
* **Spreadsheet Generator:** [SheetJS (xlsx)](https://sheetjs.com/)

---

## 🚀 Memulai (Panduan Instalasi Lokal)

### 1. Kloning Repositori
```bash
git clone https://github.com/pranatapramudya/Sistem-PO-Kas-Minyak.git
cd Sistem-PO-Kas-Minyak
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan isi `.env`:
```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
APP_NAME="CV. TRADING MINYAK"
APP_ADDRESS="Jl. Raya Utama No. 123, Jakarta Selatan"
APP_PHONE="0812-3456-7890"
NPWP="00.000.000.0-000.000"
AUTH_SECRET="sim-trading-private-secret-salt-2026-secure"
```

### 4. Sinkronisasi Database & Migrasi Data
Jalankan sinkronisasi skema Prisma ke database Neon:
```bash
npx prisma db push
```

Jalankan script inisialisasi default tenant:
```bash
node scripts/migrate-to-multitenant.js
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔐 Alur Login & Daftar Usaha Baru
* **Akun Default Bawaan:**
  * **Username:** `admin` (atau kosongkan untuk akun utama CV. TRADING MINYAK)
  * **PIN:** PIN 6-digit rahasia Anda.
* **Mendaftarkan Toko / Pengguna Baru:**
  * Di halaman login, klik tab **"Daftar Baru"**.
  * Masukkan Nama Usaha, Username/No. WhatsApp, dan tentukan PIN 6-digit baru.
  * Akun baru langsung aktif dengan data dashboard yang **100% kosong dan terpisah**.

---

## 📄 Lisensi
Hak Cipta &copy; 2026 CV. TRADING MINYAK. Seluruh hak cipta dilindungi undang-undang.
