import { NextRequest, NextResponse } from "next/server";
import { validateInputPIN, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    const rememberDays = body.remember ? 90 : 30;

    if (!pin) {
      return NextResponse.json({ error: "PIN wajib diisi" }, { status: 400 });
    }

    const isValid = await validateInputPIN(pin);
    if (!isValid) {
      return NextResponse.json(
        { error: "PIN salah. Silakan coba lagi atau gunakan Lupa PIN." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(rememberDays);
    const maxAge = rememberDays * 24 * 60 * 60;

    const res = NextResponse.json({
      success: true,
      message: "Autentikasi berhasil",
    });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return res;
  } catch (error: any) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server autentikasi" },
      { status: 500 }
    );
  }
}
