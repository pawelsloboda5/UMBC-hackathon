# Hackathon Boilerplate DB

This directory contains the setup for the local Postgres database, including required extensions for the project.

## Quick Start (Recommended: Docker Compose)

1. **Ensure Docker and Docker Compose are installed.**
2. In the project root, run:

   ```sh
   docker-compose up --build db
   ```
   This will start a Postgres 17 database with the `postgis` and `vector` extensions pre-installed.

- The database will be available at `localhost:5432` by default.
- Default credentials (see `docker-compose.yml`):
  - User: `postgres`
  - Password: `postgres`
  - Database: `app`

## Manual Setup (Advanced)

1. **Install Postgres 17+ locally.**
2. Install the following extensions in your database:
   - `postgis`
   - `vector` (pgvector)
3. You can use the SQL in `init.sql` to initialize your database:
   ```sh
   psql -U postgres -d app -f init.sql
   ```
4. Make sure your API's `DATABASE_URL` points to your local database (see API README).

## Files
- `Dockerfile` – Builds a Postgres image with required extensions
- `init.sql` – Initializes extensions and creates a test table

## Environment Variables
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` can be set in your environment or `.env` file for Docker Compose overrides.

---

For more details, see the project root `readme_hackathon_boilerplate_next.md`.
