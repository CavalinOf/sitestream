import { readFollows, writeFollows, readUsers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = getSessionFromReq(req);
  if (!session?.uid) return res.status(401).json({ error: "Unauthorized" });

  const users = readUsers();
  const me = users.users.find((u) => u.id === session.uid);
  if (!me || me.role !== "user") return res.status(403).json({ error: "Only users can follow" });

  const { streamerId } = req.body || {};
  if (!streamerId) return res.status(400).json({ error: "Dados inválidos" });

  const db = readFollows();
  const idx = db.follows.findIndex((f) => f.userId === me.id && f.streamerId === streamerId);
  if (idx >= 0) db.follows.splice(idx, 1);
  else db.follows.push({ userId: me.id, streamerId, createdAt: Date.now() });

  writeFollows(db);
  return res.status(200).json({ ok: true, following: idx < 0 });
}
