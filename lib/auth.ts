import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "kat_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function adminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set. Copy .env.example to .env.local and set it.");
  return password;
}

function sign(payload: string) {
  const secret = process.env.SESSION_SECRET || adminPassword();
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(password: string) {
  return safeEqual(password, adminPassword());
}

export async function startSession() {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) * 1000 < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
