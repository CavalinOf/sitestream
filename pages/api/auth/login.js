import { readUsers } from "../../../lib/db";
import { verifyPassword, signSession, setSessionCookie } from "../../../lib/auth2";
import { seedAdmin } from "../../../lib/seed";

export default function handler(req, res) {
  seedAdmin();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Dados inválidos" });

  const db = readUsers();
  const user = db.users.find((u) => u.email === String(email).trim().toLowerCase());
  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

  if (!verifyPassword(String(password), user.salt, user.hash)) return res.status(401).json({ error: "Credenciais inválidas" });

  const token = signSession({ uid: user.id, role: user.role, streamerId: user.streamerId || null, iat: Date.now() });
  setSessionCookie(res, token);
  return res.status(200).json({ ok: true, user: { role: user.role } });
}