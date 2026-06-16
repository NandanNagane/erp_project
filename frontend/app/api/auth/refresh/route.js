import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, baseCookieOptions } from "@/lib/cookies";

const NEST_API_URL = process.env.NEST_API_URL || "http://localhost:4000";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return Response.json(
      { success: 0, message: "Refresh token missing" },
      { status: 401 }
    );
  }

  const res = await fetch(`${NEST_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  const data = await res.json();

  if (!res.ok || data.success !== 1) {
    // Refresh failed — clear cookies and force re-login
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
    return Response.json(data, { status: res.status });
  }

  const { accessToken, refreshToken: newRefreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = data.data;

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    expires: new Date(accessTokenExpiresAt),
  });

  if (newRefreshToken) {
    cookieStore.set(REFRESH_COOKIE, newRefreshToken, {
      ...baseCookieOptions,
      path: "/api/auth/refresh",
      expires: new Date(refreshTokenExpiresAt),
    });
  }

  return Response.json({ success: 1, message: "Token refreshed" });
}
