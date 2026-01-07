import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson(file, fallback) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJson(file, data) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
}

export function readUsers() { return readJson("users.json", { users: [] }); }
export function writeUsers(db) { return writeJson("users.json", db); }

export function readStreamers() { return readJson("streamers.json", { streamers: [] }); }
export function writeStreamers(db) { return writeJson("streamers.json", db); }

export function readFollows() { return readJson("follows.json", { follows: [] }); }
export function writeFollows(db) { return writeJson("follows.json", db); }

export function uid() { return crypto.randomUUID(); }
