import { readStreamers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";

export default function handler(req, res) {
  const session = getSessionFromReq(req);
  if (!session?.uid || !session.streamerId) return res.status(401).json({ error: "Unauthorized" });

  const db = readStreamers();
  const s = db.streamers.find((x) => x.id === session.streamerId);
  if (!s) return res.status(404).json({ error: "Not found" });

  return res.status(200).json({ streamer: s });
}
