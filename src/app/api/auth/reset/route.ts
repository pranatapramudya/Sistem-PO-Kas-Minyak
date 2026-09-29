import { NextRequest, NextResponse } from "next/server";
import { resetPIN, createSessionToken, COOKIE_NAME, DEFAULT_TENANT_ID } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recoveryKey = typeof body.recoveryKey === "string" ? body.recoveryKey.trim() : "";
    const newPin = typeof body.newPin === "string" ? body.newPin.trim() : "";

    if (!recoveryKey) {
      return NextResponse.json(
        { error: "Kode pemulihan wajib diisi." },
        { status: 400 }
      );
    }

    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { error: "PIN baru harus berupa 6 digit angka." },
        { status: 400 }
      );
    }

    const success = await resetPIN(recoveryKey, newPin);
    if (!success) {
      return NextResponse.json(
        { error: "Kode pemulihan salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    // Auto login with new PIN
    const token = await createSessionToken(DEFAULT_TENANT_ID, 90);
    const res = NextResponse.json({
      success: true,
      message: "PIN berhasil diperbarui.",
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
    console.error("Auth reset error:", error);
    return NextResponse.json(
      { error: "Gagal mereset PIN. Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
