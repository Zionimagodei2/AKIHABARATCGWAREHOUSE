import crypto from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "aki_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

interface AdminSessionPayload {
  email: string;
  role: "admin";
  exp: number;
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  const left = crypto.createHash("sha256").update(a).digest();
  const right = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

export function getConfiguredAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getConfiguredAdminEmail() && process.env.ADMIN_PASSWORD);
}

/**
 * Signing key for admin session tokens. Uses ADMIN_SESSION_SECRET when set;
 * otherwise derives a key from ADMIN_PASSWORD with scrypt (salted with the
 * configured admin email from the environment). No secret material is ever
 * taken from a string written in source.
 */
function getSigningKey(): Buffer | null {
  if (process.env.ADMIN_SESSION_SECRET) {
    return crypto.createHash("sha256").update(process.env.ADMIN_SESSION_SECRET).digest();
  }
  const password = process.env.ADMIN_PASSWORD;
  const email = getConfiguredAdminEmail();
  if (!password || !email) return null;
  return crypto.scryptSync(password, `akihabara-admin-session:${email}`, 32);
}

function sign(payloadB64: string, key: Buffer): string {
  return crypto.createHmac("sha256", key).update(payloadB64).digest("base64url");
}

export function createAdminSessionToken(email: string): string | null {
  const key = getSigningKey();
  if (!key) return null;
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64, key)}`;
}

export function verifyAdminSessionToken(token: string | null | undefined): AdminSessionPayload | null {
  if (!token) return null;
  const key = getSigningKey();
  if (!key) return null;

  const [payloadB64, signature, extra] = token.split(".");
  if (!payloadB64 || !signature || extra) return null;
  if (!timingSafeStringEqual(signature, sign(payloadB64, key))) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as AdminSessionPayload;
    if (payload.role !== "admin") return null;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    const configuredEmail = getConfiguredAdminEmail();
    if (!configuredEmail || !timingSafeStringEqual(payload.email || "", configuredEmail)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSession(req: NextRequest): AdminSessionPayload | null {
  return verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export function isAdminRequest(req: NextRequest): boolean {
  return getAdminSession(req) !== null;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const configuredEmail = getConfiguredAdminEmail();
  const configuredPassword = process.env.ADMIN_PASSWORD || "";
  if (!configuredEmail || !configuredPassword) return false;
  const emailOk = timingSafeStringEqual(email.trim().toLowerCase(), configuredEmail);
  const passwordOk = timingSafeStringEqual(password, configuredPassword);
  return emailOk && passwordOk;
}
