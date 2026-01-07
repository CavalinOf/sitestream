export default async function handler(req, res) {
  try {
    const guildId = process.env.DISCORD_SERVER_ID;
    if (!guildId) return res.status(400).json({ error: "Discord env not set" });

    const r = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      cache: "no-store",
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: "Discord widget not available" });

    res.status(200).json({
      discordOnline: data.presence_count ?? null,
      discordName: data.name ?? null,
      discordInvite: data.instant_invite ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch Discord stats" });
  }
}
