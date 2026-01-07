import { useEffect, useState } from "react";

export default function AdminSystem(){
  const [me,setMe]=useState(null);
  const [streamers,setStreamers]=useState([]);
  const [msg,setMsg]=useState("");

  useEffect(()=>{(async()=>{
    const m=await fetch("/api/auth/me").then(r=>r.json());
    if(!m.user){ window.location.href="/login"; return; }
    if(m.user.role!=="admin"){ window.location.href="/"; return; }
    setMe(m.user);
    const d=await fetch("/api/admin/streamers").then(r=>r.json());
    setStreamers(d.streamers||[]);
  })();},[]);

  async function logout(){ await fetch("/api/auth/logout",{method:"POST"}); window.location.href="/login"; }

  return (
    <div className="page">
      <div className="wrap">
        <header className="top">
          <div>
            <h1>Admin Geral</h1>
            <p>Logado como <b>{me?.email||"—"}</b></p>
          </div>
          <div className="actions">
            <a className="ghost" href="/">← Site</a>
            <button className="ghost" onClick={logout}>Sair</button>
          </div>
        </header>

        <section className="card">
          <h2>Streamers cadastrados</h2>
          <div className="list">
            {streamers.map(s=>(
              <a key={s.id} className="row" href={"/s/"+s.slug} target="_blank" rel="noreferrer">
                <img src={s.avatarUrl} alt="" />
                <div className="meta">
                  <div className="n">{s.displayName}</div>
                  <div className="d">/s/{s.slug}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="msg">{msg}</div>
        </section>
      </div>

      <style jsx>{`
        .page{min-height:100vh; padding:26px 16px; background:#05050a; color:#fff; font-family:system-ui;}
        .wrap{max-width:1040px; margin:0 auto; display:grid; gap:14px;}
        .top{display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04);}
        .actions{display:flex; gap:10px; align-items:center;}
        .ghost{padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); color:#fff; cursor:pointer; text-decoration:none;}
        .card{padding:16px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04);}
        h1{margin:0; font-size:30px;}
        h2{margin:0 0 12px; font-size:18px;}
        p{margin:6px 0 0; opacity:0.82;}
        .list{display:grid; gap:10px;}
        .row{display:flex; gap:12px; align-items:center; padding:12px; border-radius:18px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.04); text-decoration:none; color:#fff;}
        .row img{width:46px; height:46px; border-radius:14px; object-fit:cover;}
        .d{opacity:0.7; font-size:13px;}
      `}</style>
    </div>
  );
}
