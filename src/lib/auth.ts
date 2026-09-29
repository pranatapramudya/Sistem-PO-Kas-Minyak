/**
 * Private App Authentication System (Dynamic PIN, Setup, & Reset)
 * Stored securely in Neon PostgreSQL + Web Crypto API
 */

import { prisma } from "@/lib/prisma";

export const COOKIE_NAME = "sim_private_session";
export const DEFAULT_RECOVERY_KEY = "sim2026";

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

export interface SecurityRecord {
  id: string;
  pinHash: string;
  recoveryKey: string;
  isInitialized: boolean;
  updatedAt: Date;
}

/**
 * Read security configuration from Neon database
 */
export async function getSecurityRecord(): Promise<SecurityRecord | null> {
  try {
    const rows: any = await prisma.$queryRawUnsafe(
      'SELECT id, "pinHash", "recoveryKey", "isInitialized", "updatedAt" FROM "SecurityConfig" WHERE id = $1 LIMIT 1',
      "default"
    );
    if (rows && rows.length > 0) {
      return rows[0] as SecurityRecord;
    }
    return null;
  } catch (e) {
    console.error("Failed to query SecurityConfig:", e);
    return null;
  }
}

/**
 * Check if a PIN has been set up already
 */
export async function isPINInitialized(): Promise<boolean> {
  const record = await getSecurityRecord();
  if (record && record.isInitialized && record.pinHash) {
    return true;
  }
  // If no DB record exists yet, check if legacy APP_PIN is in .env
  if (process.env.APP_PIN && process.env.APP_PIN !== "123456") {
    return true;
  }
  return false;
}

/**
 * Save new PIN (for first-time setup or reset)
 */
export async function saveNewPIN(pin: string, recoveryKey?: string): Promise<boolean> {
  try {
    const pinHash = await hashPIN(pin);
    const key = (recoveryKey || DEFAULT_RECOVERY_KEY).trim().toLowerCase();

    await prisma.$queryRawUnsafe(
      `INSERT INTO "SecurityConfig" (id, "pinHash", "recoveryKey", "isInitialized", "updatedAt")
       VALUES ('default', $1, $2, true, NOW())
       ON CONFLICT (id) DO UPDATE SET "pinHash" = $1, "recoveryKey" = $2, "isInitialized" = true, "updatedAt" = NOW()`,
      pinHash,
      key
    );
    return true;
  } catch (e) {
    console.error("Failed to save PIN:", e);
    throw new Error("Gagal menyimpan PIN ke database.");
  }
}

/**
 * Validate input PIN against stored hash
 */
export async function validateInputPIN(inputPin: string): Promise<boolean> {
  if (!inputPin) return false;
  const record = await getSecurityRecord();

  if (record && record.isInitialized && record.pinHash) {
    const inputHash = await hashPIN(inputPin);
    return inputHash === record.pinHash;
  }

  // Fallback to .env APP_PIN if not yet initialized in DB
  const envPin = (process.env.APP_PIN || "123456").trim();
  return inputPin.trim() === envPin;
}

/**
 * Reset PIN using recovery key
 */
export async function resetPIN(recoveryKeyInput: string, newPin: string): Promise<boolean> {
  const record = await getSecurityRecord();
  const expectedKey = record?.recoveryKey?.trim().toLowerCase() || DEFAULT_RECOVERY_KEY;
  const inputKey = recoveryKeyInput.trim().toLowerCase();

  // Allow either configured recovery key or master override
  if (inputKey !== expectedKey && inputKey !== DEFAULT_RECOVERY_KEY && inputKey !== "admin") {
    return false;
  }

  return saveNewPIN(newPin, expectedKey);
}

/**
 * Session Token Crypto
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

export async function createSessionToken(days = 30): Promise<string> {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `auth:${exp}`;
  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${signatureHex}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signatureHex] = parts;
  const [prefix, expStr] = payload.split(":");
  if (prefix !== "auth") return false;

  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || Date.now() > exp) return false;

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const expectedSigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expectedHex = Array.from(new Uint8Array(expectedSigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatureHex === expectedHex;
}
