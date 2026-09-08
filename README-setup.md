# 🐳 Docker Setup (5 λεπτά)

## Γρήγορη έναρξη

```bash
# 1. Κλόναρε το repo
git clone https://github.com/Alex247Git/jobsearch.git
cd jobsearch

# 2. Εκτέλεσε ένα μόνο command
docker compose up --build

# 3. Άνοιξε το browser σου
http://localhost:3000
```

Το πρώτο build παίρνει ~3-5 λεπτά (καμιά στιγμή ~500MB packages).

## ✅ Προαπαιτούμενα

- **Docker Engine ≥ 20.10** με **Docker Compose v2** (`docker compose version`) — το compose file χρησιμοποιεί `depends_on: condition: service_healthy` που δεν υποστηρίζεται στο legacy Compose v1
- Linux / macOS / Windows (Docker Desktop ή WSL2), 64-bit
- Ελεύθερες πόρτες: **3000**, **5000**, **3306**, **8080** (MySQL κοινό default port)
- Το MySQL κάνει seed μόνο στο **πρώτο** `up` (persistent volume `mysql_data`) — για re-seed από νέο: `docker compose down -v && docker compose up -d`

## 🎯 Τι περιλαμβάνεται

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React + Vite (served by nginx) |
| **Backend** | http://localhost:5000 | Node.js + Express |
| **Database** | localhost:3306 | MySQL 8 |
| **Adminer** | http://localhost:8080 | Database GUI |

## 🔑 Demo Accounts

```
Email: maria@techcorp.gr
Password: Passw0rd!123

Email: nikos@webflow.gr
Password: Passw0rd!123

Email: eleni.cand@gmail.com
Password: Passw0rd!123
```

## 🗄️ Database Seed

Το demo data εισάγεται αυτόματα όταν ξεκινάει για πρώτη φορά η MySQL container.
Οι τελευταίες γραμμές δημιουργούν τους πίνακες (schema.sql) και μετά εισάγουν τα
δεδομένα (seed.sql) μέσα στον container.

```bash
# Manual re-seed (αν χρειαστεί):
docker compose exec mysql mysql -uroot -prootpass jobsearch < seed.sql
```

## 🔧 Troubleshooting

```bash
# Αν το frontend δεν φορτώνει
docker compose down
docker compose up --build --force-recreate

# Αν το MySQL δεν αρχίζει
docker compose down -v  # Deletes volume (απώλεια data)
docker compose up -d

# Logs
docker compose logs -f

# Logs για ένα συγκεκριμένο service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f mysql
```

## 📦 Production Deployment

Για deployment σε Render/Railway/Hetzner:

```bash
# Production build
docker compose -f docker-compose.yml up --build -d

# Ή με .env.production
docker compose --env-file .env.production up --build
```
