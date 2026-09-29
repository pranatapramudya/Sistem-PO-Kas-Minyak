# 🛢️ Sistem PO & Kas Minyak

Aplikasi manajemen **Purchase Order (PO)**, pembukuan **Kas Masuk**, monitoring **Piutang Berjalan**, dan perhitungan **Laba Bersih** berbasis web modern dan Progressive Web App (PWA) untuk bisnis distribusi & trading minyak.

---

## 🌟 Fitur Utama

1. **Dashboard Eksekutif & Metrik Real-Time**
   * **Sisa Modal Aktif:** Monitoring modal berjalan yang belum kembali.
   * **Piutang Berjalan:** Total tagihan ke pembeli/pelanggan yang belum lunas.
   * **Laba Bulan Ini:** Akumulasi keuntungan bersih (Kas Masuk - Modal PO).
   * **PO Selesai:** Total transaksi yang telah 100% lunas.

2. **Manajemen PO & Pembukuan Kas Masuk**
   * Pencatatan PO ke supplier dengan multi-item barang, kuantitas, satuan, dan harga beli.
   * Pencatatan pelunasan kas masuk bertahap (cicilan/parsial) dengan bukti pembayaran.
   * Perhitungan otomatis status transaksi:
     * 🟡 **Pending (Belum Bayar):** Modal keluar, belum ada kas masuk (Kas = Rp 0).
     * 🟠 **Partial (Dicicil):** Pembayaran telah dicicil sebagian, masih ada sisa piutang modal.
     * 🟢 **Lunas (Selesai):** Pembayaran diterima penuh 100% atau lebih dari modal PO.

3. **Cetak Surat Pesanan (PO) Standar Resmi A4**
   * Pratinjau dan pencetakan dokumen resmi A4 dengan kop surat perusahaan, rincian barang 6-kolom, kalimat terbilang rupiah otomatis, dan kolom tanda tangan dua pihak.
   * Dioptimalkan untuk tampilan desktop maupun mobile (tata letak presisi tidak rusak/runtuh saat diakses dari HP).

4. **Keamanan Akses Private (PIN 6-Digit)**
   * Sistem autentikasi private dengan keypad angka responsif 0-latency.
   * Alur pembuatan PIN pertama kali (*Setup PIN*) otomatis saat pertama kali dibuka.
   * Mekanisme *Lupa PIN / Reset PIN* dengan Master Recovery Key (`sim2026`).

5. **PWA (Progressive Web App) & Mobile First**
   * Tombol menu navigasi bawah modern (*Bottom Navigation Bar*) untuk pengalaman seperti aplikasi native.
   * Banner instalasi cepat (*Add to Home Screen*) di perangkat Android/Chrome/iOS.

6. **Export Laporan Excel**
   * Sekali klik untuk mengunduh seluruh rekapitulasi data PO dan kas ke format spreadsheet `.xlsx`.

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
Sesuaikan isi `.env` dengan kredensial database Anda:
```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
APP_NAME="CV. TRADING MINYAK"
APP_ADDRESS="Jl. Raya Utama No. 123, Jakarta Selatan"
APP_PHONE="0812-3456-7890"
NPWP="00.000.000.0-000.000"
AUTH_SECRET="sim-trading-private-secret-salt-2026-secure"
```

### 4. Sinkronisasi Database
Jalankan migrasi Prisma schema ke PostgreSQL:
```bash
npx prisma db push
```

*(Opsional)* Jalankan seeder contoh data transaksi minyak:
```bash
npx ts-node scripts/seed.ts
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔐 Informasi Akses Awal
* Saat pertama kali aplikasi dibuka, pengguna akan diminta membuat **PIN 6-digit baru** untuk mengamankan data.
* Jika lupa PIN, gunakan menu **Lupa PIN** dengan kode pemulihan master:
  ```text
  sim2026
  ```

---

## 📄 Lisensi
Hak Cipta &copy; 2026 CV. TRADING MINYAK. Seluruh hak cipta dilindungi undang-undang.
