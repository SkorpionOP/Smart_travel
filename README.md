# Smart Travel
Full-stack travel planning demo with a FastAPI backend that scrapes destination data, builds itineraries, and estimates costs, plus a Vite/React frontend that lets visitors plan and save trips.

## Architecture
- **Backend** (`backend/`) — FastAPI app with helper modules for scraping, cost estimation, recommendations, and an SQLite DB (`smart_travel.db`). The API exposes `/api/plan`, auth, quiz, and recommendation endpoints.
- **Frontend** (`frontend/`) — Vite + React (with Tailwind-style utilities) consumes the backend via `VITE_API_BASE_URL` and renders the planner, itinerary, map, and budget insights.

## Prerequisites
- **Node.js** (18+ recommended) for the frontend tooling (`npm install`, `npm run dev`).
- **Python 3.10+** for the FastAPI backend. `pip` should be available to install dependencies.

## Backend: run the API
1. `cd backend`
2. (Re)create or activate a virtual environment:
   - Windows (PowerShell): `python -m venv .venv` → `.\\.venv\\Scripts\\Activate.ps1`
   - macOS/Linux: `python -m venv .venv` → `source .venv/bin/activate`
   If `backend/venv/` already exists you can activate that instead.
3. Install dependencies: `pip install -r requirements.txt`.
4. Review `backend/.env`. Set `GEMINI_API_KEY` if you want to use Gemini; leave it empty to rely on the built-in scrapers.
5. Start the server: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.
6. Open `http://localhost:8000/docs` to see the interactive OpenAPI docs.

## Frontend: start the client
1. `cd frontend`
2. Install JavaScript dependencies: `npm install`.
3. Update `.env` (or create your own) so that `VITE_API_BASE_URL` points to the backend you started (`http://localhost:8000` for a local FastAPI server).
4. Start the dev server: `npm run dev -- --host 0.0.0.0 --port 5173`.
5. Visit `http://localhost:5173` to open the planner UI. The frontend will hit the backend at the URL you configured in `.env`.

## Useful commands
- `npm run build` — produce a production-ready frontend bundle under `frontend/dist`.
- `npm run lint` — run ESLint across the React codebase.
- Use `uvicorn main:app` without `--reload` for production deployments (or wrap with gunicorn/daphne as needed).

## Notes
- The backend ships with `smart_travel.db` seeded with minimal data, and `planner.py` populates itineraries using scraped attractions.
- Saved trips are kept in `localStorage` on the frontend; nothing is persisted server-side yet.
- If you change backend ports, update `VITE_API_BASE_URL` accordingly before restarting the frontend.
