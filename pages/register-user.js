import { useState } from "react";

export default function RegisterUser() {
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true); setMsg("");
    try{
      const r=await fetch("/api/auth/register-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,name})});
      const d=await r.json(); if(!r.ok) throw new Error(d?.error||"Erro");
      setMsg("✅ Usuário criado! Agora faça login.");
    }catch(err){ setMsg("❌ "+err.message); } finally{ setLoading(false); }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Registrar Usuário</h1>
        <p>Usuários podem seguir streamers e ver os contadores.</p>
        <form onSubmit={submit} className="form">
          <input placeholder="Nome (opcional)" value={name} onChange={(e)=>setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input placeholder="Senha (mín. 6)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button disabled={loading}>{loading?"Criando...":"Criar conta"}</button>
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
