import { readStreamers, readFollows } from "../../../lib/db";

export default function handler(req, res) {
  const db = readStreamers();
  const fdb = readFollows();
  const items = db.streamers.map((s) => ({
    id: s.id,
    slug: s.slug,
    displayName: s.displayName,
    avatarUrl: s.avatarUrl || "/avatar-fallback.svg",
    followersSite: fdb.follows.filter((f) => f.streamerId === s.id).length,
    socials: (s.socials||[]).filter(x=>x.enabled && x.url),
  }));
  return res.status(200).json({ streamers: items });
}
