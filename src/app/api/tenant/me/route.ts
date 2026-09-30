import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest, hashPIN } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        companyName: true,
        ownerName: true,
        identifier: true,
        phone: true,
        address: true,
        npwp: true,
        createdAt: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("GET /api/tenant/me error:", error);
    return NextResponse.json({ error: "Gagal mengambil data profil" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(request);
    const body = await request.json().catch(() => ({}));

    const updateData: any = {};
    if (typeof body.companyName === "string" && body.companyName.trim()) {
      updateData.companyName = body.companyName.trim();
    }
    if (typeof body.ownerName === "string") {
      updateData.ownerName = body.ownerName.trim() || null;
    }
    if (typeof body.phone === "string") {
      updateData.phone = body.phone.trim() || null;
    }
    if (typeof body.address === "string") {
      updateData.address = body.address.trim() || null;
    }
    if (typeof body.npwp === "string") {
      updateData.npwp = body.npwp.trim() || null;
    }
    if (typeof body.tagline === "string") {
      updateData.tagline = body.tagline.trim() || null;
    }
    if (typeof body.newPin === "string" && body.newPin.length === 6 && /^\d{6}$/.test(body.newPin)) {
      updateData.pinHash = await hashPIN(body.newPin);
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
      select: {
        id: true,
        companyName: true,
        ownerName: true,
        identifier: true,
        phone: true,
        address: true,
        npwp: true,
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error) {
    console.error("PUT /api/tenant/me error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
