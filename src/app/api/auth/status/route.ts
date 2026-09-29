import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tenantCount = await prisma.tenant.count();
    return NextResponse.json({
      isInitialized: tenantCount > 0,
      tenantCount,
    });
  } catch (e: any) {
    console.error("Auth status check failed:", e);
    return NextResponse.json({ isInitialized: false }, { status: 500 });
  }
}
