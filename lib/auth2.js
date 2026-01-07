import crypto from "crypto";

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}
function unb64url(input) {
  return Buffer.from(input, "base64url").toString("utf-8");
}

export function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 120000, 32, "sha256").toString("hex");
  return { salt: s, hash };
}
export function verifyPassword(password, salt, hash) {
  const test = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(test, "hex"), Buffer.from(hash, "hex"));
}

export function signSession(payload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function verifySession(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch { return null; }
  try { return JSON.parse(unb64url(body)); } catch { return null; }
}

export function getSessionFromReq(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1]);
}
export function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*30}; ${isProd ? "Secure;" : ""}`,
  ]);
}
export function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${isProd ? "Secure;" : ""}`,
  ]);
}
