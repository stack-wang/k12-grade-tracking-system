# K12 成绩追踪系统

Monorepo: `backend/` (FastAPI + SQLAlchemy + SQLite) + `frontend/` (React + Vite + Ant Design).

## Quick start

```bash
# backend (from backend/)
pip install -r requirements.txt && python main.py
# → http://localhost:8000, OpenAPI docs at /docs

# frontend (from frontend/)
npm install && npm run dev
# → http://localhost:3000, proxies /api -> localhost:8000

# Docker (from root)
docker-compose up --build
# → backend :8000, frontend :80 (nginx)
```

## Tests

```bash
# backend
pytest                    # all tests
pytest tests/test_auth.py # single file

# frontend
npm test                       # all (vitest run)
npx vitest run src/__tests__/Login.test.tsx  # single file
```

Backend tests use an isolated `test.db`, auto-created/dropped per session.

## Architecture

- **DB**: SQLite, schema auto-created on startup via `Base.metadata.create_all`. No migration tooling.
- **Auth**: JWT (HS256, 24h expiry) + bcrypt. Token stored in `localStorage` as `token`, parent name as `parent_name`.
- **Router prefixes**: all under `/api/...` (auth, children, subjects, exams, scores, reports, exports).
- **Reports**: assumes one child per parent (queries `.first()`). Service layer in `services/report_service.py`.
- **CSV export**: `GET /api/exports/csv` returns `StreamingResponse` with BOM for Excel compat.

## Gotchas

- `tsconfig.json` has `strict: false` and noUnused checks disabled. The project does not run `tsc`.
- No linting configured (no ruff, no eslint, no prettier).
- Frontend uses `jsdom` test environment with a `matchMedia` mock in `test-setup.ts`.
- No `.env` file. App config is `config.py` (hardcoded SECRET_KEY — **change for production**).
- DB file (`k12.db`) is created relative to CWD. In Docker, volume-mounted `./data:/app`.
- `utils/` directory exists but is empty.
- All UI text and API messages are in Chinese.
- `models/__init__.py` is empty — individual model files are imported directly.
