# OssTrack — Sua jornada no tatame

Plataforma de evolução para academias de Jiu-Jitsu. 100% gratuita.

## Pré-requisitos

- Node.js 18+
- PostgreSQL (via Neon ou local)

## Setup local

```bash
npm install
cp .env.example .env  # configure DATABASE_URL e NEXTAUTH_SECRET
npx prisma db push
npm run dev
```

Acesse http://localhost:3000

### Dados demo

```
GET /api/setup
```

| Papel | Email | Senha |
|---|---|---|
| Dono | carlos@email.com | 123456 |
| Professor | leandro@email.com | 123456 |
| Aluno | rafael@email.com | 123456 |

## Screenshots para landing page

```bash
# Com o app rodando em http://localhost:3000:
npm run capture
```

Ou contra um deploy específico:
```bash
CAPTURE_URL=https://osstrack.com.br npm run capture
```

As imagens são salvas em `public/screenshots/`.

## Pré-deploy checklist

- [ ] `NEXTAUTH_URL` configurada no Vercel (https://seu-dominio.vercel.app)
- [ ] `NEXTAUTH_SECRET` configurada no Vercel
- [ ] `DATABASE_URL` configurada no Vercel (Neon PostgreSQL)
- [ ] Rodar `GET /api/setup?force=true` no deploy inicial para popular dados demo
- [ ] Rodar `npm run capture` para gerar screenshots reais
- [ ] Verificar se o iframe `/screenshot/demo` carrega corretamente na landing page

## Rotas principais

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/cadastro` | Cadastro |
| `/login` | Login |
| `/dashboard/aluno` | Dashboard do aluno |
| `/dashboard/dono` | Dashboard do dono |
| `/dashboard/professor` | Dashboard do professor |
| `/screenshot/demo` | Aluno (para screenshot) |
| `/screenshot/demo/dono` | Dono (para screenshot) |

## Stack

- Next.js 16 (Turbopack)
- Prisma + PostgreSQL (Neon)
- NextAuth v4
- Framer Motion
- Playwright (screenshots / e2e)
