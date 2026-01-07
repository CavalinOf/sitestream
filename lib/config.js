import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

export function readConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeConfig(nextConfig) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // backup simples
  if (fs.existsSync(CONFIG_PATH)) {
    const bak = CONFIG_PATH + ".bak";
    try { fs.copyFileSync(CONFIG_PATH, bak); } catch {}
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(nextConfig, null, 2), "utf-8");
}
