import { NextResponse } from "next/server";
import { isPINInitialized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const initialized = await isPINInitialized();
    return NextResponse.json({
      isInitialized: initialized,
    });
  } catch (e: any) {
    console.error("Auth status check failed:", e);
    return NextResponse.json({ isInitialized: false }, { status: 500 });
  }
}
