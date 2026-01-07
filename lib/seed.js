import { readUsers, writeUsers, uid } from "./db";
import { hashPassword } from "./auth2";

export function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const e = String(email).trim().toLowerCase();
  const db = readUsers();
  if (db.users.some((u) => u.email === e)) return;

  const { salt, hash } = hashPassword(String(password));
  db.users.push({
    id: uid(),
    email: e,
    name: "Admin",
    role: "admin",
    salt,
    hash,
    createdAt: Date.now(),
  });
  writeUsers(db);
}
