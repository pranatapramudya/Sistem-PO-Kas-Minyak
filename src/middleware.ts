import { NextRequest, NextResponse } from "next/server";
import { getSessionData, COOKIE_NAME } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons)
     * - manifest (manifest files)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow login page and auth API routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Check session token from cookie
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await getSessionData(sessionToken);

  if (session.valid && session.tenantId) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-tenant-id", session.tenantId);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. If accessing API route without valid session, return 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized: Silakan masukkan PIN terlebih dahulu" },
      { status: 401 }
    );
  }

  // 4. Redirect to login page for all other protected routes
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}
