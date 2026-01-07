import { useEffect, useState } from "react";

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <div className="label">{label} {hint ? <span className="hint">{hint}</span> : null}</div>
      <div className="control">{children}</div>
      <style jsx>{`
        .field { display:grid; gap:8px; }
        .label { font-size:13px; opacity:0.9; }
        .hint { margin-left:8px; opacity:0.65; font-size:12px; }
      `}</style>
    </div>
  );
}

async function upload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Upload falhou");
  return data.url;
}

function Followers(){
  const [data,setData]=useState(null);
  const [err,setErr]=useState('');
  useEffect(()=>{ fetch('/api/streamers/followers').then(r=>r.json()).then(d=>{ if(d.error) setErr(d.error); else setData(d); }); },[]);
  if(err) return <div className="hint">❌ {err}</div>;
  if(!data) return <div className="hint">Carregando…</div>;
  return (
    <div className="followers">
      <div className="count"><b>{data.count}</b> seguidores</div>
      <div className="list">
        {data.followers.length===0 ? <div className="hint">Nenhum seguidor ainda.</div> : data.followers.map((f)=> (
          <div key={f.id} className="rowF">
            <div className="nameF">{f.name || 'Usuário'}</div>
            <div className="mailF">{f.email}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .followers{display:grid; gap:10px;}
        .count{opacity:0.9;}
        .list{display:grid; gap:8px;}
        .rowF{display:flex; justify-content:space-between; gap:12px; padding:10px 12px; border-radius:16px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.04);}
        .mailF{opacity:0.7; font-size:13px;}
      `}</style>
    </div>
  );
}

export default function Admin() {
  const [me, setMe] = useState(null);
  const [streamer, setStreamer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const m = await fetch("/api/auth/me").then(r=>r.json());
      if (!m.user) { window.location.href="/login"; return; }
      if (m.user.role !== "streamer") { window.location.href="/"; return; }
      setMe(m.user);
      const s = await fetch("/api/streamers/by-me").then(r=>r.json());
      setStreamer(s.streamer);
    })();
  }, []);

  function update(path, value) {
    setStreamer((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let cur = next;
      for (let i=0;i<parts.length-1;i++) cur = cur[parts[i]];
      cur[parts[parts.length-1]] = value;
      return next;
    });
  }

  async function save() {
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/streamers/update", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(streamer),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Erro");
      setMsg("✅ Salvo!");
    } catch(e) {
      setMsg("❌ " + e.message);
    } finally { setSaving(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method:"POST" });
    window.location.href="/login";
  }

  if (!streamer) return <div style={{padding:24, color:"white", fontFamily:"system-ui"}}>Carregando…</div>;

  return (
    <div className="page">
      <div className="wrap">
        <header className="top">
          <div>
            <h1>Painel do Streamer</h1>
            <p>Seu link: <a href={"/s/"+streamer.slug} target="_blank" rel="noreferrer">/s/{streamer.slug}</a></p>
          </div>
          <div className="actions">
            <a className="ghost" href={"/s/"+streamer.slug} target="_blank" rel="noreferrer">Ver página</a>
            <button className="ghost" onClick={logout}>Sair</button>
          </div>
        </header>

        <section className="card">
          <h2>Perfil</h2>
          <div className="grid">
            <Field label="Nome">
              <input value={streamer.displayName} onChange={(e)=>update("displayName", e.target.value)} />
            </Field>
            <Field label="Tagline">
              <input value={streamer.tagline} onChange={(e)=>update("tagline", e.target.value)} />
            </Field>
            <Field label="Cor (accent)">
              <input value={streamer.theme.accent} onChange={(e)=>update("theme.accent", e.target.value)} />
            </Field>
          </div>

          <div className="grid" style={{marginTop:12}}>
            <Field label="Avatar (upload)">
              <input type="file" accept="image/*" onChange={async (e)=>{
                const f=e.target.files?.[0]; if(!f) return;
                const url=await upload(f); update("avatarUrl", url);
              }} />
            </Field>
            <Field label="Fundo (upload)">
              <input type="file" accept="image/*" onChange={async (e)=>{
                const f=e.target.files?.[0]; if(!f) return;
                const url=await upload(f); update("backgroundUrl", url);
              }} />
            </Field>
            <Field label="Blur do fundo (px)">
              <input type="number" value={streamer.backgroundBlurPx} onChange={(e)=>update("backgroundBlurPx", Number(e.target.value)||0)} />
            </Field>
            <Field label="Escurecer fundo (0-0.9)">
              <input type="number" step="0.05" value={streamer.backgroundDim} onChange={(e)=>update("backgroundDim", Number(e.target.value)||0)} />
            </Field>
          </div>
        </section>

        <section className="card">
          <h2>Contadores automáticos</h2>
          <div className="grid">
            <Field label="Twitch (username ou link)">
              <input value={streamer.twitchUsername} onChange={(e)=>{const v=e.target.value; const m=v.match(/twitch\.tv\/([a-zA-Z0-9_]+)/); update("twitchUsername", (m?m[1]:v).trim());}} />
            </Field>
            <Field label="Discord invite (para contar membros/online)">
              <input value={streamer.discordInviteUrl} onChange={(e)=>update("discordInviteUrl", e.target.value)} placeholder="https://discord.gg/xxxx" />
            </Field>
            <Field label="YouTube channel URL (para inscritos)">
              <input value={streamer.youtubeChannelUrl} onChange={(e)=>update("youtubeChannelUrl", e.target.value)} placeholder="https://www.youtube.com/@..." />
            </Field>
          </div>
          <p className="hint">Não existe contador manual. O site pega: Twitch seguidores + live, Discord membros/online, YouTube inscritos.</p>
        </section>

        <section className="card">
          <h2>Redes (ícones)</h2>
          <div className="grid">
            <Field label="Instagram (link)">
              <input value={streamer.socials[0].url} onChange={(e)=>{ const v=e.target.value; setStreamer(p=>{const n=structuredClone(p); n.socials[0].url=v; n.socials[0].enabled=!!v; return n;}); }} />
            </Field>
            <Field label="TikTok (link)">
              <input value={streamer.socials[1].url} onChange={(e)=>{ const v=e.target.value; setStreamer(p=>{const n=structuredClone(p); n.socials[1].url=v; n.socials[1].enabled=!!v; return n;}); }} />
            </Field>
            <Field label="X (link)">
              <input value={streamer.socials[2].url} onChange={(e)=>{ const v=e.target.value; setStreamer(p=>{const n=structuredClone(p); n.socials[2].url=v; n.socials[2].enabled=!!v; return n;}); }} />
            </Field>
          </div>
        </section>


        <section className="card">
          <h2>Seguidores do site</h2>
          <p className="hint">Lista de usuários que seguem você dentro desta plataforma.</p>
          <Followers />
        </section>

        <div className="bar">
          <button disabled={saving} onClick={save}>{saving ? "Salvando..." : "Salvar"}</button>
          <div className="msg">{msg}</div>
        </div>
      </div>

      <style jsx>{`
        .page { min-height:100vh; padding:26px 16px; background:#05050a; color:#fff; font-family:system-ui; }
        .wrap { max-width:1040px; margin:0 auto; display:grid; gap:14px; }
        .top { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); }
        a { color:#fff; }
        .actions { display:flex; gap:10px; align-items:center; }
        .ghost { padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color:#fff; cursor:pointer; text-decoration:none; }
        .card { padding:16px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); }
        h1 { margin:0; font-size:30px; }
        h2 { margin:0 0 12px; font-size:18px; }
        p { margin:6px 0 0; opacity:0.82; }
        .grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
        input { width:100%; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color:#fff; }
        .hint { margin-top:10px; font-size:13px; opacity:0.7; }
        .bar { position:sticky; bottom:14px; display:flex; gap:14px; align-items:center; padding:14px; border-radius:18px; border:1px solid rgba(255,255,255,0.14); background: rgba(20,20,28,0.72); backdrop-filter: blur(10px); }
        .bar button { padding:12px 18px; border-radius:14px; border:none; font-weight:800; cursor:pointer; background:#8b5cf6; color:#fff; }
        .bar button:disabled { opacity:0.6; cursor:not-allowed; }
        .msg { min-height:22px; }
      `}</style>
    </div>
  );
}

