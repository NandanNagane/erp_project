// lib/api/serverFetch.js
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "../cookies";

const NEST_API_URL = process.env.NEST_API_URL || "http://localhost:4000";

/**
 * Server-side fetch utility for Server Components and Server Actions.
 * Reads the access-token cookie and forwards it as a Bearer token to NestJS.
 *
 * @param {string} path  - NestJS API path (e.g. "/user/list")
 * @param {RequestInit} options - Optional fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function serverFetch(path, options = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${process.env.NEST_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  return res.json();
}
