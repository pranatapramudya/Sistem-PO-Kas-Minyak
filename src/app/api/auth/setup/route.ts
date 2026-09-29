import { NextRequest, NextResponse } from "next/server";
import { saveNewPIN, createSessionToken, COOKIE_NAME, DEFAULT_TENANT_ID } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    const recoveryKey = typeof body.recoveryKey === "string" ? body.recoveryKey.trim() : "sim2026";

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN harus berupa 6 digit angka." },
        { status: 400 }
      );
    }

    // Save PIN to Neon PostgreSQL
    await saveNewPIN(pin, recoveryKey);

    // Auto login
    const token = await createSessionToken(DEFAULT_TENANT_ID, 90);
    const res = NextResponse.json({
      success: true,
      message: "PIN keamanan berhasil dibuat",
    });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 90 * 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    console.error("Auth setup error:", error);
    return NextResponse.json(
      { error: "Gagal membuat PIN. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
