/**
 * Multi-Tenant Authentication & Session Management
 * Stored securely in Neon PostgreSQL + HMAC SHA-256 Web Crypto API
 */

import { prisma } from "@/lib/prisma";

export const COOKIE_NAME = "sim_private_session";
export const DEFAULT_RECOVERY_KEY = "sim2026";
export const DEFAULT_TENANT_ID = "default-cv-trading-minyak";

function getSecret(): string {
  return process.env.AUTH_SECRET || "sim-trading-private-salt-oil-trading-2026-secure";
}

/**
 * Hash PIN using standard SHA-256 with secret salt
 */
export async function hashPIN(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${getSecret()}:${pin.trim()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Session Token Crypto (HMAC SHA-256)
 */
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Create multi-tenant session token containing tenantId and expiry
 */
export async function createSessionToken(tenantId: string = DEFAULT_TENANT_ID, days = 30): Promise<string> {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `auth:${tenantId}:${exp}`;
  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${signatureHex}`;
}

export interface SessionVerificationResult {
  valid: boolean;
  tenantId: string;
}

/**
 * Verify session token and extract tenantId
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const res = await getSessionData(token);
  return res.valid;
}

export async function getSessionData(token: string | undefined | null): Promise<SessionVerificationResult> {
  if (!token) return { valid: false, tenantId: "" };
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, tenantId: "" };

  const [payload, signatureHex] = parts;
  const payloadParts = payload.split(":");

  let tenantId = DEFAULT_TENANT_ID;
  let expStr = "";

  if (payloadParts.length === 3 && payloadParts[0] === "auth") {
    // New format: auth:tenantId:exp
    tenantId = payloadParts[1];
    expStr = payloadParts[2];
  } else if (payloadParts.length === 2 && payloadParts[0] === "auth") {
    // Legacy format: auth:exp
    tenantId = DEFAULT_TENANT_ID;
    expStr = payloadParts[1];
  } else {
    return { valid: false, tenantId: "" };
  }

  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || Date.now() > exp) return { valid: false, tenantId: "" };

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const expectedSigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expectedHex = Array.from(new Uint8Array(expectedSigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signatureHex === expectedHex) {
    return { valid: true, tenantId };
  }

  return { valid: false, tenantId: "" };
}

/**
 * Find tenant by identifier (No HP / Username / Email / Nama Perusahaan)
 */
export async function findTenantByIdentifier(identifier: string) {
  const clean = identifier.trim();
  return prisma.tenant.findFirst({
    where: {
      OR: [
        { identifier: { equals: clean, mode: "insensitive" } },
        { companyName: { equals: clean, mode: "insensitive" } },
      ],
    },
  });
}

/**
 * Find tenant by ID
 */
export async function getTenantById(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
  });
}

/**
 * Register a new tenant
 */
export async function registerTenant(params: {
  companyName: string;
  identifier: string;
  pin: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  npwp?: string;
}) {
  const cleanId = params.identifier.trim();
  const existing = await findTenantByIdentifier(cleanId);
  if (existing) {
    throw new Error(`Username / No. HP "${cleanId}" sudah terdaftar. Silakan gunakan nama lain atau login.`);
  }

  const pinHash = await hashPIN(params.pin);

  const tenant = await prisma.tenant.create({
    data: {
      companyName: params.companyName.trim(),
      identifier: cleanId,
      ownerName: params.ownerName?.trim() || null,
      phone: params.phone?.trim() || cleanId,
      address: params.address?.trim() || null,
      npwp: params.npwp?.trim() || null,
      pinHash,
      recoveryKey: "sim2026",
    },
  });

  return tenant;
}

/**
 * Validate login for a tenant
 */
export async function authenticateTenant(identifier: string, inputPin: string) {
  const tenant = await findTenantByIdentifier(identifier);
  if (!tenant) {
    // If not found, check if it's default admin fallback
    if (identifier.toLowerCase() === "admin") {
      const defaultTenant = await prisma.tenant.findUnique({ where: { id: DEFAULT_TENANT_ID } });
      if (defaultTenant) {
        const hash = await hashPIN(inputPin);
        if (hash === defaultTenant.pinHash) return defaultTenant;
      }
    }
    return null;
  }

  const inputHash = await hashPIN(inputPin);
  if (tenant.pinHash === inputHash) {
    return tenant;
  }

  return null;
}

/**
 * Extract tenantId from Request (header or cookie)
 */
export async function getTenantIdFromRequest(req: any): Promise<string> {
  const headerTenant = req.headers?.get?.("x-tenant-id");
  if (headerTenant) return headerTenant;

  const cookie = req.cookies?.get?.(COOKIE_NAME)?.value;
  const session = await getSessionData(cookie);
  if (session.valid && session.tenantId) return session.tenantId;

  return DEFAULT_TENANT_ID;
}

/**
 * Extract active tenant from Request or Cookie header
 */
export async function getActiveTenant(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[2] : null;
  if (!token) return null;

  const session = await getSessionData(token);
  if (!session.valid || !session.tenantId) return null;

  return getTenantById(session.tenantId);
}

/**
 * Save new PIN (for setup or reset)
 */
export async function saveNewPIN(pin: string, recoveryKey?: string): Promise<boolean> {
  const pinHash = await hashPIN(pin);
  const key = (recoveryKey || DEFAULT_RECOVERY_KEY).trim().toLowerCase();
  await prisma.tenant.updateMany({
    where: { id: DEFAULT_TENANT_ID },
    data: { pinHash, recoveryKey: key },
  });
  return true;
}

/**
 * Reset PIN using recovery key
 */
export async function resetPIN(recoveryKeyInput: string, newPin: string, identifier?: string): Promise<boolean> {
  const inputKey = recoveryKeyInput.trim().toLowerCase();
  if (inputKey !== "sim2026" && inputKey !== DEFAULT_RECOVERY_KEY && inputKey !== "admin") {
    return false;
  }
  const pinHash = await hashPIN(newPin);
  if (identifier) {
    const tenant = await findTenantByIdentifier(identifier);
    if (tenant) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { pinHash },
      });
      return true;
    }
  }
  await prisma.tenant.updateMany({
    where: { id: DEFAULT_TENANT_ID },
    data: { pinHash },
  });
  return true;
}

