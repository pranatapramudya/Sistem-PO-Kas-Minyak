"use client";

import Link from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  PackagePlus, 
  Printer, 
  PlusCircle, 
  TrendingUp, 
  Download, 
  Settings, 
  Smartphone, 
  ShieldCheck, 
  Building2,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/90 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Buku Panduan Cara Pakai
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Petunjuk Lengkap &amp; Praktis Sistem Pembukuan PO &amp; Kas Minyak
              </p>
            </div>
          </div>
          <a href="/">
            <Button variant="outline" size="sm" className="h-9 font-bold border-slate-200 bg-white shadow-2xs text-slate-700">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali ke Dashboard
            </Button>
          </a>
        </div>

        {/* Ringkasan Cepat Alur Usaha */}
        <Card className="border-2 border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-bold text-blue-950 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-600 text-white text-xs">ALUR</span>
              Bagaimana Cara Kerja Aplikasi Ini?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
            <p className="leading-relaxed">
              Aplikasi ini dirancang khusus untuk mempermudah Anda mencatat <strong>modal pembelian minyak</strong> dan mengawasi <strong>pelunasan kas masuk</strong> dari pembeli, sehingga uang modal dan keuntungan bisnis Anda selalu terpantau jelas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                <span className="font-mono font-black text-blue-600 text-sm">1. Buat PO</span>
                <p className="text-xs text-slate-500 mt-1">Catat pesanan minyak ke supplier / distributor sebagai modal keluar.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                <span className="font-mono font-black text-purple-600 text-sm">2. Cetak A4</span>
                <p className="text-xs text-slate-500 mt-1">Cetak surat pesanan resmi A4 ber-kop nama toko Anda untuk arsip/supplier.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                <span className="font-mono font-black text-emerald-600 text-sm">3. Catat Kas</span>
                <p className="text-xs text-slate-500 mt-1">Catat setiap uang pembayaran masuk dari pembeli (cicilan atau lunas).</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                <span className="font-mono font-black text-amber-600 text-sm">4. Cek Laba</span>
                <p className="text-xs text-slate-500 mt-1">Dashboard langsung menghitung sisa piutang modal dan keuntungan bersih.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bab 1: Pendaftaran & Login Akun Toko */}
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Cara Mendaftar &amp; Masuk Akun Toko Anda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs sm:text-sm text-slate-700">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">A</span>
                Jika Belum Punya Akun (Pendaftaran Baru):
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                <li>Buka aplikasi, lalu klik tab <strong>Daftar Baru</strong> di bagian atas layar login.</li>
                <li>Isi <strong>Nama Toko / Usaha</strong> Anda (misal: <em>Toko Minyak Barokah</em>).</li>
                <li>Masukkan <strong>Username atau No. WhatsApp</strong> yang mudah Anda ingat.</li>
                <li>Tentukan <strong>6 angka PIN rahasia</strong> yang akan digunakan untuk login setiap hari.</li>
                <li>Klik tombol <strong>Daftar &amp; Buka Aplikasi</strong>. Akun toko Anda langsung siap digunakan!</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">B</span>
                Jika Sudah Punya Akun (Tinggal Masuk):
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                <li>Pilih tab <strong>Masuk</strong>.</li>
                <li>Ketik Username atau No. WhatsApp yang terdaftar pada kolom akun.</li>
                <li>Tekan <strong>6 digit angka PIN</strong> Anda pada tombol angka keypad yang besar.</li>
                <li>Sistem akan langsung membuka dashboard pembukuan toko Anda secara otomatis.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Bab 2: Membuat PO Baru */}
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-blue-600" />
              2. Cara Membuat Surat Pesanan (PO Baru - Modal Keluar)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs sm:text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>
                <strong>Buka Formulir PO:</strong> Di HP tekan tombol bulat hitam <strong>+ Buat PO</strong> di tengah bawah layar (atau tombol hitam di kanan atas pada layar laptop/PC).
              </li>
              <li>
                <strong>Isi Data Supplier:</strong> Masukkan tanggal pemesanan dan nama distributor/supplier tempat Anda membeli minyak.
              </li>
              <li>
                <strong>Rincian Barang:</strong>
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                  <li>Nama Barang: Contoh <em>Minyak Goreng Curah</em> atau <em>Minyak Kita Kemasan 1L</em>.</li>
                  <li>Jumlah Qty: Masukkan banyak barang (contoh: <em>100</em> atau desimal <em>25.5</em>).</li>
                  <li>Satuan: Pilih Jerigen, Drum, Liter, Kg, atau Dus/Box.</li>
                  <li>Harga Beli Satuan: Ketik harga modal per unit. <em>(Di HP Anda bisa langsung mengetik tanpa ada angka 0 yang mengganjal, dan otomatis diberi tanda titik ribuan)</em>.</li>
                </ul>
              </li>
              <li>
                <strong>Estimasi Penjualan (Opsional):</strong> Masukkan perkiraan harga jual total ke pembeli agar sistem dapat memproyeksikan target keuntungan transaksi tersebut.
              </li>
              <li>
                <strong>Upload Bukti Transfer:</strong> Anda dapat melampirkan foto struk atau screenshot bukti transfer bank ke supplier.
              </li>
              <li>
                Klik <strong>Simpan PO</strong>. Transaksi akan langsung tercatat di tabel utama dengan nomor unik (contoh: <code>PO-2026-0001</code>).
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Bab 3: Cetak Surat Pesanan A4 */}
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-slate-700" />
              3. Cara Mencetak Dokumen Surat Pesanan Resmi (A4)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-xs sm:text-sm text-slate-700">
            <p className="text-slate-600">
              Setiap PO memiliki lembar dokumen resmi standar kertas A4 yang sudah dilengkapi kop surat nama usaha, alamat, dan nomor telepon Anda:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
              <li>Pada tabel transaksi PO, klik tombol <strong>Print (Cetak)</strong> di baris PO yang ingin dicetak.</li>
              <li>Halaman pratinjau dokumen A4 resmi akan terbuka. Di HP maupun PC, tata letak kop surat, tabel 6 kolom, dan tanda tangan 2 pihak akan tetap presisi dan rapi.</li>
              <li>Klik tombol <strong>Cetak / Simpan PDF</strong> untuk langsung mencetak ke printer Bluetooth/WiFi atau menyimpannya sebagai file PDF di HP Anda.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Bab 4: Mencatat Kas Masuk */}
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              4. Cara Mencatat Kas Masuk / Pelunasan Pembeli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs sm:text-sm text-slate-700">
            <p className="text-slate-600">
              Ketika pembeli minyak Anda mentransfer uang atau membayar tunai:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
              <li>Tekan tombol hijau <strong>+ Kas Masuk</strong>.</li>
              <li>Pilih transaksi PO yang bersangkutan.</li>
              <li>
                Sistem akan menampilkan sisa modal yang belum lunas. Anda bisa:
                <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5">
                  <li>Klik tombol pintas <strong>50%</strong> untuk mencatat cicilan setengahnya.</li>
                  <li>Klik tombol pintas <strong>Lunas Penuh</strong> untuk langsung melunasi modal.</li>
                  <li>Atau ketik sendiri nominal uang yang diterima.</li>
                </ul>
              </li>
              <li>Pilih metode pembayaran (Transfer Bank atau Tunai) dan tanggal diterima.</li>
              <li>Klik <strong>Simpan Kas Masuk</strong>.</li>
            </ol>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Arti Label Status Transaksi:</span>
              <p>• <span className="font-semibold text-rose-600">PENDING (Merah/Abu-abu):</span> Belum ada pembayaran masuk dari pembeli sama sekali.</p>
              <p>• <span className="font-semibold text-amber-600">DICICIL (Orange):</span> Pembeli sudah membayar sebagian, masih ada sisa modal yang belum kembali.</p>
              <p>• <span className="font-semibold text-emerald-600">LUNAS (Hijau):</span> Modal PO sudah tertutup 100%. Uang kas yang masuk melebihi modal adalah keuntungan bersih Anda.</p>
            </div>
          </CardContent>
        </Card>

        {/* Bab 5: Memahami Angka Dashboard */}
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              5. Cara Membaca 4 Angka Penting di Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs sm:text-sm">
            <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50">
              <span className="font-bold text-blue-900 text-sm">Sisa Modal Aktif (Biru)</span>
              <p className="text-xs text-slate-600 mt-1">
                Menunjukkan total uang modal Anda yang saat ini masih berjalan di lapangan dan belum balik modal.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50">
              <span className="font-bold text-amber-900 text-sm">Piutang Berjalan (Orange)</span>
              <p className="text-xs text-slate-600 mt-1">
                Uang yang masih ada di pembeli / pelanggan. Ini adalah tagihan modal yang harus segera ditagih.
              </p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <span className="font-bold text-emerald-900 text-sm">Laba Bulan Ini (Hijau)</span>
              <p className="text-xs text-slate-600 mt-1">
                Keuntungan bersih riil yang Anda dapatkan di bulan berjalan (Total Kas Masuk dikurangi Total Modal Keluar).
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">PO Selesai (Abu-abu)</span>
              <p className="text-xs text-slate-600 mt-1">
                Total berapa transaksi pesanan PO yang seluruh modalnya telah berhasil ditutup lunas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bab 6: Export Excel & Pengaturan */}
        <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-700" />
              6. Export Excel &amp; Pengaturan Profil Usaha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs sm:text-sm text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Unduh Laporan Excel:
              </h4>
              <p className="text-slate-600 mt-0.5">
                Klik tombol <strong>Export Excel</strong> di menu atas atau navigasi bawah untuk mengunduh rekap transaksi lengkap dalam format file <code>.xlsx</code> yang siap dibuka di Microsoft Excel atau Google Sheets.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Atur Kop Surat Usaha:
              </h4>
              <p className="text-slate-600 mt-0.5">
                Buka menu <strong>Pengaturan</strong> untuk mengisi alamat gudang, nomor telepon kantor/toko, dan nama pemilik. Data ini akan otomatis tercantum pada kop surat pesanan A4 saat dicetak.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bab 7: Tips Pasang di Layar Utama HP */}
        <Card className="border border-emerald-200/90 bg-emerald-50/40 rounded-2xl shadow-xs">
          <CardHeader className="pb-2 border-b border-emerald-100">
            <CardTitle className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              7. Tips: Jadikan Aplikasi di Layar Utama HP Anda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-xs sm:text-sm text-slate-700">
            <p className="leading-relaxed">
              Agar tidak perlu membuka browser setiap kali mau pakai, Anda bisa memasang aplikasi ini di beranda HP Anda layaknya aplikasi Play Store / App Store:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="font-bold text-emerald-900 text-xs">Untuk Pengguna Android (Chrome):</span>
                <ol className="list-decimal list-inside text-xs text-slate-600 mt-1 space-y-0.5">
                  <li>Buka website ini di Google Chrome.</li>
                  <li>Tekan ikon <strong>Titik Tiga</strong> di pojok kanan atas.</li>
                  <li>Pilih <strong>Tambahkan ke Layar Utama</strong> (Install App).</li>
                </ol>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="font-bold text-emerald-900 text-xs">Untuk Pengguna iPhone (Safari):</span>
                <ol className="list-decimal list-inside text-xs text-slate-600 mt-1 space-y-0.5">
                  <li>Buka website ini di browser Safari.</li>
                  <li>Tekan tombol <strong>Share</strong> (ikon kotak tanda panah ke atas) di bawah.</li>
                  <li>Pilih <strong>Add to Home Screen</strong> (Tambah ke Layar Utama).</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Back Button */}
        <div className="pt-2 pb-6 text-center">
          <a href="/">
            <Button size="lg" className="h-11 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Halaman Utama
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
