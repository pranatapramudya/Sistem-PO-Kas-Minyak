"use client";

import {
  BookOpen,
  PackagePlus,
  Printer,
  PlusCircle,
  TrendingUp,
  Settings,
  Smartphone,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PanduanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PanduanDialog({ open, onOpenChange }: PanduanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-50 text-slate-800 border border-slate-200">
        <DialogHeader className="border-b border-slate-200/90 pb-3 pr-8 sm:pr-10 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Buku Panduan Cara Pakai
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                Petunjuk Lengkap &amp; Praktis Sistem Pembukuan PO &amp; Sembako
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1 pb-4">
          {/* Ringkasan Cepat Alur Usaha */}
          <Card className="border-2 border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 rounded-2xl shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base font-bold text-blue-950 flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-600 text-white text-[10px]">ALUR</span>
                Bagaimana Cara Kerja Aplikasi Ini?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs sm:text-sm text-slate-700">
              <p className="leading-relaxed">
                Aplikasi ini dirancang khusus untuk mempermudah Anda mencatat <strong>modal pembelian sembako/barang</strong> dan mengawasi <strong>pelunasan kas masuk</strong> dari pembeli, sehingga uang modal dan keuntungan bisnis Anda selalu terpantau jelas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="font-mono font-black text-blue-600 text-xs">1. Buat PO</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Catat pesanan barang ke supplier / distributor sebagai modal keluar.</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="font-mono font-black text-purple-600 text-xs">2. Cetak A4</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cetak surat pesanan resmi A4 ber-kop nama toko Anda untuk arsip/supplier.</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="font-mono font-black text-emerald-600 text-xs">3. Catat Kas</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Catat setiap uang pembayaran masuk dari pembeli (cicilan atau lunas).</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="font-mono font-black text-amber-600 text-xs">4. Cek Laba</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dashboard langsung menghitung sisa piutang modal dan keuntungan bersih.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bab 1: Pendaftaran & Login Akun Toko */}
          <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                1. Cara Mendaftar &amp; Masuk Akun Toko Anda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-3 text-xs text-slate-700">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">A</span>
                  Jika Belum Punya Akun (Pendaftaran Baru):
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                  <li>Buka aplikasi, lalu klik tab <strong>Daftar Baru</strong> di bagian atas layar login.</li>
                  <li>Isi <strong>Nama Toko / Usaha</strong> Anda (misal: <em>Toko Sembako Barokah</em>).</li>
                  <li>Masukkan <strong>Username atau No. WhatsApp</strong> yang mudah Anda ingat.</li>
                  <li>Tentukan <strong>6 angka PIN rahasia</strong> untuk login harian.</li>
                  <li>Klik tombol <strong>Daftar &amp; Buka Aplikasi</strong>. Akun toko Anda langsung siap!</li>
                </ul>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center">B</span>
                  Jika Sudah Punya Akun (Tinggal Masuk):
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                  <li>Pilih tab <strong>Masuk</strong>.</li>
                  <li>Ketik Username atau No. WhatsApp yang terdaftar pada kolom akun.</li>
                  <li>Tekan <strong>6 digit angka PIN</strong> Anda pada tombol keypad besar.</li>
                  <li>Sistem akan langsung membuka dashboard pembukuan toko Anda.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Bab 2: Membuat PO Baru */}
          <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-blue-600" />
                2. Cara Membuat Surat Pesanan (PO Baru - Modal Keluar)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-3 text-xs text-slate-700">
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                <li>
                  <strong>Buka Formulir PO:</strong> Tekan tombol bulat hitam <strong>+ Buat PO</strong> di tengah bawah layar HP (atau tombol hitam di kanan atas pada layar laptop/PC).
                </li>
                <li>
                  <strong>Isi Data Supplier:</strong> Masukkan tanggal pemesanan dan nama distributor/supplier tempat Anda membeli barang.
                </li>
                <li>
                  <strong>Rincian Barang:</strong> Masukkan nama barang, qty, satuan (Jerigen, Drum, Liter, Kg, Dus/Box), dan harga beli satuan.
                </li>
                <li>
                  <strong>Estimasi Penjualan (Opsional):</strong> Masukkan perkiraan harga jual total ke pembeli untuk memproyeksikan target laba.
                </li>
                <li>
                  <strong>Upload Bukti Transfer:</strong> Anda dapat melampirkan foto struk atau screenshot bukti transfer bank ke supplier.
                </li>
                <li>
                  Klik <strong>Simpan PO</strong>. Transaksi akan langsung tercatat dengan nomor PO unik otomatis.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Bab 3: Cetak Surat Pesanan A4 */}
          <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-700" />
                3. Cara Mencetak Dokumen Surat Pesanan Resmi (A4)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-3 text-xs text-slate-600">
              <p>
                Setiap PO memiliki lembar dokumen resmi standar kertas A4 yang sudah dilengkapi kop surat nama usaha, alamat, dan nomor telepon Anda:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Pada tabel transaksi PO, klik tombol <strong>Print (Cetak)</strong> di baris PO yang ingin dicetak.</li>
                <li>Halaman pratinjau dokumen A4 resmi akan terbuka dengan tata letak kop surat, tabel rincian, dan tanda tangan 2 pihak yang rapi dan presisi.</li>
                <li>Klik tombol <strong>Cetak / Simpan PDF</strong> untuk mencetak atau menyimpannya sebagai file PDF di perangkat Anda.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Bab 4: Mencatat Kas Masuk */}
          <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                4. Cara Mencatat Kas Masuk / Pelunasan Pembeli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-3 text-xs text-slate-700">
              <p className="text-slate-600">
                Ketika pembeli mentransfer uang atau membayar tunai:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Tekan tombol hijau <strong>+ Kas Masuk</strong>.</li>
                <li>Pilih transaksi PO yang bersangkutan.</li>
                <li>Gunakan tombol pintas <strong>50%</strong>, <strong>Lunas Penuh</strong>, atau ketik sendiri nominal yang diterima.</li>
                <li>Pilih metode pembayaran (Transfer Bank atau Tunai) dan tanggal diterima.</li>
                <li>Klik <strong>Simpan Kas Masuk</strong>.</li>
              </ol>
              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5 mt-2">
                <span className="font-bold text-slate-800">Status Transaksi:</span>
                <p>• <span className="font-semibold text-rose-600">PENDING:</span> Belum ada pembayaran masuk sama sekali.</p>
                <p>• <span className="font-semibold text-amber-600">DICICIL:</span> Pembeli sudah membayar sebagian, masih ada sisa modal.</p>
                <p>• <span className="font-semibold text-emerald-600">LUNAS:</span> Modal PO sudah tertutup 100%. Kas yang melebihi modal adalah keuntungan bersih.</p>
              </div>
            </CardContent>
          </Card>

          {/* Bab 5: 4 Angka Dashboard */}
          <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                5. Cara Membaca 4 Angka Penting di Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 text-xs">
              <div className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/50">
                <span className="font-bold text-blue-900">Sisa Modal Aktif (Biru)</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Total uang modal Anda yang saat ini masih berjalan dan belum balik modal.</p>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/50">
                <span className="font-bold text-amber-900">Piutang Berjalan (Orange)</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Uang yang masih ada di pembeli/pelanggan yang harus segera ditagih.</p>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <span className="font-bold text-emerald-900">Laba Bulan Ini (Hijau)</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Keuntungan bersih riil di bulan berjalan (Total Kas Masuk dikurangi Total Modal Keluar).</p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900">PO Selesai (Abu-abu)</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Total transaksi pesanan PO yang seluruh modalnya telah berhasil lunas.</p>
              </div>
            </CardContent>
          </Card>

          {/* Bab 6: Laporan Excel & Pengaturan */}
          <Card className="border border-slate-200/90 bg-white rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-700" />
                6. Export Excel &amp; Pengaturan Profil Usaha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-3 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Unduh Laporan Excel:
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Klik tombol <strong>Export Excel</strong> di menu atas atau navigasi bawah untuk mengunduh rekap transaksi lengkap dalam format file <code>.xlsx</code>.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Atur Kop Surat Usaha:
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Buka menu <strong>Pengaturan</strong> untuk mengisi alamat gudang, nomor telepon kantor/toko, dan nama pemilik untuk kop surat pesanan A4.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bab 7: Tips Pasang HP */}
          <Card className="border border-emerald-200/90 bg-emerald-50/40 rounded-2xl shadow-xs">
            <CardHeader className="pb-2 border-b border-emerald-100">
              <CardTitle className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                7. Tips: Jadikan Aplikasi di Layar Utama HP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                Pasang aplikasi ini di beranda HP Anda layaknya aplikasi Play Store / App Store:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="font-bold text-emerald-900 text-xs">Pengguna Android (Chrome):</span>
                  <ol className="list-decimal list-inside text-[11px] text-slate-600 mt-1 space-y-0.5">
                    <li>Buka website di Google Chrome.</li>
                    <li>Tekan ikon <strong>Titik Tiga</strong> di pojok kanan atas.</li>
                    <li>Pilih <strong>Tambahkan ke Layar Utama</strong>.</li>
                  </ol>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="font-bold text-emerald-900 text-xs">Pengguna iPhone (Safari):</span>
                  <ol className="list-decimal list-inside text-[11px] text-slate-600 mt-1 space-y-0.5">
                    <li>Buka website di Safari.</li>
                    <li>Tekan tombol <strong>Share</strong> (ikon kotak panah atas).</li>
                    <li>Pilih <strong>Add to Home Screen</strong>.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-2 border-t border-slate-200 text-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-10 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
          >
            Tutup Buku Panduan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
