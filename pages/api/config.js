import { readConfig, writeConfig } from "../../lib/config";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(readConfig());
  }

  if (req.method === "POST") {
    const password = req.headers["x-admin-password"];
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      writeConfig(req.body);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: "Failed to write config" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
