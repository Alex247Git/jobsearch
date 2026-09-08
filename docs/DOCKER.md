# 🐳 Docker Guide

Run the **full JobSearch stack** (frontend + backend + MySQL + Adminer) with a single command — works on **Docker** and **Podman** (rootless).

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/Alex247Git/jobsearch.git
cd jobsearch

# 2. (Optional) your own .env — without one, dev defaults work fine
cp .env.example .env     # can be skipped to get started

# 3. Build & start the whole stack (first build: ~3-5 min, ~500MB)
docker compose up --build

# 4. Open the browser
http://localhost:3000
```

> Want the **Adminer** DB GUI too? Run with
> `docker compose --profile dev up --build` → http://localhost:8080

**Stop / restart**: `docker compose down` · `docker compose up -d`

## ✅ Prerequisites

- **Docker ≥ 20.10** + **Docker Compose v2.24+** (`docker compose version`)
  - the compose file uses `depends_on: condition: service_healthy` and (in the prod overlay) `!reset` — legacy Compose v1 does not work
- Linux / macOS / Windows (WSL2 or Docker Desktop), 64-bit
- Free ports: **3000**, **5000**, **8080** and **127.0.0.1:3306**

## 🎯 What runs where

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | React + Vite, served by nginx |
| **Backend** | http://localhost:5000 | Node.js + Express |
| **MySQL** | 127.0.0.1:3306 | bound to loopback — not reachable from outside |
| **Adminer** | http://localhost:8080 | only with `--profile dev` |

MySQL seeds itself automatically on first start (`schema.sql` → `seed.sql`).

## 🔑 Demo Accounts

```
Email: maria@techcorp.gr
Password: Passw0rd!123

Email: nikos@webflow.gr
Password: Passw0rd!123

Email: eleni.cand@gmail.com
Password: Passw0rd!123
```

## ⚙️ Environment variables

The stack runs **with zero configuration**. To tweak: `cp .env.example .env`
and edit the values. Most important ones:

| Variable | Default | Notes |
|----------|---------|-------|
| `JWT_SECRET` | `dev-secret-change-me` | **Always** a long random string in production (`openssl rand -hex 32`) |
| `MYSQL_ROOT_PASSWORD` | `rootpass` | change in production |
| `MYSQL_DATABASE` | `jobsearch` | — |
| `CORS_ORIGIN` | `http://localhost:3000` | in production: `https://your-domain` |
| `PORT` / `WEB_PORT` / `MYSQL_PORT` | `5000` / `3000` / `3306` | if something else is already on those ports |

## 🔧 Troubleshooting

```bash
# Frontend not loading
docker compose down
docker compose up --build --force-recreate

# If you recreated ONLY the api container (and web returns 502):
docker compose restart web   # nginx caches the api IP at startup

# MySQL stuck
docker compose down   # keeps the data (no -v)
docker compose up -d

# Re-seed from scratch (DESTROYS the data)
docker compose down -v
docker compose up -d

# Logs
docker compose logs -f [api|web|mysql]
```

## 📦 Production (TLS + secure secrets)

The **production overlay** (`docker-compose.prod.yml` — applied **on top of** the
base file):

1. **Requires** strong secrets — fails at startup if they're missing (never
   runs with dev defaults)
2. **Locks down MySQL** — zero host ports, compose network only
3. **Puts Caddy in front**: automatic **Let's Encrypt** TLS on 443 with
   auto-renew (HTTP/2 & HTTP/3) — nginx (web:80) stays internal

```bash
# 1. .env with production values
JWT_SECRET=$(openssl rand -hex 32)
MYSQL_ROOT_PASSWORD=<strong password>
MYSQL_DATABASE=jobsearch
CORS_ORIGIN=https://jobs.example.com
DOMAIN=jobs.example.com              # without https://

# 2. DNS: A/AAAA record for DOMAIN → server
# 3. Open ports 80 + 443 in the firewall
# 4. Start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Within seconds `https://jobs.example.com` serves the site with a valid
certificate — and Caddy renews it automatically. Want certificate expiry
notifications by email? Add `email you@example.com` as the first line of
`deploy/Caddyfile`.

> Credentials are **no longer hardcoded** in `docker-compose.yml` — everything
> comes from `.env` (gitignored), or falls back to dev defaults outside
> production.