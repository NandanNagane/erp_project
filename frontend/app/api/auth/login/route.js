import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  baseCookieOptions,
} from "@/lib/cookies";

const NEST_API_URL = process.env.NEST_API_URL || "http://localhost:4000";

export async function POST(request) {
  const body = await request.json();

  const res = await fetch(`${NEST_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.success !== 1) {
    return Response.json(data, { status: res.status });
  }

  const {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  } = data.data;

  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    expires: new Date(accessTokenExpiresAt),
  });

  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE, refreshToken, {
      ...baseCookieOptions,
      expires: new Date(refreshTokenExpiresAt),
    });
  } else {
    cookieStore.delete(REFRESH_COOKIE);
  }

  return Response.json({
    success: 1,
    message: "Logged in successfully",
  });
}
