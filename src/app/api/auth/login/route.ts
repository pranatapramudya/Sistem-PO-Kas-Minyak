import { NextRequest, NextResponse } from "next/server";
import { authenticateTenant, createSessionToken, COOKIE_NAME, DEFAULT_TENANT_ID } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const rememberDays = body.remember ? 90 : 30;

    if (!pin) {
      return NextResponse.json({ error: "PIN wajib diisi" }, { status: 400 });
    }

    let tenant = null;

    if (identifier) {
      tenant = await authenticateTenant(identifier, pin);
    } else {
      // If no identifier is specified, check against default tenant (admin / CV. TRADING MINYAK)
      tenant = await authenticateTenant("admin", pin);
      if (!tenant) {
        // Check if there is only 1 tenant in the DB
        const count = await prisma.tenant.count();
        if (count === 1) {
          const onlyTenant = await prisma.tenant.findFirst();
          if (onlyTenant) {
            tenant = await authenticateTenant(onlyTenant.identifier, pin);
          }
        }
      }
    }

    if (!tenant) {
      return NextResponse.json(
        { error: "Username / No. HP atau PIN tidak sesuai. Silakan periksa kembali." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(tenant.id, rememberDays);
    const maxAge = rememberDays * 24 * 60 * 60;

    const res = NextResponse.json({
      success: true,
      message: "Autentikasi berhasil",
      tenant: {
        id: tenant.id,
        companyName: tenant.companyName,
        identifier: tenant.identifier,
        ownerName: tenant.ownerName,
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
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server autentikasi" },
      { status: 500 }
    );
  }
}
