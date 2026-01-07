import { readStreamers, readUsers } from "../../../lib/db";
import { getSessionFromReq } from "../../../lib/auth2";
import { seedAdmin } from "../../../lib/seed";

export default function handler(req,res){
  seedAdmin();
  const session=getSessionFromReq(req);
  if(!session?.uid) return res.status(401).json({error:"Unauthorized"});
  const users=readUsers();
  const me=users.users.find(u=>u.id===session.uid);
  if(!me || me.role!=="admin") return res.status(403).json({error:"Forbidden"});

  const db=readStreamers();
  return res.status(200).json({streamers: db.streamers.map(s=>({id:s.id, slug:s.slug, displayName:s.displayName, avatarUrl:s.avatarUrl||"/avatar-fallback.svg"}))});
}
