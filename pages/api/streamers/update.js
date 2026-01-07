import { readStreamers, writeStreamers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = getSessionFromReq(req);
  if (!session?.uid || !session.streamerId) return res.status(401).json({ error: "Unauthorized" });

  const db = readStreamers();
  const idx = db.streamers.findIndex((x) => x.id === session.streamerId);
  if (idx < 0) return res.status(404).json({ error: "Not found" });

  const incoming = req.body || {};
  // whitelist fields
  const s = db.streamers[idx];
  const allowed = [
    "displayName","tagline","avatarUrl","backgroundUrl","backgroundBlurPx","backgroundDim",
    "twitchUsername","discordInviteUrl","youtubeChannelUrl","socials","theme"
  ];
  for (const k of allowed) if (incoming[k] !== undefined) s[k] = incoming[k];

  writeStreamers(db);
  return res.status(200).json({ ok: true });
}
