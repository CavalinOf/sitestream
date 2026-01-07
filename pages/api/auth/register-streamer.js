import { readUsers, writeUsers, readStreamers, writeStreamers, uid } from "../../../lib/db";
import { hashPassword } from "../../../lib/auth2";
import { seedAdmin } from "../../../lib/seed";

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function handler(req, res) {
  seedAdmin();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, displayName, twitchUsername } = req.body || {};
  if (!email || !password || !displayName || !twitchUsername) return res.status(400).json({ error: "Dados inválidos" });

  const e = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ error: "Email inválido" });
  if (String(password).length < 6) return res.status(400).json({ error: "Senha muito curta" });

  const usersDb = readUsers();
  if (usersDb.users.some((u) => u.email === e)) return res.status(409).json({ error: "Email já cadastrado" });

  const streamDb = readStreamers();
  const slug = slugify(displayName) || "streamer";
  let finalSlug = slug;
  let n = 2;
  while (streamDb.streamers.some((s) => s.slug === finalSlug)) {
    finalSlug = `${slug}-${n++}`;
  }

  const { salt, hash } = hashPassword(String(password));
  const userId = uid();
  const streamerId = uid();

  usersDb.users.push({ id: userId, email: e, name: displayName, role: "streamer", streamerId, salt, hash, createdAt: Date.now() });

  streamDb.streamers.push({
    id: streamerId,
    ownerUserId: userId,
    slug: finalSlug,
    displayName,
    tagline: "",
    avatarUrl: "",
    backgroundUrl: "",
    backgroundBlurPx: 18,
    backgroundDim: 0.55,
    twitchUsername,
    discordInviteUrl: "",
    youtubeChannelUrl: "",
    socials: [
      { label: "Instagram", url: "", enabled: false },
      { label: "TikTok", url: "", enabled: false },
      { label: "X", url: "", enabled: false },
    ],
    theme: { accent: "#8b5cf6" },
    createdAt: Date.now(),
  });

  writeUsers(usersDb);
  writeStreamers(streamDb);
  return res.status(200).json({ ok: true, slug: finalSlug });
}