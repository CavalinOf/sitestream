import { useEffect, useState } from "react";

export default function Home() {
  const [streamers, setStreamers] = useState([]);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [followMap, setFollowMap] = useState({});

  async function refresh() {
    const meRes = await fetch("/api/auth/me").then((r) => r.json());
    setMe(meRes.user);

    const d = await fetch("/api/streamers/list").then((r) => r.json());
    setStreamers(d.streamers || []);

    if (meRes.user?.role === "user") {
      const statuses = await Promise.all(
        (d.streamers || []).map(async (s) => {
          const st = await fetch("/api/follow/status?streamerId=" + s.id).then((r) => r.json());
          return [s.id, !!st.following];
        })
      );
      setFollowMap(Object.fromEntries(statuses));
    } else {
      setFollowMap({});
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleFollow(streamerId) {
    if (!me) {
      window.location.href = "/login";
      return;
    }
    if (me.role !== "user") return;

    await fetch("/api/follow/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamerId }),
    });
    const st = await fetch("/api/follow/status?streamerId=" + streamerId).then((r) => r.json());
    setFollowMap((p) => ({ ...p, [streamerId]: !!st.following }));
    // refresh follower counts
    const d = await fetch("/api/streamers/list").then((r) => r.json());
    setStreamers(d.streamers || []);
  }

  return (
    <div className="page">
      <aside className="side">
        <div className="logo">StreamerHub</div>
        <button className="nav" onClick={() => setOpen(true)}>
          👥 Comunidade
        </button>
        {me?.role === "admin" ? (
          <a className="nav" href="/admin-system">
            🛠️ Admin Geral
          </a>
        ) : null}
        <a className="nav" href="/login">
          🔐 Login
        </a>
      </aside>

      <main className="main">
        <div className="hero">
          <h1>Comunidade de Streamers</h1>
          <p>Entre e siga seus streamers favoritos. Cada streamer tem sua página com contadores automáticos.</p>
          <div className="cta">
            <a className="btn" href="/register-streamer">
              Registrar Streamer
            </a>
            <a className="btn ghost" href="/register-user">
              Registrar Usuário
            </a>
          </div>
        </div>

        <div className="grid">
          {streamers.map((s) => (
            <a key={s.id} className="card" href={"/s/" + s.slug}>
              <img src={s.avatarUrl} alt="" />
              <div className="meta">
                <div className="name">{s.displayName}</div>
                <div className="sub">{s.followersSite} seguidores no site</div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="foot">SITE CRIADO POR DIEGO • © {new Date().getFullYear()} • Todos os direitos reservados</footer>

      {open && (
        <div className="modal" onClick={() => setOpen(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="head">
              <div className="t">Comunidade</div>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="list">
              {streamers.map((s) => (
                <a key={s.id} href={"/s/" + s.slug} className="row">
                  <img src={s.avatarUrl} alt="" />
                  <div className="meta">
                    <div className="n">{s.displayName}</div>
                    <div className="d">{s.followersSite} seguidores</div>

                    <div className="icons">
                      {(s.socials || []).slice(0, 3).map((x, idx) => (
                        <a
                          key={idx}
                          className="ic"
                          href={x.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={x.label}
                        >
                          {x.label.includes("Insta") ? "📸" : x.label.includes("TikTok") ? "🎵" : "𝕏"}
                        </a>
                      ))}
                    </div>
                  </div>

                  {me?.role === "user" ? (
                    <button
                      className={"followBtn " + (followMap[s.id] ? "on" : "")}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFollow(s.id);
                      }}
                    >
                      {followMap[s.id] ? "Seguindo" : "Seguir"}
                    </button>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 240px 1fr;
          grid-template-rows: 1fr auto;
          background: #05050a;
          color: #fff;
          font-family: system-ui;
        }
        .side {
          padding: 18px;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          grid-row: 1 / span 2;
        }
        .logo {
          font-weight: 900;
          font-size: 18px;
          margin-bottom: 14px;
        }
        .nav {
          width: 100%;
          text-align: left;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          cursor: pointer;
          margin-bottom: 10px;
          text-decoration: none;
          display: block;
        }
        .main {
          padding: 26px 18px;
        }
        .hero {
          max-width: 860px;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.04);
        }
        h1 {
          margin: 0;
          font-size: 34px;
        }
        p {
          margin: 10px 0 0;
          opacity: 0.8;
        }
        .cta {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          text-decoration: none;
          color: #fff;
          background: #8b5cf6;
          font-weight: 800;
        }
        .ghost {
          background: rgba(255, 255, 255, 0.06);
        }
        .grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .card {
          padding: 14px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          text-decoration: none;
          color: #fff;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .card img {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          object-fit: cover;
        }
        .name {
          font-weight: 900;
        }
        .sub {
          opacity: 0.7;
          font-size: 13px;
        }

        .foot {
          padding: 14px;
          text-align: center;
          opacity: 0.7;
          font-size: 13px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: grid;
          place-items: center;
          padding: 18px;
        }
        .panel {
          width: 100%;
          max-width: 560px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(20, 20, 28, 0.92);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }
        .head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
        }
        .head .t {
          font-weight: 900;
        }
        .head button {
          border: none;
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          border-radius: 12px;
          padding: 8px 10px;
          cursor: pointer;
        }
        .list {
          padding: 10px;
          display: grid;
          gap: 8px;
          max-height: 60vh;
          overflow: auto;
        }
        .row {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.04);
          text-decoration: none;
          color: #fff;
        }
        .row img {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          object-fit: cover;
        }
        .meta {
          display: grid;
          gap: 2px;
        }
        .d {
          opacity: 0.7;
          font-size: 13px;
        }
        .icons {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }
        .ic {
          width: 26px;
          height: 26px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          text-decoration: none;
          color: #fff;
          font-size: 14px;
        }
        .followBtn {
          margin-left: auto;
          padding: 10px 12px;
          border-radius: 14px;
          border: none;
          font-weight: 900;
          cursor: pointer;
          background: #8b5cf6;
          color: #fff;
        }
        .followBtn.on {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        @media (max-width: 720px) {
          .page {
            grid-template-columns: 1fr;
          }
          .side {
            grid-row: auto;
            position: sticky;
            top: 0;
            display: flex;
            gap: 10px;
            align-items: center;
            z-index: 5;
          }
          .nav {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
