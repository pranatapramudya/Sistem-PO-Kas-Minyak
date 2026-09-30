import { NextRequest, NextResponse } from "next/server";
import { registerTenant, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    const ownerName = typeof body.ownerName === "string" ? body.ownerName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : identifier;
    const address = typeof body.address === "string" ? body.address.trim() : "";

    if (!companyName) {
      return NextResponse.json({ error: "Nama Usaha / Toko wajib diisi" }, { status: 400 });
    }
    if (!identifier) {
      return NextResponse.json({ error: "Username / No. WhatsApp / HP wajib diisi untuk login" }, { status: 400 });
    }
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN harus berupa 6 digit angka" }, { status: 400 });
    }

    const tenant = await registerTenant({
      companyName,
      identifier,
      pin,
      ownerName,
      phone,
      address,
    });

    // Automatically create session and log in
    const token = await createSessionToken(tenant.id, 30);
    const maxAge = 30 * 24 * 60 * 60;

    const res = NextResponse.json({
      success: true,
      message: "Pendaftaran usaha berhasil! Selamat datang di Sistem PO & Sembako.",
      tenant: {
        id: tenant.id,
        companyName: tenant.companyName,
        identifier: tenant.identifier,
      },
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
    console.error("Auth register error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mendaftarkan usaha baru" },
      { status: 400 }
    );
  }
}
