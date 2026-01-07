import { getInviteCode } from "../../../lib/discordUtils";

export default async function handler(req, res) {
  const inviteUrl = String(req.query.i || "");
  const code = getInviteCode(inviteUrl);
  if (!code) return res.status(200).json({ memberCount: null, onlineCount: null });

  try {
    const r = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`, { headers: { "User-Agent": "StreamerHub/1.0" } });
    if (!r.ok) throw new Error("Discord API error");
    const data = await r.json();
    return res.status(200).json({
      memberCount: data.approximate_member_count ?? null,
      onlineCount: data.approximate_presence_count ?? null,
    });
  } catch {
    return res.status(200).json({ memberCount: null, onlineCount: null });
  }
}
