# Hackathon Boilerplate

**Stack:** Next.js 15 (React 19) + TailwindCSS 4 + FastAPI + Postgres 17/PostGIS · Docker Compose

This repo gives you a batteries‑included dev setup with hot‑reload across frontend (Next.js), backend (FastAPI), and a Postgres 17 database with PostGIS. Everything runs in Docker, so your local Node/Python versions don’t matter.

---

## Quick Start you only need to run this one command bellow

> **Prereqs:** Install Docker Desktop (with WSL2 on Windows). No local Node/Python needed.

```bash
# from repo root
docker compose up --build
```

Open:
- **Frontend:** http://localhost:3000
- **Backend health:** http://localhost:8000/health
- **Database:** on `localhost:5432` (user `postgres`, password `postgres`, db `app`)

Stop:
```bash
docker compose down
```

## After succesful build and stop
## For development speed I recommend running /api and /db on docker only and /web on local npm run dev

> **Note:** Your host browser cannot resolve `http://api:8000` (that DNS name is only valid between containers). Use `http://localhost:8000` from your host.

---

## Repo Layout

```
/api         # FastAPI app
/db          # Postgres + PostGIS image and init SQL
/web         # Next.js app (React 19, Tailwind 4)
docker-compose.yml
```

---

## What gets built

- **db** → `hackumbc/db:17` (Postgres 17 + PostGIS 3.5) with a persistent volume `pgdata`.
- **api** → `hackumbc/api:dev` (Python 3.11‑slim), live reload enabled.
- **web** → `hackumbc/web:dev` (Node 20.18.0‑alpine), hot reload.

**Ports (default):**
- Frontend `3000` → `http://localhost:3000`
- Backend `8000` → `http://localhost:8000`
- Postgres `5432` → connect via your local tools

---

## Environment Variables

These have sensible defaults in `docker-compose.yml`, but you can override via a root‑level **`.env`** file.

**Database**
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app
POSTGRES_PORT=5432
```

**Backend**
```
BACKEND_PORT=8000
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/app
```

**Frontend**
```
FRONTEND_PORT=3000
# Used in the browser (host network):
NEXT_PUBLIC_API_URL=http://localhost:8000
# Used by Next.js server code inside the container (Docker network):
INTERNAL_API_URL=http://api:8000
```

> If you change any of these, restart with `docker compose up --build`.

---

## Day‑to‑day Dev Workflow

### Start the stack
```bash
docker compose up --build
```
- Frontend: code changes under `/web` hot‑reload.
- Backend: code changes under `/api/app` hot‑reload.

### Run commands inside containers

**Web (Next.js)**
```bash
# shell into the running web container
docker compose exec web sh
# lint
docker compose exec web npm run lint
```

**API (FastAPI)**
```bash
# shell into the running api container
docker compose exec api bash
```

**DB (psql)**
```bash
psql -h localhost -U postgres -d app  # password: postgres
```

### Adding dependencies

**Frontend packages** (preferred):
```bash
# install into the web container so our lockfile matches Node 20.18.0
docker compose exec web npm install <pkg>
# or for a one‑off when containers are stopped:
docker compose run --rm web npm install <pkg>
```
This updates `/web/package.json` and `package-lock.json` on your host via the bind mount. Rebuild if base deps changed:
```bash
docker compose up --build
```

**Backend packages**: edit `/api/requirements.txt`, then rebuild:
```bash
docker compose build api && docker compose up
```

### Resetting the database
```bash
# WARNING: deletes data volume
docker compose down -v
# then bring it back up (db will re‑init from /db/init.sql)
docker compose up --build
```

---

## Production‑like Run (no bind mounts)

We have a `prod` profile that uses optimized images and disables bind mounts. Useful for sanity checks.

```bash
# Build and run the production‑like stack
docker compose --profile prod up --build

# Stop it
docker compose --profile prod down
```

---

## Node/npm Versions (for consistency)

We run the frontend in Docker using **Node 20.18.0** and **npm 10.8.2**. If someone insists on running Node locally, use the same versions to avoid native binary mismatches:

- `.nvmrc` → `v20.18.0`
- `package.json` (already configured):
  ```json
  {
    "engines": {
      "node": "20.18.x",
      "npm": "10.x"
    }
  }
  ```
- Strong recommendation: **do not run `npm install` on the host**. Use the container (`docker compose exec web npm install`).

---

## Troubleshooting

### 1) "Cannot find module '../lightningcss.linux-x64-musl.node'"
This is a native binary from Tailwind/LightningCSS that must match the container OS. Fix:
```bash
# stop containers first
docker compose down
# remove host node_modules and lock (if they were created by a different Node/npm)
rm -rf web/node_modules web/package-lock.json
# (Windows PowerShell)
# Remove-Item -Recurse -Force .\web\node_modules
# Remove-Item -Force .\web\package-lock.json
# reinstall inside the official Node image (same as our Dockerfile)
docker run --rm -it -v "$PWD/web:/app" -w /app node:20.18.0-alpine \
  sh -lc "npm cache clean --force && npm install --no-audit --no-fund"
# then rebuild
docker compose up --build
```

### 2) Next.js says: "Found lockfile missing swc dependencies, patching..."
Run an install inside the container so SWC/native deps are downloaded for Linux:
```bash
docker compose run --rm web npm install --no-audit --no-fund
```
Then `docker compose up --build`.

### 3) I can’t open `http://api:8000` in my browser
That hostname only exists on the Docker network. From your host, use `http://localhost:8000`. Inside containers, use `http://api:8000`.

### 4) Apple Silicon (M‑series) DB image issues
If someone on Apple Silicon hits Postgres image problems, uncomment the `platform: linux/amd64` line under the `db` service in `docker-compose.yml`, then rebuild.

### 5) Ports already in use
Change `FRONTEND_PORT`/`BACKEND_PORT`/`POSTGRES_PORT` in a root `.env`, then `docker compose up --build`.

---

## Useful one‑liners

```bash
# check backend health from web container (service‑to‑service DNS)
docker compose exec web sh -lc 'wget -qO- http://api:8000/health'

# tail logs
docker compose logs -f web

# rebuild only one service
docker compose build web && docker compose up web
```

---

## FAQ

**Q: Can I run only the frontend against someone else’s API?**  
A: Yes. Set `NEXT_PUBLIC_API_URL` to that API’s URL in a `.env` and start only `web`.

**Q: How do I add a new environment variable?**  
A: Add it to `.env` and (if it’s frontend) prefix with `NEXT_PUBLIC_`. Restart containers.

**Q: Where is the seed data?**  
A: `/db/init.sql` runs on first DB init (or after `docker compose down -v`).

---

## Conventions

- Use **Docker** for everything; avoid local `npm install` and local `python` venvs.
- Commit changes to `package.json`/`package-lock.json` that were made **inside** the `web` container.
- Keep PRs small: UI in `/web`, API changes in `/api`, SQL in `/db`.

Happy hacking! 🚀

