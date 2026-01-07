import { readUsers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";
import { seedAdmin } from "../../../lib/seed";

export default function handler(req, res) {
  seedAdmin();
  const session = getSessionFromReq(req);
  if (!session?.uid) return res.status(200).json({ user: null });

  const db = readUsers();
  const user = db.users.find((u) => u.id === session.uid);
  if (!user) return res.status(200).json({ user: null });

  return res.status(200).json({ user: { id: user.id, role: user.role, streamerId: user.streamerId || null, email: user.email, name: user.name || "" } });
}