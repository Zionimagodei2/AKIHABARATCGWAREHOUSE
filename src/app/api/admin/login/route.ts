import { NextResponse, NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  getConfiguredAdminEmail,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured on the server" }, { status: 500 });
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const configuredEmail = getConfiguredAdminEmail();
  const token = createAdminSessionToken(configuredEmail);
  if (!token) {
    return NextResponse.json({ error: "Admin login is not configured on the server" }, { status: 500 });
  }

  const res = NextResponse.json({
    id: "admin-local",
    email: configuredEmail,
    name: "Admin",
    role: "admin",
  });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
