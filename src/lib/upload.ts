import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Save uploaded file:
 * - On Vercel / serverless: saves as Base64 Data URL directly into database (zero config needed, persistent)
 * - On local development: saves to public/uploads/
 * Returns the URL path or data URL
 */
export async function saveUploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // If running on Vercel or production serverless, store as Base64 Data URL
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const mime = file.type || "application/octet-stream";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }

  try {
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Create directory if not exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "";
    const filename = `${timestamp}-${random}.${ext}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch {
    // Graceful fallback to Data URL if filesystem write fails
    const mime = file.type || "application/octet-stream";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }
}

/**
 * Delete file from public/uploads/ (local only)
 */
export async function deleteUploadFile(publicUrl: string): Promise<void> {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return;

  try {
    const filename = publicUrl.replace("/uploads/", "");
    const filepath = join(process.cwd(), "public", "uploads", filename);

    if (existsSync(filepath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filepath);
    }
  } catch {
    // Ignore error if file doesn't exist
  }
}

/**
 * Validate file type and size
 */
export function validateUploadFile(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const maxSizeMB = options.maxSizeMB || 5;
  const allowedTypes = options.allowedTypes || [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File terlalu besar (maks ${maxSizeMB}MB)` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Tipe file tidak didukung (hanya JPG, PNG, WebP, PDF)" };
  }

  return { valid: true };
}