// proxy.js – Next.js 16 Proxy (replaces middleware.js)
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./lib/cookies";

export function proxy(request) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login";
  const isProtected = pathname.startsWith("/dashboard");

  // No tokens + protected route → redirect to login
  if (!accessToken && !refreshToken && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Has tokens + auth page → redirect to dashboard
  if ((accessToken || refreshToken) && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
