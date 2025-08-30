# Zalo Mini App Hotel Management System - AI Coding Guide

## Architecture Overview

This is a **multi-tenant SaaS hotel booking system** with separate backend (FastAPI) and frontend (React/Vite/Ant Design). The system uses a single MySQL database with tenant isolation via `tenant_id` fields.

### Key Components
- **Backend**: FastAPI with SQLAlchemy ORM (`backend/app/`)
- **Frontend**: React + TypeScript + Ant Design + Redux Toolkit (`fe/`)
- **Database**: MySQL with multi-tenant schema (see `ZaloMini App MySQL Script.sql`)

## Critical Patterns

### 1. Multi-Tenant Data Access
All CRUD operations MUST include tenant isolation:
```python
# In crud/base.py - ALL queries filter by tenant_id + deleted=0
def get(self, db: Session, id: Any, tenant_id: int):
    return db.query(self.model).filter(
        and_(self.model.id == id, self.model.tenant_id == tenant_id, self.model.deleted == 0)
    ).first()
```

### 2. Database Configuration Switch
The system toggles between local/remote MySQL via `USE_LOCAL_DB` in `core/config.py`:
- `USE_LOCAL_DB=True`: Local MySQL (`localhost`)  
- `USE_LOCAL_DB=False`: Remote MySQL (production)

### 3. Soft Delete Pattern
Models use soft deletion with `deleted`, `deleted_at`, `deleted_by` fields. Never use hard deletes in production code.

### 4. API Structure
All endpoints follow the pattern: `api/api_v1/endpoints/{resource}.py`
- Authentication required for most endpoints via `get_current_admin_user`
- Consistent response format with proper HTTP status codes

### 5. Middleware Stack
Applied in order in `main.py`:
- `RequestLoggingMiddleware` - logs all requests to `logs/requests.log`
- `SecurityHeadersMiddleware` - adds security headers
- `AuditTrailMiddleware` - tracks data changes to `logs/audit.log`  
- `PerformanceMonitoringMiddleware` - monitors response times/system resources

## Development Workflows

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r app/requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup  
```bash
cd fe
npm install
npm run dev  # Runs on port 8889 with API proxy
```

### Database Migration
- Schema defined in `models/models.py` with SQLAlchemy models
- Sample data scripts in `backend/scripts/`
- Production deployment uses `deploy_all.sh` for full setup

## File Organization Conventions

### Backend Structure
- `models/models.py` - All SQLAlchemy models with multi-tenant base classes
- `schemas/` - Pydantic models for request/response validation
- `crud/` - Database operations with tenant isolation built-in
- `api/api_v1/endpoints/` - Route handlers grouped by resource
- `core/` - Configuration, dependencies, error handling
- `middleware/` - Request processing layers with comprehensive logging

### Frontend Structure  
- `src/pages/` - Route components
- `src/features/` - Business logic components
- `src/stores/` - Redux Toolkit slices
- `src/api/` - API client functions
- `src/types/` - TypeScript interfaces

## Key Integration Points

### Authentication Flow
JWT tokens issued by `/api/v1/auth/login`, validated via `get_current_admin_user` dependency.

### File Uploads
Files stored in `uploads/` directory with tenant-specific subfolders. Use `file_management.py` endpoint.

### Logging Strategy
Separate log files by concern:
- `logs/app.log` - General application logs
- `logs/requests.log` - All HTTP requests  
- `logs/audit.log` - Data modification tracking
- `logs/performance.log` - Response times and resource usage
- `logs/security.log` - Authentication/authorization events

## Production Deployment

Use `backend/deploy_all.sh` which handles:
- Python 3.11 setup on AlmaLinux VPS
- MySQL configuration with secure local setup
- Nginx reverse proxy with SSL (via `setup_ssl_zalominiapp.sh`)
- Systemd service configuration
- Health check monitoring (`health_check.sh`)

## Testing Patterns

- Use `tbl_test_items` table for Zalo app testing (no tenant_id required)
- Sample data generation via `scripts/create_sample_data.py`
- Frontend mock data in `src/mock/`

## Common Pitfalls

- **Never bypass tenant isolation** - all database queries must filter by `tenant_id`
- **Always use soft deletes** - set `deleted=1` instead of removing records
- **Check `USE_LOCAL_DB` setting** - determines database connection target
- **Frontend proxy configuration** - Vite proxy routes `/api` to backend automatically
