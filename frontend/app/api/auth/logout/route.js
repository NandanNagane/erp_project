import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/cookies";

const NEST_API_URL = process.env.NEST_API_URL || "http://localhost:4000";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  // Optionally tell NestJS about the logout (e.g. for future session invalidation)
  try {
    if (refreshToken) {
      await fetch(`${NEST_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
    }
  } catch {
    // NestJS logout is best-effort; continue even if it fails
  }

  // Delete both cookies
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);

  return Response.json({
    success: 1,
    message: "Logged out successfully",
  });
}
