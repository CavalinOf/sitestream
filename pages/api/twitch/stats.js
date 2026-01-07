import { readConfig } from "../../../lib/config";
import { getTwitchAppToken, twitchFetch } from "../../../lib/twitch";

export default async function handler(req, res) {
  try {
    const cfg = readConfig();
    const username = cfg?.twitch?.username;
    if (!username) return res.status(400).json({ error: "Twitch username not set" });

    const token = await getTwitchAppToken();

    const userData = await twitchFetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
      token
    );
    const user = userData.data?.[0];
    if (!user) return res.status(404).json({ error: "Twitch user not found" });

    const liveData = await twitchFetch(
      `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
      token
    );
    const isLive = (liveData.data?.length ?? 0) > 0;

    let followersTotal = null;
    if (cfg?.twitch?.showFollowers) {
      const followersData = await twitchFetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`,
        token
      );
      followersTotal = followersData.total ?? null;
    }

    res.status(200).json({
      isLive,
      twitchFollowers: followersTotal,
      stream: liveData.data?.[0] ?? null,
      user: {
        id: user.id,
        display_name: user.display_name,
        profile_image_url: user.profile_image_url,
        offline_image_url: user.offline_image_url,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch Twitch stats" });
  }
}
