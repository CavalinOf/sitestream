export default async function handler(req, res) {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const key = process.env.YOUTUBE_API_KEY;
    if (!channelId || !key) return res.status(400).json({ error: "YouTube env not set" });

    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(
        channelId
      )}&key=${encodeURIComponent(key)}`,
      { cache: "no-store" }
    );

    const data = await r.json();
    const stats = data.items?.[0]?.statistics;

    res.status(200).json({
      youtubeSubscribers: stats?.subscriberCount ? Number(stats.subscriberCount) : null,
      youtubeViews: stats?.viewCount ? Number(stats.viewCount) : null,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch YouTube stats" });
  }
}
