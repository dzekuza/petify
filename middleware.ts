import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE_NAME = "page_access_granted";
const ACCESS_CODE = process.env.PAGE_ACCESS_CODE || process.env.NEXT_PUBLIC_PAGE_ACCESS_CODE || "7ftGiMiy";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip if cookie already present
  const hasAccess = request.cookies.get(ACCESS_COOKIE_NAME)?.value === "true";
  if (hasAccess) {
    return NextResponse.next();
  }

  // Safety: allow any file requests with an extension to go through
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  // If user is submitting code via URL (fallback), allow quick unlock
  if (pathname === "/coming-soon" || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Always redirect to coming-soon if not unlocked
  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  const redirectTarget = `${pathname}${search || ""}`;
  url.searchParams.set("redirect", redirectTarget);
  // Provide hint whether code is configured; if empty, no lock
  if (!ACCESS_CODE) {
    return NextResponse.next();
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all paths except: _next assets, API routes, coming-soon page, and files with an extension
    "/((?!_next/static|_next/image|api|coming-soon|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
