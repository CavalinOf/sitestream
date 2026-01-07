import { readStreamers, readFollows } from "../../../lib/db";

export default function handler(req, res) {
  const { slug } = req.query;
  const db = readStreamers();
  const s = db.streamers.find((x) => x.slug === slug);
  if (!s) return res.status(404).json({ error: "Not found" });

  const fdb = readFollows();
  const followersSite = fdb.follows.filter((f) => f.streamerId === s.id).length;

  return res.status(200).json({ streamer: { ...s, followersSite } });
}
