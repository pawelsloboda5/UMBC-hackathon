# Hackathon Boilerplate API

This directory contains the FastAPI backend for the project. You can run the API locally using Docker Compose (recommended) or manually with Python.

## Quick Start (Recommended: Docker Compose)

1. **Ensure Docker and Docker Compose are installed.**
2. In the project root, run:

   ```sh
   docker-compose up --build api db
   ```
   This will start both the API server and the Postgres database with all required extensions.

3. The API will be available at [http://localhost:8000](http://localhost:8000)

- Health check: [http://localhost:8000/health](http://localhost:8000/health)

## Manual Python Setup (Advanced)

1. **Install Python 3.11+**
2. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Start the API server:
   ```sh
   uvicorn app.main:app --reload
   ```

## Environment Variables
- `DATABASE_URL` (optional): Postgres connection string. Defaults to `postgresql+psycopg://postgres:postgres@db:5432/app`.

## Project Structure
- `app/` – FastAPI app code
- `requirements.txt` – Python dependencies
- `Dockerfile` – Container build for API

---

For more details, see the project root `readme_hackathon_boilerplate_next.md`.
