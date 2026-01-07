import { readFollows, readUsers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";

export default function handler(req, res) {
  const session = getSessionFromReq(req);
  const streamerId = String(req.query.streamerId || "");
  if (!streamerId) return res.status(400).json({ error: "Dados inválidos" });

  if (!session?.uid) return res.status(200).json({ following: false });

  const users = readUsers();
  const me = users.users.find((u) => u.id === session.uid);
  if (!me || me.role !== "user") return res.status(200).json({ following: false });

  const db = readFollows();
  const following = db.follows.some((f) => f.userId === me.id && f.streamerId === streamerId);
  return res.status(200).json({ following });
}
