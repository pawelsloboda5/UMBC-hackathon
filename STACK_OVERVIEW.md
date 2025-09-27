# Project Stack & Deployment Overview

## High-Level Summary
- **Frontend:** Next.js 15 (App Router) with React 19 and Tailwind CSS 4, running on Node 20.18 / npm 10.8.
- **Backend:** FastAPI (Python 3.11) with Uvicorn, SQLAlchemy, Psycopg 3, and Pydantic 2.
- **Database:** PostgreSQL 17 with PostGIS 3.5 and pgvector extensions.
- **Orchestration:** Docker Compose for local dev and production-like profiles, plus GitHub Actions for CI/CD and image publishing.

---

## Backend Stack (`api/`)
- **Language & Runtime:** Python 3.11 (`python:3.11-slim`).
- **Framework:** FastAPI application defined in `app/main.py` with modular routers under `app/routers`.
- **Server:** Uvicorn serves `app.main:app`; dev mode enables `--reload` for hot updates.
- **Middleware:** Global CORS middleware allowing cross-origin requests during development.
- **Persistence:** SQLAlchemy engine (`app/db.py`) configured via `DATABASE_URL` env variable (defaulting to in-network Postgres service). Health checks run `SELECT 1` for readiness.
- **Models & Schemas:**
  - `app/models.py` exposes a declarative base and a sample `Ping` table (id + msg columns).
  - `app/schemas.py` defines Pydantic DTOs (e.g., `PingOut`).
- **Dependencies:** Managed through `requirements.txt` (FastAPI, Uvicorn[standard], SQLAlchemy 2, Psycopg[binary] 3, Pydantic 2, python-dotenv).
- **Containerization:** `api/Dockerfile` installs dependencies, copies app code, and exposes port `8000`.
- **Environment:** `DATABASE_URL` configurable per environment; Compose injects defaults for local stack.

## Frontend Stack (`web/`)
- **Framework:** Next.js 15 (App Router) with React 19.
- **Styling:** Tailwind CSS 4 and @tailwindcss/postcss integration via `postcss.config.mjs`.
- **TypeScript:** Strict `tsconfig.json` with path alias `@/*` → `src/*`.
- **Health Dashboard:** `src/app/page.tsx` calls the API `/health` endpoint, switching between `INTERNAL_API_URL` (server) and `NEXT_PUBLIC_API_URL` (browser) for correct networking.
- **Scripts:** `npm run dev` (hot reload), `build`, `start`, `lint`.
- **Tooling:** ESLint 9 + Next.js config; Type checking via `npx tsc --noEmit` inside CI.
- **Dockerfile:** Multi-stage (`base`, `deps`, `dev`, `builder`, `prod`). Dev service mounts local code for hot reload; prod stage copies built assets and runs `npm run start`.
- **Engines:** Node 20.18.x and npm 10.8.x pinned in `package.json`; `.nvmrc` mirrors this for local parity if needed.

## Database Stack (`db/`)
- **Image:** Extends `postgis/postgis:17-3.5` and installs `postgresql-17-pgvector` for pgvector support.
- **Initialization:** `init.sql` enables PostGIS + pgvector and creates a `ping` table.
- **Defaults:** Credentials/ports managed through Compose env vars (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`).
- **Volumes:** Persistent data stored in the `pgdata` Docker volume; `init.sql` mounted read-only for first-run setup.

---

## Docker Compose Topology (`docker-compose.yml`)
- **Services:**
  - `db`: Builds from `db/`, exposes `5432`, health check via `pg_isready`, mounts `pgdata` and `init.sql`.
  - `api`: Builds from `api/`, depends on healthy `db`, binds `./api/app` for hot reload, exposes `8000`, runs Uvicorn with `--reload`.
  - `web`: Multi-stage build targeting `dev`, depends on `api`, binds `./web` and `web_node_modules`, exposes `3000`, runs `npm run dev`.
- **Production Profile:**
  - `api-prod` and `web-prod` rebuild without bind mounts, run optimized commands (`uvicorn` without reload, `npm run start`), and include resource limits. Activate via `docker compose --profile prod up --build`.
- **Volumes:**
  - `pgdata` for persistent Postgres data.
  - `web_node_modules` for container-managed frontend dependencies.
- **Environment Coordination:** Compose injects API/DB URLs so services use in-network hostnames (`api`, `db`), while clients use `localhost` defaults.

## CI/CD Workflows (`.github/workflows/`)
- **`ci.yml`:**
  - Frontend job: checks out repo, installs Node (from `.nvmrc`), runs `npm ci`, lint, typecheck, and build in `web/`.
  - Backend job: sets up Python 3.11, installs dependencies (`requirements.txt`), runs optional `ruff` lint, executes `pytest` if `tests/` exists.
- **`docker-publish.yml`:**
  - Triggered on `main` pushes, `v*` tags, or manual dispatch.
  - Builds and pushes GHCR images for `web` (prod target), `api`, and `db` with Docker Buildx caching, tagging `latest` and matching git refs.

---

## Directory Structure Snapshot
```
/api
  ├── app/
  │   ├── db.py
  │   ├── main.py
  │   ├── models.py
  │   ├── routers/
  │   │   └── health.py
  │   └── schemas.py
  ├── Dockerfile
  ├── README.md
  └── requirements.txt
/db
  ├── Dockerfile
  ├── README.md
  └── init.sql
/web
  ├── Dockerfile
  ├── package.json
  ├── src/app/
  │   ├── layout.tsx
  │   └── page.tsx
  └── ...
docker-compose.yml
readme_hackathon_boilerplate_next.md
```

---

## Development Workflow Highlights
- **Start Everything:** `docker compose up --build` (outputs web on `http://localhost:3000`, API on `http://localhost:8000`, DB on `localhost:5432`).
- **Iterate Quickly:**
  - Frontend and backend use bind mounts for live reload (Next.js and Uvicorn).
  - Edit dependencies inside containers (`docker compose exec web npm install <pkg>`; update `api/requirements.txt` then rebuild).
- **Database Inspection:** `psql -h localhost -U postgres -d app` (password `postgres`).
- **Reset DB:** `docker compose down -v` wipes volumes; next up replays `init.sql`.
- **Run Only Subset:** Compose services can be started individually (`docker compose up web`).

## Production Readiness Notes
- Use the `prod` profile locally to mimic production images.
- GHCR publishing ensures consistent deployment artifacts; coordinate rollout scripts or infra to pull `ghcr.io/<owner>/<repo>-<service>` images.
- Consider adding secrets management (e.g., Compose overrides or GitHub Secrets) for non-default credentials before real deployments.

---

## Next Steps & Enhancements
- **Testing:** Expand automated tests (unit/integration) for both frontend and backend; track coverage in CI.
- **Monitoring:** Enhance health endpoints with richer diagnostics or integrate observability in production environments.
- **Security:** Implement stricter CORS, auth layers, and secret management as features mature.
- **Documentation:** Keep environment setup and troubleshooting guides updated in `readme_hackathon_boilerplate_next.md` alongside this stack overview.
