import { useState } from "react";

export default function RegisterStreamer() {
  const [email,setEmail]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [twitchUsername,setTwitchUsername]=useState("");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true); setMsg("");
    try{
      const r=await fetch("/api/auth/register-streamer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,displayName,twitchUsername})});
      const d=await r.json(); if(!r.ok) throw new Error(d?.error||"Erro");
      setMsg("✅ Streamer criado! Faça login e complete seu painel.");
    }catch(err){ setMsg("❌ "+err.message); } finally{ setLoading(false); }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Registrar Streamer</h1>
        <p>Crie sua conta streamer e ganhe um painel e uma página pública.</p>
        <form onSubmit={submit} className="form">
          <input placeholder="Nome/Display" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
          <input placeholder="Twitch username (sem link)" value={twitchUsername} onChange={(e)=>setTwitchUsername(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input placeholder="Senha (mín. 6)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button disabled={loading}>{loading?"Criando...":"Criar streamer"}</button>
        </form>
        <div className="msg">{msg}</div>
        <div className="links">
          <a href="/login">Já tenho conta</a>
          <a href="/">Voltar</a>
        </div>
      </div>
      <style jsx>{`
        .page{min-height:100vh; display:grid; place-items:center; padding:20px; background:#05050a; color:#fff; font-family:system-ui;}
        .card{width:100%; max-width:460px; padding:20px; border-radius:18px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04);}
        h1{margin:0;}
        p{margin:8px 0 14px; opacity:0.8;}
        .form{display:grid; gap:10px;}
        input{width:100%; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); color:#fff;}
        button{padding:12px 14px; border-radius:12px; border:none; font-weight:800; cursor:pointer; background:#8b5cf6; color:#fff;}
        button:disabled{opacity:0.6; cursor:not-allowed;}
        .msg{margin-top:12px; min-height:22px;}
        .links{margin-top:14px; display:flex; justify-content:space-between;}
        a{color:#fff; opacity:0.85;}
      `}</style>
    </div>
  );
}
