import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function formatNumber(n){ if(n===null||n===undefined) return "—"; return new Intl.NumberFormat("pt-BR").format(n); }

function safeUrl(url){ try{ return new URL(url).toString(); } catch{ return "#"; } }

export default function StreamerPage(){
  const router = useRouter();
  const { slug } = router.query;

  const [streamer,setStreamer]=useState(null);
  const [twitch,setTwitch]=useState(null);
  const [yt,setYt]=useState(null);
  const [discord,setDiscord]=useState(null);
  const [me,setMe]=useState(null);
  const [followMsg,setFollowMsg]=useState("");
  const [following,setFollowing]=useState(false);

  async function loadAll(){
    const s=await fetch("/api/streamers/get?slug="+slug,{cache:"no-store"}).then(r=>r.json());
    if(!s.streamer) return;
    setStreamer(s.streamer);

    const m=await fetch("/api/auth/me").then(r=>r.json());
    setMe(m.user);
    if (m.user?.role === 'user') {
      const st = await fetch('/api/follow/status?streamerId='+s.streamer.id).then(r=>r.json());
      setFollowing(!!st.following);
    } else {
      setFollowing(false);
    }

    const [t,y,d]=await Promise.all([
      fetch("/api/twitch/stats?u="+encodeURIComponent(s.streamer.twitchUsername),{cache:"no-store"}).then(r=>r.json()),
      fetch("/api/youtube/stats?c="+encodeURIComponent(s.streamer.youtubeChannelUrl||""),{cache:"no-store"}).then(r=>r.json()),
      fetch("/api/discord/invite-stats?i="+encodeURIComponent(s.streamer.discordInviteUrl||""),{cache:"no-store"}).then(r=>r.json()),
    ]);
    setTwitch(t); setYt(y); setDiscord(d);
  }

  useEffect(()=>{
    if(!slug) return;
    loadAll();
    const it=setInterval(loadAll, 60_000);
    return ()=>clearInterval(it);
  },[slug]);

  async function toggleFollow(){
    setFollowMsg("");
    if(!me) { window.location.href="/login"; return; }
    if(me.role !== "user") { setFollowMsg("Apenas usuários podem seguir."); return; }
    try{
      const r=await fetch("/api/follow/toggle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({streamerId: streamer.id})});
      const d=await r.json(); if(!r.ok) throw new Error(d?.error||"Erro");
      await loadAll();
      const st = await fetch('/api/follow/status?streamerId='+streamer.id).then(r=>r.json());
      setFollowing(!!st.following);
    }catch(e){ setFollowMsg("❌ "+e.message); }
  }

  if(!streamer) return <div style={{padding:24,color:"white",fontFamily:"system-ui"}}>Carregando…</div>;

  const accent = streamer.theme?.accent || "#8b5cf6";
  const bgUrl = streamer.backgroundUrl || "";
  const bgBlur = Number(streamer.backgroundBlurPx ?? 18);
  const bgDim = Number(streamer.backgroundDim ?? 0.55);
  const isLive = !!twitch?.isLive;

  const iconLinks = (streamer.socials||[]).filter(s=>s.enabled && s.url);

  return (
    <div className="page" style={{"--accent": accent}}>
      {bgUrl ? <div className="bg" style={{backgroundImage:`url(${bgUrl})`, filter:`blur(${bgBlur}px)`}} /> : null}
      <div className="overlay" style={{background:`rgba(5,5,10,${bgDim})`}} />

      <div className="wrap">
        <header className="topbar">
          <a className="back" href="/">← Comunidade</a>
          <div className="right">
            <button className="follow" onClick={toggleFollow}>{following ? "Seguindo" : "Seguir"}</button>
            <a className="ghost" href="/login">Login</a>
          </div>
        </header>

        <section className="profile">
          <div className="avatar">
            <img src={streamer.avatarUrl || "/avatar-fallback.svg"} alt="" onError={(e)=>e.currentTarget.src="/avatar-fallback.svg"} />
            {isLive ? <span className="dot live" /> : <span className="dot off" />}
          </div>
          <div className="meta">
            <h1>{streamer.displayName}</h1>
            <p>{streamer.tagline}</p>
            {me ? <div className="siteFollowers">{formatNumber(streamer.followersSite)} seguidores no site</div> : <div className="siteFollowers muted">Faça login para ver os seguidores do site</div>}
            {followMsg ? <div className="fmsg">{followMsg}</div> : null}
          </div>
        </section>

        <section className="statusCard">
          <span className="pill">{isLive ? "🔴 AO VIVO (Twitch)" : "⚫ OFFLINE (Twitch)"}</span>
          {isLive && twitch?.stream?.title ? <span className="sub">{twitch.stream.title}</span> : <span className="sub">Acompanhe as redes e não perca a próxima live!</span>}
        </section>

        {isLive ? (
          <div className="player">
            <iframe
              src={`https://player.twitch.tv/?channel=${encodeURIComponent(streamer.twitchUsername)}&parent=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_DOMAIN || "localhost")}`}
              height="480"
              width="100%"
              allowFullScreen
            />
          </div>
        ) : null}

        <section className="grid">
          <a className="statLink" href={`https://twitch.tv/${encodeURIComponent(streamer.twitchUsername)}`} target="_blank" rel="noreferrer"><Stat title="Seguidores" subtitle="Twitch" value={formatNumber(twitch?.twitchFollowers)} icon="🎮" /></a>
          <a className="statLink" href={streamer.discordInviteUrl ? safeUrl(streamer.discordInviteUrl) : "#"} target="_blank" rel="noreferrer"><Stat title="Membros" subtitle="Discord" value={formatNumber(discord?.memberCount)} icon="🫂" /></a>
          <a className="statLink" href={streamer.discordInviteUrl ? safeUrl(streamer.discordInviteUrl) : "#"} target="_blank" rel="noreferrer"><Stat title="Online" subtitle="Discord" value={formatNumber(discord?.onlineCount)} icon="💬" /></a>
          <a className="statLink" href={streamer.youtubeChannelUrl ? safeUrl(streamer.youtubeChannelUrl) : "#"} target="_blank" rel="noreferrer"><Stat title="Inscritos" subtitle="YouTube" value={formatNumber(yt?.youtubeSubscribers)} icon="▶️" /></a>
        </section>

        <section className="icons">
          {iconLinks.map((s,i)=>(
            <a key={i} className="iconBtn" href={safeUrl(s.url)} target="_blank" rel="noreferrer" aria-label={s.label}>
              {s.label.includes("Insta") ? "📸" : s.label.includes("TikTok") ? "🎵" : "𝕏"}
            </a>
          ))}
        </section>

        <footer className="foot">SITE CRIADO POR DIEGO • © {new Date().getFullYear()} • Todos os direitos reservados</footer>
      </div>

      <style jsx>{`
        .page{min-height:100vh; padding:28px 16px; background:#05050a; color:#fff; font-family:system-ui; position:relative; overflow:hidden;}
        .bg{position:fixed; inset:-40px; background-size:cover; background-position:center; transform:scale(1.08); opacity:0.55; z-index:0;}
        .overlay{position:fixed; inset:0; z-index:1;}
        .wrap{max-width:1040px; margin:0 auto; position:relative; z-index:2; display:grid; gap:14px;}
        .topbar{display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); backdrop-filter:blur(10px);}
        .back{color:#fff; text-decoration:none; opacity:0.9;}
        .right{display:flex; gap:10px; align-items:center;}
        .follow{padding:10px 14px; border-radius:14px; border:none; font-weight:900; cursor:pointer; background:var(--accent); color:#fff;}
        .ghost{padding:10px 14px; border-radius:14px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); color:#fff; text-decoration:none;}
        .profile{display:flex; gap:14px; align-items:center; padding:16px; border-radius:22px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); backdrop-filter:blur(10px);}
        .avatar{width:76px; height:76px; border-radius:999px; overflow:hidden; border:2px solid rgba(255,255,255,0.14); position:relative;}
        .avatar img{width:100%; height:100%; object-fit:cover;}
        .dot{position:absolute; right:6px; bottom:6px; width:12px; height:12px; border-radius:999px; border:2px solid rgba(0,0,0,0.55);}
        .dot.live{background:#ff2d2d; box-shadow:0 0 14px rgba(255,45,45,0.7);}
        .dot.off{background:rgba(255,255,255,0.45);}
        h1{margin:0; font-size:28px;}
        .meta p{margin:6px 0 0; opacity:0.8;}
        .siteFollowers{margin-top:10px; font-weight:900; color:var(--accent);} .siteFollowers.muted{color:rgba(255,255,255,0.7); font-weight:700;}
        .fmsg{margin-top:8px; opacity:0.9;}
        .statusCard{padding:16px; border-radius:22px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); backdrop-filter:blur(10px); display:grid; gap:10px;}
        .pill{display:inline-flex; padding:10px 14px; border-radius:999px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); width:fit-content; font-weight:900;}
        .sub{opacity:0.85; font-size:14px;}
        .player{border-radius:22px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.03); box-shadow:0 12px 60px rgba(0,0,0,0.45);}
        .grid{display:grid; grid-template-columns:repeat(12,1fr); gap:14px;}
        .statLink{text-decoration:none; color:inherit; display:block;}
        .icons{display:flex; justify-content:center; gap:12px; padding:14px;}
        .iconBtn{width:46px; height:46px; display:grid; place-items:center; border-radius:16px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); text-decoration:none; color:#fff; font-size:20px;}
        .iconBtn:hover{border-color:rgba(255,255,255,0.26); transform:translateY(-1px); background:rgba(255,255,255,0.08);}
        .foot{opacity:0.7; font-size:13px; text-align:center; padding-bottom:6px;}
        @media (max-width:840px){.grid{grid-template-columns:repeat(6,1fr);} }
        @media (max-width:540px){.grid{grid-template-columns:repeat(2,1fr);} }
      `}</style>
    </div>
  );
}

function Stat({title,subtitle,value,icon}){
  return (
    <div className="card">
      <div className="meta">
        <span className="icon">{icon}</span>
        <div>
          <div className="t">{title}</div>
          <div className="s">{subtitle}</div>
        </div>
      </div>
      <div className="value">{value}</div>
      <style jsx>{`
        .card{grid-column:span 3; padding:16px; border-radius:22px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); backdrop-filter:blur(10px); box-shadow:0 10px 50px rgba(0,0,0,0.35); display:grid; gap:12px; min-height:112px;}
        .meta{display:flex; gap:10px; align-items:center;}
        .icon{width:34px; height:34px; border-radius:14px; display:grid; place-items:center; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10);}
        .t{font-size:13px; opacity:0.85;}
        .s{font-size:12px; opacity:0.65;}
        .value{font-size:34px; font-weight:900; color:var(--accent); line-height:1;}
        @media (max-width:840px){.card{grid-column:span 3;}}
        @media (max-width:540px){.card{grid-column:span 2;}}
      `}</style>
    </div>
  );
}
