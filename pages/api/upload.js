import fs from "fs";
import path from "path";
import formidable from "formidable";
import { getSessionFromReq } from "../../lib/auth2";
import { readUsers } from "../../lib/db";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = getSessionFromReq(req);
  if (!session?.uid) return res.status(401).json({ error: "Unauthorized" });

  const usersDb = readUsers();
  const me = usersDb.users.find((u) => u.id === session.uid);
  if (!me || me.role !== "streamer") return res.status(403).json({ error: "Only streamers can upload" });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir: uploadsDir, keepExtensions: true, maxFileSize: 8 * 1024 * 1024 });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Upload failed" });
    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file" });

    const f = Array.isArray(file) ? file[0] : file;
    const rel = "/uploads/" + path.basename(f.filepath);
    return res.status(200).json({ url: rel });
  });
}
