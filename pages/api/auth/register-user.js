import { readUsers, writeUsers, uid } from "../../../lib/db";
import { hashPassword } from "../../../lib/auth2";
import { seedAdmin } from "../../../lib/seed";

export default function handler(req, res) {
  seedAdmin();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Dados inválidos" });

  const e = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ error: "Email inválido" });
  if (String(password).length < 6) return res.status(400).json({ error: "Senha muito curta" });

  const db = readUsers();
  if (db.users.some((u) => u.email === e)) return res.status(409).json({ error: "Email já cadastrado" });

  const { salt, hash } = hashPassword(String(password));
  db.users.push({ id: uid(), email: e, name: name || "", role: "user", salt, hash, createdAt: Date.now() });
  writeUsers(db);
  return res.status(200).json({ ok: true });
}