const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function getSecret() {
  return process.env.AUTH_SECRET || "sim-trading-private-salt-oil-trading-2026-secure";
}

function hashPIN(pin) {
  return crypto
    .createHash("sha256")
    .update(`${getSecret()}:${pin.trim()}`)
    .digest("hex");
}

async function main() {
  console.log("Checking default tenant...");

  // Check if default tenant already exists
  let defaultTenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ identifier: "admin" }, { companyName: "CV. TRADING MINYAK" }],
    },
  });

  // Get pinHash from existing SecurityConfig
  let existingPinHash = null;
  try {
    const sec = await prisma.securityConfig.findUnique({ where: { id: "default" } });
    if (sec && sec.pinHash) {
      existingPinHash = sec.pinHash;
    }
  } catch (e) {
    console.log("No security config found");
  }

  if (!existingPinHash) {
    existingPinHash = hashPIN("123456");
  }

  if (!defaultTenant) {
    defaultTenant = await prisma.tenant.create({
      data: {
        id: "default-cv-trading-minyak",
        companyName: process.env.APP_NAME || "CV. TRADING MINYAK",
        ownerName: "Pemilik",
        identifier: "admin",
        address: process.env.APP_ADDRESS || "Jl. Raya Utama No. 123, Jakarta Selatan",
        phone: process.env.APP_PHONE || "0812-3456-7890",
        npwp: process.env.NPWP || "00.000.000.0-000.000",
        pinHash: existingPinHash,
        recoveryKey: "sim2026",
      },
    });
    console.log("Created default tenant:", defaultTenant.companyName, `(ID: ${defaultTenant.id})`);
  } else {
    console.log("Found existing tenant:", defaultTenant.companyName);
  }

  // Link any unassigned POs to default tenant
  const updatedPOs = await prisma.purchaseOrder.updateMany({
    where: { tenantId: null },
    data: { tenantId: defaultTenant.id },
  });
  console.log(`Linked ${updatedPOs.count} existing POs to default tenant.`);

  // Link any unassigned CashInflows to default tenant
  const updatedCash = await prisma.cashInflow.updateMany({
    where: { tenantId: null },
    data: { tenantId: defaultTenant.id },
  });
  console.log(`Linked ${updatedCash.count} existing CashInflows to default tenant.`);

  console.log("Multi-tenant database migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
