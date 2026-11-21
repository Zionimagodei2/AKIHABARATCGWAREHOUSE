import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const SCRYPT_PREFIX = "scrypt";
const KEY_LENGTH = 64;

/** Hash a password with scrypt and a fresh per-user salt. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${SCRYPT_PREFIX}:${salt}:${derived.toString("hex")}`;
}

export function isScryptHash(stored: unknown): boolean {
  return typeof stored === "string" && stored.startsWith(`${SCRYPT_PREFIX}:`);
}

export function isLegacySha256Hash(stored: unknown): boolean {
  return typeof stored === "string" && /^[a-f0-9]{64}$/i.test(stored);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

/** Verify a password against a scrypt hash or a legacy unsalted SHA-256 hex digest. */
export async function verifyPassword(password: string, storedValue: unknown): Promise<boolean> {
  if (typeof storedValue !== "string" || !storedValue) return false;
  const stored: string = storedValue;

  if (isScryptHash(stored)) {
    const [, salt, expectedHex] = stored.split(":");
    if (!salt || !expectedHex) return false;
    const derived = await scrypt(password, salt, KEY_LENGTH);
    return timingSafeEqualHex(derived.toString("hex"), expectedHex);
  }

  if (isLegacySha256Hash(stored)) {
    const digest = crypto.createHash("sha256").update(password).digest("hex");
    return timingSafeEqualHex(digest, stored.toLowerCase());
  }

  return false;
}
