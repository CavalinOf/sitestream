export async function getTwitchAppToken() {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const r = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
    method: "POST",
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Failed to get Twitch token");
  return data.access_token;
}

export async function twitchFetch(url, token) {
  const r = await fetch(url, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Twitch API error");
  return data;
}
