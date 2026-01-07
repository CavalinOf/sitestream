import { readFollows, readUsers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";

function maskEmail(email) {
  const [u, d] = String(email).split("@");
  if (!d) return email;
  const left = u.slice(0, 2);
  return `${left}***@${d}`;
}

export default function handler(req, res) {
  const session = getSessionFromReq(req);
  if (!session?.uid || !session.streamerId) return res.status(401).json({ error: "Unauthorized" });

  const usersDb = readUsers();
  const me = usersDb.users.find((u) => u.id === session.uid);
  if (!me || me.role !== "streamer") return res.status(403).json({ error: "Forbidden" });

  const followsDb = readFollows();
  const followerIds = followsDb.follows.filter((f) => f.streamerId === session.streamerId).map((f) => f.userId);

  const followers = usersDb.users
    .filter((u) => followerIds.includes(u.id))
    .map((u) => ({ id: u.id, name: u.name || "", email: maskEmail(u.email) }));

  return res.status(200).json({ followers, count: followers.length });
}
