# 📖 Buku Panduan Pengguna — Sistem PO & Kas Minyak

Selamat datang di **Sistem PO & Kas Minyak**! Panduan ini disusun dengan bahasa yang sederhana dan mudah dipahami agar siapa saja (pemilik usaha, admin, atau staf gudang) dapat langsung mengoperasikan aplikasi ini dengan lancar.

---

## 🧭 1. Gambaran Cepat: Bagaimana Alur Kerjanya?

Bisnis perdagangan minyak memiliki perputaran modal dan piutang yang cepat. Aplikasi ini membantu Anda mengontrolnya dalam 4 langkah mudah:

```
[1. Buat PO Baru]       ➡️ Catat pembelian minyak ke supplier (Modal Keluar)
       ⬇️
[2. Cetak Dokumen A4]   ➡️ Cetak Surat Pesanan resmi untuk arsip / dibawa sopir
       ⬇️
[3. Catat Kas Masuk]    ➡️ Saat pembeli transfer / bayar tunai (Cicilan / Lunas)
       ⬇️
[4. Pantau Dashboard]   ➡️ Sistem otomatis menghitung Sisa Piutang & Laba Bersih
```

---

## 🔐 2. Cara Mendaftar & Masuk Akun Toko

Aplikasi ini mendukung **Multi-Tenant** (satu aplikasi bisa dipakai banyak toko berbeda secara aman, di mana data transaksi tiap toko terpisah 100%).

### A. Jika Anda Belum Memiliki Akun (Pendaftaran Baru):
1. Buka link website aplikasi di HP atau komputer.
2. Di bagian atas layar, klik tab **`Daftar Baru`**.
3. Masukkan:
   - **Nama Usaha / Toko:** Contoh `Toko Minyak Barokah` atau `CV. Berkah Sawit`.
   - **Username / No. WhatsApp:** Contoh `08123456789` (gunakan angka atau huruf tanpa spasi).
   - **Nama Pemilik:** (Opsional) Nama pengelola.
   - **PIN 6 Angka:** Buat 6 angka rahasia (contoh: `123456`).
   - **Ulangi PIN:** Ketik ulang 6 angka PIN tadi.
4. Klik tombol hijau **`Daftar & Buka Aplikasi`**. Toko Anda langsung aktif!

### B. Jika Sudah Punya Akun (Tinggal Masuk):
1. Pastikan tab berada di **`Masuk`**.
2. Masukkan Username atau No. WhatsApp Anda pada kotak input.
3. Tekan **6 angka PIN** Anda pada papan tombol angka (keypad) yang tersedia.
4. Sistem akan otomatis memverifikasi dan membuka dashboard toko Anda.

---

## 📦 3. Cara Membuat Surat Pesanan (PO Baru)

Gunakan fitur ini setiap kali Anda memesan/membeli stok minyak ke distributor atau supplier:

1. **Buka Formulir:**
   - Di HP: Tekan tombol bulat hitam besar **`+ Buat PO`** di tengah bawah layar.
   - Di Komputer/Laptop: Klik tombol hitam **`+ Buat PO`** di kanan atas.
2. **Isi Data Transaksi:**
   - **Tanggal PO:** Tanggal pemesanan minyak.
   - **Nama Supplier:** Nama distributor atau pabrik tempat Anda kulakan.
3. **Isi Barang yang Dipesan:**
   - **Nama Barang:** Contoh *Minyak Goreng Curah*, *Minyak Kita 1 Liter*.
   - **Qty (Jumlah):** Jumlah barang (bisa bulat seperti `100` atau desimal seperti `25.5`).
   - **Satuan:** Pilih Jerigen, Drum, Liter, Kg, atau Box.
   - **Harga Beli Satuan:** Harga modal per unit. Angka otomatis diformat dengan pemisah ribuan (contoh: `14.500`).
   - *(Jika ada lebih dari 1 barang, klik tombol "+ Tambah Item Barang")*.
4. **Estimasi Penjualan (Opsional):**
   - Masukkan perkiraan harga jual total ke pembeli agar sistem dapat menampilkan target keuntungan.
5. **Bukti Transfer (Opsional):**
   - Lampirkan foto struk ATM atau screenshot m-banking bukti pembayaran ke supplier.
6. Klik **`Simpan PO`**. Nomor PO otomatis terbit (contoh: `PO-2026-0001`).

---

## 🖨️ 4. Cara Mencetak Surat Pesanan Resmi (Kertas A4)

Setiap pesanan memiliki lembaran Surat Pesanan resmi yang rapi:

1. Pada tabel transaksi, cari PO yang ingin dicetak, lalu klik tombol **`Print`** (ikon printer).
2. Pratinjau dokumen A4 resmi akan terbuka:
   - Dilengkapi kop surat resmi nama toko, alamat, dan nomor HP Anda.
   - Tabel rincian barang 6 kolom yang rapi dan tidak berantakan di layar HP.
   - Kolom tanda tangan resmi untuk pihak Gudang/Penerima dan Pimpinan Usaha Anda.
3. Tekan tombol biru **`Cetak / Simpan PDF`** di bagian atas:
   - Pilih printer fisik (WiFi/Bluetooth) untuk langsung cetak ke kertas.
   - Atau pilih *"Save as PDF"* untuk menyimpannya sebagai file dokumen di HP Anda dan dikirim via WhatsApp.

---

## 💰 5. Cara Mencatat Kas Masuk (Pembayaran dari Pembeli)

Ketika minyak Anda sudah laku dan pembeli mentransfer atau membayar tunai:

1. Klik tombol hijau **`+ Kas Masuk`** (ada di navigasi bawah HP atau menu atas PC).
2. Pilih nomor PO yang dibayar oleh pembeli.
3. Sistem akan otomatis menampilkan sisa modal yang belum lunas.
4. Masukkan nominal uang yang diterima:
   - Tekan tombol cepat **`50%`** jika pembeli baru membayar separuh/cicilan.
   - Tekan tombol cepat **`Lunas Penuh`** jika modal pesanan ini telah tertutup semua.
   - Atau ketik sendiri nominal uang yang diterima secara manual.
5. Pilih metode pembayaran (*Transfer Bank* atau *Tunai*) dan tanggal terima.
6. Klik **`Simpan Kas Masuk`**.

### 🏷️ Memahami Status Transaksi:
- **`PENDING` (Merah/Abu-abu):** Belum ada pembayaran masuk dari pembeli sama sekali.
- **`DICICIL` (Orange):** Sudah ada uang masuk sebagian, masih ada sisa modal yang belum lunas.
- **`LUNAS` (Hijau):** Seluruh modal PO sudah tertutup 100%. Uang kas yang masuk melebihi modal dihitung sebagai laba bersih.

---

## 📊 6. Membaca 4 Angka Utama di Dashboard

Di bagian atas layar dashboard, terdapat 4 kartu ringkasan keuangan usaha Anda:

1. **Sisa Modal Aktif (Biru):**
   - Menunjukkan uang modal Anda yang saat ini masih berjalan di lapangan dan belum balik modal.
2. **Piutang Berjalan (Orange):**
   - Uang modal yang masih ada di pembeli / pelanggan dan belum dibayar.
3. **Laba Bulan Ini (Hijau):**
   - Keuntungan bersih riil yang Anda dapatkan di bulan berjalan (Total Uang Masuk dikurangi Total Modal Keluar).
4. **PO Selesai (Abu-abu):**
   - Jumlah transaksi PO yang seluruh modalnya telah berhasil ditutup lunas.

---

## 📁 7. Export Laporan ke Excel

Untuk keperluan arsip bulanan atau laporan pajak/akuntansi:
1. Klik tombol **`Export Excel`** di menu atas atau bawah.
2. File spreadsheet `.xlsx` akan langsung terunduh secara otomatis.
3. File ini berisi rekap data nomor PO, tanggal, nama supplier, rincian barang, total modal, kas masuk yang sudah diterima, sisa piutang, dan status lunas.

---

## ⚙️ 8. Pengaturan Identitas Toko & Kop Surat

Agar surat pesanan yang dicetak memiliki identitas resmi toko Anda:
1. Masuk ke menu **`Pengaturan`**.
2. Anda dapat mengisi atau memperbarui:
   - Nama Toko / CV / Badan Usaha Anda.
   - Nama Pemilik / Penanggung Jawab.
   - Alamat Gudang atau Kantor.
   - Nomor Telepon / WhatsApp.
   - Nomor NPWP (jika ada).
3. Klik **`Simpan Perubahan`**. Seluruh cetakan dokumen A4 berikutnya akan otomatis menggunakan kop surat terbaru.

---

## 📱 9. Tips Pasang di Layar Utama HP (Add to Home Screen)

Agar aplikasi bisa dibuka langsung dengan satu ketukan seperti aplikasi Play Store:

### Pengguna HP Android (Google Chrome):
1. Buka website aplikasi di browser **Chrome**.
2. Ketuk ikon **Titik Tiga (⋮)** di pojok kanan atas layar.
3. Pilih menu **"Tambahkan ke Layar Utama"** atau **"Instal Aplikasi"**.
4. Ikon aplikasi akan langsung muncul di beranda HP Anda!

### Pengguna iPhone (Safari):
1. Buka website aplikasi di browser **Safari**.
2. Ketuk tombol **Share (Ikon kotak dengan panah ke atas)** di bagian bawah layar.
3. Gulir ke bawah dan pilih **"Add to Home Screen"** (Tambah ke Layar Utama).
4. Ketuk **Add** di pojok kanan atas. Selesai!

---

*Jika membutuhkan bantuan teknis atau ada kendala operasional, hubungi administrator sistem Anda.*
