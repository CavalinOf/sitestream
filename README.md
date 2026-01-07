# Streamer Hub (Twitch + YouTube + Discord) com Painel Admin

Este projeto é um site para streamer com:
- Links das redes sociais
- Contadores (Twitch followers, YouTube inscritos, Discord online)
- Status AO VIVO na Twitch + embed
- Painel admin para editar tudo pelo navegador (sem mexer em código)

## 1) Instalar
```bash
npm install
```

## 2) Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz:
```env
# Admin
ADMIN_PASSWORD=troque-essa-senha

# Twitch
TWITCH_CLIENT_ID=SEU_CLIENT_ID
TWITCH_CLIENT_SECRET=SEU_CLIENT_SECRET

# YouTube
YOUTUBE_API_KEY=SUA_API_KEY
YOUTUBE_CHANNEL_ID=ID_DO_CANAL

# Discord
DISCORD_SERVER_ID=ID_DO_SERVIDOR

# Produção (para embed da Twitch)
SITE_DOMAIN=localhost
```

## 3) Rodar
```bash
npm run dev
```

Abra:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Deploy (Vercel)
- Suba o projeto no GitHub
- Importe no Vercel
- Adicione as variáveis do `.env.local` no painel do Vercel
- Defina `SITE_DOMAIN` como seu domínio (ex.: meusite.com)

---

### Observações
- Twitch embed precisa do `parent` com seu domínio (SITE_DOMAIN)
- Discord "Widget" deve estar habilitado no servidor:
  Server Settings → Widget → Enable
