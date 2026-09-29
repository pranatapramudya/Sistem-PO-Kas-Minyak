import { prisma } from "@/lib/prisma";
import { formatDateIndo, formatRupiah, terbilang } from "@/lib/utils";
import { PrintActionBar } from "@/components/print/PrintActionBar";

export const dynamic = "force-dynamic";

interface POPrintPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function POPrintPage({ params }: POPrintPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: true,
      cashInflow: true,
      tenant: true,
    },
  });

  if (!po) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 bg-white rounded-lg border shadow-sm">
        <h1 className="text-xl font-bold text-red-600">PO Tidak Ditemukan</h1>
        <p className="text-muted-foreground mt-2 text-sm">Data PO dengan ID tersebut tidak ditemukan di database.</p>
      </div>
    );
  }

  const appName = po.tenant?.companyName || process.env.APP_NAME || "CV. TRADING MINYAK";
  const appAddress = po.tenant?.address || process.env.APP_ADDRESS || "Jl. Raya Utama No. 123, Jakarta Selatan";
  const appPhone = po.tenant?.phone || process.env.APP_PHONE || "0812-3456-7890";
  const npwp = po.tenant?.npwp || process.env.NPWP || "00.000.000.0-000.000";

  const statusLabel =
    po.status === "CLOSED" ? "LUNAS / SELESAI" : po.status === "PARTIAL" ? "SEBAGIAN (PARTIAL)" : "PENDING (BELUM LUNAS)";

  const statusColorClass =
    po.status === "CLOSED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : po.status === "PARTIAL"
      ? "bg-blue-50 text-blue-700 border-blue-300"
      : "bg-amber-50 text-amber-800 border-amber-300";

  return (
    <div className="bg-slate-100 min-h-screen pb-12 print:bg-white print:p-0 print:m-0">
      <PrintActionBar poNumber={po.poNumber} />

      {/* Mobile helper notice banner: hidden in print */}
      <div className="no-print max-w-[210mm] mx-auto px-3 mb-3 md:hidden">
        <div className="bg-blue-50/90 border border-blue-200/80 text-blue-900 text-xs px-3 py-2 rounded-lg flex items-center justify-between shadow-2xs font-medium">
          <span className="flex items-center gap-1.5 font-bold">
            <span>📄</span> Pratinjau Kertas A4 Resmi
          </span>
          <span className="text-[11px] text-blue-700">Geser untuk melihat ⇄</span>
        </div>
      </div>

      {/* Horizontal scroll wrapper for mobile preview */}
      <div className="print-scroll-wrapper w-full overflow-x-auto px-2 sm:px-6 pb-6 print:p-0 print:overflow-visible print:w-full">
        {/* A4 Paper Container with fixed standard proportions */}
        <div className="print-sheet w-[794px] max-w-[210mm] min-w-[760px] mx-auto bg-white border border-slate-300 shadow-md rounded-xs p-8 sm:p-10 text-slate-900 text-xs font-sans leading-relaxed print:w-full print:min-w-0 print:max-w-none print:shadow-none print:border-none print:p-0">
          
          {/* Kop Surat Resmi: Selalu Berdampingan Kiri-Kanan */}
          <div className="flex items-start justify-between gap-4 pb-3">
            <div>
              <div className="text-xl font-black tracking-tight text-slate-950 uppercase">
                {appName}
              </div>
              <div className="text-[11px] font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                Trading &amp; Distribusi Minyak Goreng (Retail &amp; Grosir)
              </div>
              <div className="text-[11px] text-slate-600 mt-1 leading-normal">
                {appAddress}
                <br />
                Telp / WA: <span className="font-semibold text-slate-800">{appPhone}</span> &nbsp;|&nbsp; NPWP: <span className="font-semibold text-slate-800">{npwp}</span>
              </div>
            </div>

            <div className="text-right shrink-0 pt-0">
              <div className="inline-block bg-slate-900 text-white font-black text-xs tracking-wider uppercase px-3 py-1 rounded-xs">
                SURAT PESANAN (PO)
              </div>
              <div className="mt-2 text-xs">
                <span className="text-slate-500 font-medium">No. Dokumen:</span>
                <div className="font-mono font-black text-sm text-slate-900 mt-0.5 tracking-tight">
                  {po.poNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Double Border Line (Standar Kop Surat Resmi Indonesia) */}
          <div className="border-b-2 border-slate-900"></div>
          <div className="border-b border-slate-400 mt-[2px] mb-5"></div>

          {/* 2-Column Structured Metadata Box: Tetap 2 Kolom Sejajar */}
          <div className="grid grid-cols-2 gap-3.5 mb-5 text-xs">
            {/* Card Vendor / Rekanan */}
            <div className="border border-slate-300 rounded-xs overflow-hidden bg-white">
              <div className="bg-slate-100/90 border-b border-slate-300 px-3 py-1.5 font-bold uppercase tracking-wider text-slate-700 text-[11px] flex items-center justify-between">
                <span>Ditujukan Kepada (Vendor / Supplier)</span>
              </div>
              <div className="p-3 space-y-1">
                <div className="font-bold text-slate-950 text-sm">{po.supplierName}</div>
                <div className="text-slate-600">Perihal: Pengadaan Stok Minyak Goreng</div>
                <div className="text-slate-500 text-[11px]">Tujuan Pengiriman: Gudang Utama &amp; Transit Logistik</div>
              </div>
            </div>

            {/* Card Detail PO & Status */}
            <div className="border border-slate-300 rounded-xs overflow-hidden bg-white">
              <div className="bg-slate-100/90 border-b border-slate-300 px-3 py-1.5 font-bold uppercase tracking-wider text-slate-700 text-[11px] flex items-center justify-between">
                <span>Detail Transaksi &amp; Pembayaran</span>
              </div>
              <div className="p-3 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tanggal Pesanan:</span>
                  <span className="font-semibold text-slate-900">{formatDateIndo(po.date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status Pembayaran:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs border uppercase tracking-wider ${statusColorClass}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-0.5 border-t border-slate-100">
                  <span className="text-slate-600 font-medium">Total Modal PO:</span>
                  <span className="font-mono font-bold text-slate-950">{formatRupiah(po.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Rincian Barang (Presisi Grid Table) */}
          <div className="mb-4">
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase tracking-wider border-b-2 border-slate-400">
                  <th className="border border-slate-300 py-2 px-2 text-center w-10">No</th>
                  <th className="border border-slate-300 py-2 px-3 text-left">Nama Barang / Deskripsi</th>
                  <th className="border border-slate-300 py-2 px-2 text-center w-16">Qty</th>
                  <th className="border border-slate-300 py-2 px-2 text-center w-20">Satuan</th>
                  <th className="border border-slate-300 py-2 px-3 text-right w-32">Harga Satuan</th>
                  <th className="border border-slate-300 py-2 px-3 text-right w-36">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="border border-slate-300 py-2 px-2 text-center font-medium text-slate-700">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900">
                      {item.itemName}
                    </td>
                    <td className="border border-slate-300 py-2 px-2 text-center font-mono font-bold text-slate-900">
                      {item.qty}
                    </td>
                    <td className="border border-slate-300 py-2 px-2 text-center text-slate-700">
                      {item.unit}
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-mono tabular-nums text-slate-800">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-950">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-700 text-slate-900">
                  <td colSpan={5} className="border border-slate-300 py-2.5 px-3 text-right uppercase tracking-wider text-xs">
                    TOTAL MODAL PO :
                  </td>
                  <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-sm font-black text-slate-950 tabular-nums">
                    {formatRupiah(po.totalCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Box Terbilang */}
          <div className="border border-slate-300 bg-slate-50/80 p-2.5 rounded-xs mb-4 flex items-baseline gap-2 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wide shrink-0">TERBILANG :</span>
            <span className="font-bold italic text-slate-950 uppercase tracking-wide">
              # {terbilang(po.totalCost)} #
            </span>
          </div>

          {/* Catatan Khusus (Jika Ada) */}
          {po.notes && (
            <div className="border border-slate-300 bg-slate-50/60 p-2.5 rounded-xs mb-4 text-xs">
              <span className="font-bold text-slate-800">Catatan Khusus / Logistik: </span>
              <span className="text-slate-700">{po.notes}</span>
            </div>
          )}

          {/* Ketentuan & Syarat Penerimaan */}
          <div className="border border-slate-200 bg-slate-50/40 p-3 rounded-xs mb-6 text-[11px] text-slate-600">
            <strong className="text-slate-800 block mb-1">Ketentuan &amp; Syarat Pemesanan:</strong>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Barang yang dikirim harus sesuai dengan spesifikasi, kualitas, dan kuantitas tercatat.</li>
              <li>Klaim atas kerusakan fisik, cacat kemasan, atau kebocoran wajib dilaporkan maksimal 2&times;24 jam sejak barang diterima.</li>
              <li>Pembayaran ditagihkan sesuai termin atau kesepakatan tempo/tunai yang disetujui.</li>
              <li>Surat Pesanan ini merupakan bukti komitmen pengadaan resmi yang sah dan mengikat.</li>
            </ol>
          </div>

          {/* Kolom Tanda Tangan Presisi (2 Kolom Sejajar) */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-2">
            {/* Kolom Penerima / Gudang */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-slate-600">Diterima &amp; Diperiksa Oleh,</p>
                <p className="font-bold text-slate-900 mt-0.5">Petugas Gudang / Penerima</p>
              </div>
              <div className="h-20 flex items-center justify-center text-[10px] text-slate-300 italic">
                ( Tanda Tangan &amp; Cap Gudang )
              </div>
              <div>
                <div className="w-48 mx-auto border-b border-slate-900"></div>
                <p className="text-[11px] text-slate-500 mt-1">Nama Jelas &amp; Tgl Terima</p>
              </div>
            </div>

            {/* Kolom Pemberi Pesanan */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-slate-600">Dibuat &amp; Disahkan Oleh,</p>
                <p className="font-bold text-slate-900 mt-0.5">{appName}</p>
              </div>
              <div className="h-20 flex items-center justify-center text-[10px] text-slate-300 italic">
                ( Tanda Tangan &amp; Stempel )
              </div>
              <div>
                <div className="w-48 mx-auto border-b border-slate-900"></div>
                <p className="text-[11px] text-slate-500 mt-1">Pimpinan / Penanggung Jawab</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}