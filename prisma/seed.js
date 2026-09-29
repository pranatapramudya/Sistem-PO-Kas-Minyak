const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SIM-TRADING database with 12 realistic oil trading transactions...");

  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.cashInflow.deleteMany();
  await prisma.purchaseOrder.deleteMany();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const seedData = [
    {
      poNumber: "PO-202609-0001",
      date: new Date(year, month, 1),
      supplierName: "PT. Sumber Nabati Sawit",
      status: "CLOSED",
      totalCost: 12500000,
      expectedRevenue: 15000000,
      notes: "Toko Berkah Pasar Besar, lunas via Transfer BCA",
      items: [
        { itemName: "Minyak Goreng Curah Berkualitas", qty: 50, unit: "Jerigen", unitPrice: 250000, subtotal: 12500000 },
      ],
      cashInflow: [
        { amount: 7500000, receivedDate: new Date(year, month, 3), paymentMethod: "TRANSFER_BANK", notes: "DP 50%" },
        { amount: 7500000, receivedDate: new Date(year, month, 5), paymentMethod: "TRANSFER_BANK", notes: "Pelunasan" },
      ],
    },
    {
      poNumber: "PO-202609-0002",
      date: new Date(year, month, 3),
      supplierName: "CV. Sawit Makmur Jaya",
      status: "CLOSED",
      totalCost: 5000000,
      expectedRevenue: 6200000,
      notes: "Warung Bu Siti & Toko Rejeki, lunas tunai",
      items: [
        { itemName: "Jerigen Minyak Kemasan 5 Liter", qty: 100, unit: "Jerigen", unitPrice: 50000, subtotal: 5000000 },
      ],
      cashInflow: [
        { amount: 6200000, receivedDate: new Date(year, month, 6), paymentMethod: "TUNAI", notes: "Lunas bayar di tempat" },
      ],
    },
    {
      poNumber: "PO-202609-0003",
      date: new Date(year, month, 6),
      supplierName: "PT. Wilmar Agro Trading",
      status: "CLOSED",
      totalCost: 12000000,
      expectedRevenue: 14000000,
      notes: "Pabrik Krupuk Sumber Rezeki, lunas tempo 5 hari",
      items: [
        { itemName: "Minyak Curah Drum 200 Liter", qty: 4, unit: "Drum", unitPrice: 3000000, subtotal: 12000000 },
      ],
      cashInflow: [
        { amount: 14000000, receivedDate: new Date(year, month, 10), paymentMethod: "TRANSFER_BANK", notes: "Transfer lunas Bank Mandiri" },
      ],
    },
    {
      poNumber: "PO-202609-0004",
      date: new Date(year, month, 8),
      supplierName: "CV. Berkah Minyak Sejahtera",
      status: "CLOSED",
      totalCost: 16800000,
      expectedRevenue: 19200000,
      notes: "Grosir Sembako Jaya Abadi",
      items: [
        { itemName: "Minyakita Kemasan Bantal 1 Liter", qty: 120, unit: "Dus", unitPrice: 140000, subtotal: 16800000 },
      ],
      cashInflow: [
        { amount: 10000000, receivedDate: new Date(year, month, 10), paymentMethod: "TRANSFER_BANK", notes: "Termin 1" },
        { amount: 9200000, receivedDate: new Date(year, month, 13), paymentMethod: "TRANSFER_BANK", notes: "Pelunasan Termin 2" },
      ],
    },
    {
      poNumber: "PO-202609-0005",
      date: new Date(year, month, 11),
      supplierName: "PT. Musim Mas Nusantara",
      status: "CLOSED",
      totalCost: 8000000,
      expectedRevenue: 9600000,
      notes: "Katering Sedap Rasa & Mitra Kuliner",
      items: [
        { itemName: "Minyak Goreng Premium SunCo Dus", qty: 40, unit: "Dus", unitPrice: 200000, subtotal: 8000000 },
      ],
      cashInflow: [
        { amount: 9600000, receivedDate: new Date(year, month, 14), paymentMethod: "TRANSFER_BANK", notes: "Transfer BCA lunas" },
      ],
    },
    {
      poNumber: "PO-202609-0006",
      date: new Date(year, month, 14),
      supplierName: "CV. Sawit Makmur Jaya",
      status: "PARTIAL",
      totalCost: 18000000,
      expectedRevenue: 21500000,
      notes: "Mitra Grosir Pasar Johar, tempo 14 hari",
      items: [
        { itemName: "Minyak Goreng Curah Drum 200 Liter", qty: 6, unit: "Drum", unitPrice: 3000000, subtotal: 18000000 },
      ],
      cashInflow: [
        { amount: 10000000, receivedDate: new Date(year, month, 17), paymentMethod: "TRANSFER_BANK", notes: "Transfer BCA Termin 1" },
      ],
    },
    {
      poNumber: "PO-202609-0007",
      date: new Date(year, month, 16),
      supplierName: "PT. Wilmar Agro Trading",
      status: "PARTIAL",
      totalCost: 14000000,
      expectedRevenue: 16500000,
      notes: "Kemitraan UMKM Gorengan & Keripik Tempe",
      items: [
        { itemName: "Minyak Jerigen 18 Liter", qty: 50, unit: "Jerigen", unitPrice: 280000, subtotal: 14000000 },
      ],
      cashInflow: [
        { amount: 7000000, receivedDate: new Date(year, month, 19), paymentMethod: "TUNAI", notes: "Setoran Tunai Termin 1" },
      ],
    },
    {
      poNumber: "PO-202609-0008",
      date: new Date(year, month, 18),
      supplierName: "CV. Nusantara Barokah",
      status: "PARTIAL",
      totalCost: 7500000,
      expectedRevenue: 9000000,
      notes: "Toko Kelontong Sentosa & Agen Beras",
      items: [
        { itemName: "Minyak Curah Kualitas Super", qty: 30, unit: "Jerigen", unitPrice: 250000, subtotal: 7500000 },
      ],
      cashInflow: [
        { amount: 4000000, receivedDate: new Date(year, month, 21), paymentMethod: "TRANSFER_BANK", notes: "DP Pembelian" },
      ],
    },
    {
      poNumber: "PO-202609-0009",
      date: new Date(year, month, 21),
      supplierName: "PT. Indoagri Palm Oil",
      status: "OUTSTANDING",
      totalCost: 9500000,
      expectedRevenue: 11200000,
      notes: "Barang sudah dikirim ke gudang mitra, jatuh tempo tgl 28",
      items: [
        { itemName: "Minyak Goreng Filma Dus Kemasan 2L", qty: 50, unit: "Dus", unitPrice: 190000, subtotal: 9500000 },
      ],
      cashInflow: [],
    },
    {
      poNumber: "PO-202609-0010",
      date: new Date(year, month, 23),
      supplierName: "PT. Sumber Nabati Sawit",
      status: "OUTSTANDING",
      totalCost: 15000000,
      expectedRevenue: 17800000,
      notes: "Pesanan Koperasi Unit Desa, tempo 7 hari",
      items: [
        { itemName: "Minyak Goreng Curah Tangki Mini", qty: 1, unit: "Tangki", unitPrice: 15000000, subtotal: 15000000 },
      ],
      cashInflow: [],
    },
    {
      poNumber: "PO-202609-0011",
      date: new Date(year, month, 25),
      supplierName: "CV. Sinar Terang Minyak",
      status: "OUTSTANDING",
      totalCost: 11200000,
      expectedRevenue: 13000000,
      notes: "Pengiriman via ekspedisi lokal, resi terlampir",
      items: [
        { itemName: "Minyak Goreng Jerigen 20 Liter", qty: 40, unit: "Jerigen", unitPrice: 280000, subtotal: 11200000 },
      ],
      cashInflow: [],
    },
    {
      poNumber: "PO-202609-0012",
      date: new Date(year, month, 27),
      supplierName: "PT. Wilmar Agro Trading",
      status: "OUTSTANDING",
      totalCost: 13500000,
      expectedRevenue: 15800000,
      notes: "Baru tiba di gudang transit",
      items: [
        { itemName: "Minyak Kemasan Bantal 1L", qty: 100, unit: "Dus", unitPrice: 135000, subtotal: 13500000 },
      ],
      cashInflow: [],
    },
  ];

  for (const item of seedData) {
    const { items, cashInflow, ...poHeader } = item;
    await prisma.purchaseOrder.create({
      data: {
        ...poHeader,
        items: {
          create: items,
        },
        cashInflow: {
          create: cashInflow,
        },
      },
    });
  }

  console.log(`Seeding complete: ${seedData.length} PO transactions successfully created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
