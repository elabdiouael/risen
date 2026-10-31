import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

/** Routes m7loulin bla session */
const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifyToken(token);

  if (PUBLIC_PATHS.has(pathname)) {
    if (ok && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!ok) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
