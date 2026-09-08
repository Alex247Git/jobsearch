# 🐳 Docker Setup (5 λεπτά)

## Γρήγορη έναρξη

```bash
# 1. Κλόναρε το repo
git clone https://github.com/Alex247Git/jobsearch.git
cd jobsearch

# 2. (Προαιρετικό) το δικό σου .env — χωρίς .env δουλεύει με dev defaults
cp .env.example .env     # μπορείς και να το παραλείψεις για αρχή

# 3. Χτίσε και σήκωσε όλο το stack (πρώτο build: ~3-5 λεπτά, ~500MB)
docker compose up --build

# 4. Άνοιξε τον browser
http://localhost:3000
```

> Θες και το **Adminer** (GUI για τη βάση); Τρέξε με
> `docker compose --profile dev up --build` → http://localhost:8080

**Σταμάτησε / ξανασήκωσε** όταν χρειαστεί: `docker compose down` · `docker compose up -d`

## ✅ Προαπαιτούμενα

- **Docker ≥ 20.10** + **Docker Compose v2.24+** (`docker compose version`)
  - το compose χρησιμοποιεί `depends_on: condition: service_healthy` και (στο prod overlay) `!reset` — το legacy Compose v1 δεν δουλεύει
- Linux / macOS / Windows (WSL2 ή Docker Desktop), 64-bit
- Ελεύθερες πόρτες: **3000**, **5000**, **8080** και **127.0.0.1:3306**

## 🎯 Τι τρέχει

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | React + Vite, served by nginx |
| **Backend** | http://localhost:5000 | Node.js + Express |
| **MySQL** | 127.0.0.1:3306 | bound στο loopback — δεν φαίνεται έξω |
| **Adminer** | http://localhost:8080 | μόνο με `--profile dev` |

Το MySQL κάνει **seed αυτόματα** στην πρώτη εκκίνηση (`schema.sql` → `seed.sql`).

## 🔑 Demo Accounts

```
Email: maria@techcorp.gr
Password: Passw0rd!123

Email: nikos@webflow.gr
Password: Passw0rd!123

Email: eleni.cand@gmail.com
Password: Passw0rd!123
```

## ⚙️ Περιβάλλον (env vars)

Το stack τρέχει **χωρίς καμία ρύθμιση**. Για αλλαγές: `cp .env.example .env`
και επεξεργάστησε τις τιμές. Σημαντικότερες:

| Variable | Default | Σχόλιο |
|----------|---------|--------|
| `JWT_SECRET` | `dev-secret-change-me` | **Σε production πάντα** μακρύ τυχαίο (`openssl rand -hex 32`) |
| `MYSQL_ROOT_PASSWORD` | `rootpass` | άλλαξε σε production |
| `MYSQL_DATABASE` | `jobsearch` | — |
| `CORS_ORIGIN` | `http://localhost:3000` | σε production: `https://your-domain` |
| `PORT` / `WEB_PORT` / `MYSQL_PORT` | `5000` / `3000` / `3306` | αν σου τα πιάνει κάτι άλλο |

## 🔧 Troubleshooting

```bash
# Αν το frontend δεν φορτώνει
docker compose down
docker compose up --build --force-recreate

# Αν αναδημιουργήσεις ΜΟΝΟ το api (και το web σερβίρει 502):
docker compose restart web   # ο nginx κρατά την IP του api από το startup

# Αν το MySQL κολλήσει
docker compose down   # κρατάει τα data (χωρίς -v)
docker compose up -d

# Re-seed από μηδέν (ΣΒΗΝΕΙ τα data)
docker compose down -v
docker compose up -d

# Logs
docker compose logs -f [api|web|mysql]
```

## 📦 Production (TLS + ασφαλή secrets)

Το **production overlay** (`docker-compose.prod.yml` — τρέχει **επάνω** από το
βασικό file):

1. **Απαιτεί** ισχυρά secrets — αποτυχάνει στην εκκίνηση αν λείπουν (δε
   λειτουργεί με τα dev defaults)
2. **Κλειδώνει το MySQL** — zero host ports, μόνο το compose network
3. **Βάζει Caddy μπροστά**: αυτόματο **Let's Encrypt TLS** στο 443 με
   auto-renew (HTTP/2 & HTTP/3) — το nginx (web:80) μένει εσωτερικά

```bash
# 1. .env με production τιμές
JWT_SECRET=$(openssl rand -hex 32)
MYSQL_ROOT_PASSWORD=<ισχυρό password>
MYSQL_DATABASE=jobsearch
CORS_ORIGIN=https://jobs.example.com
DOMAIN=jobs.example.com              # χωρίς https://

# 2. DNS: A/AAAA record για το DOMAIN → server
# 3. Άνοιξε τα 80 + 443 στο firewall
# 4. Εκκίνηση
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Σε λίγα δευτερόλεπτα το `https://jobs.example.com` σερβίρει το site με έγκυρο
certificate — και το Caddy το ανανεώνει μόνο του. Θες email ειδοποιήσεων για τα
certificates; Πρόσθεσε `email you@example.com` στην πρώτη γραμμή του
`deploy/Caddyfile`.

> Τα credentials **δεν υπάρχουν πλέον** μέσα στο `docker-compose.yml` — όλα
> έρχονται από `.env` (gitignored) ή χρησιμοποιούν dev defaults μόνο εκτός
> production.
