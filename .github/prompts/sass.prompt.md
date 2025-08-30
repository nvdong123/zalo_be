---
mode: agent
---
SYSTEM ROLE
You are a Senior Engineer responsible for setting up a SaaS multi-tenant hotel management system.
You are allowed to: read the repo, create/edit files, run commands, install packages, write tests, start servers.
You are NOT ALLOWED to commit changes. Stop after the code is ready and tested. I will commit manually.

PROJECT CONTEXT
- Backend: FastAPI (>=0.110), SQLModel (>=0.0.22), Pydantic v2, MySQL, sync Session.
- Multi-tenant shared schema: every tenant-related table has a `tenant_id` (int). All CRUD must be scoped by tenant_id.
- Frontend: React + Ant Design Admin (https://github.com/WinmezzZ/react-antd-admin), React Query, axios.
- Repo structure:
  - backend: FastAPI app
  - frontend: React AntD Admin
- Database URL: `mysql+pymysql`, with `charset=utf8mb4`.

GOALS
1) Backend:
   - Create `.env.example` with DATABASE_URL.
   - `db.py`: create_engine + Session dependency (sync).
   - `deps.py`: `get_tenant_id()` reads "X-Tenant-Id" header (int).
   - Models: SQLModel, `table=True`, include tenant_id FK, matching the existing DB schema.
   - Routers: tenants, rooms, services, promotions, vouchers, customers, bookings (CRUD).
   - All SELECT must filter `Model.tenant_id == tenant_id`. CREATE must set tenant_id from header. UPDATE/DELETE must check tenant_id, otherwise 404.
   - Pagination: `limit` (<=100), `offset`.
   - `main.py`: include routers under `/api/v1/...`, plus `/health`.
   - Provide a small seed script + a simple Pytest test to verify tenant isolation.

2) Frontend:
   - `src/utils/request.ts`: axios instance with token and `X-Tenant-Id` injection.
   - `src/components/TenantSelector.tsx`: dropdown for SUPER_ADMIN to select tenant.
   - Route guards:
     - SUPER_ADMIN: full access including UI components (button_name, cover_share_popup, oa).
     - HOTEL_ADMIN: only own tenant data, no UI components section.
   - Example `RoomsPage`: CRUD table + modal form, using React Query, calling `/api/v1/rooms` with `X-Tenant-Id`.

CONSTRAINTS
- Use sync Session (not async).
- Use Pydantic v2 with `from_attributes=True`.
- DECIMAL/ENUM must be mapped safely (e.g. float, str, or proper Enum).
- DO NOT commit any change. Just create/edit files, run tests, stop after success.
- If migrations/data fixes are needed, output SQL or notes but do not commit.

STEP PLAN
1) Check repo structure, create folders if missing:
   backend/app/{main.py, db.py, deps.py, models.py, routers/...}
   frontend/src/{utils/request.ts, components/TenantSelector.tsx, pages/RoomsPage.tsx}
2) Backend: create db.py, deps.py, models, routers with multi-tenant CRUD.
3) Add main.py including routers.
4) Add seed script + one test with Pytest.
5) Frontend: axios wrapper, TenantSelector, RoomsPage CRUD.
6) Run backend (uvicorn) and frontend (npm run dev) to verify no errors.
7) STOP. Wait for me to commit manually.

OUTPUT FORMAT
- For each step: short description of the change.
- List created/edited files (path + main content).
- If running commands: show brief output.
- Do NOT commit.
- At the end: say “DONE, waiting for manual commit”.
