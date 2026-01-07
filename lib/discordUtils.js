export function getInviteCode(inviteUrl) {
  if (!inviteUrl) return "";
  try {
    const u = new URL(inviteUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    // maybe raw code
    return inviteUrl.replace(/\s/g, "");
  }
}
