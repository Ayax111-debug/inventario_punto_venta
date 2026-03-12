# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Pharmacy inventory and point-of-sale system with Django REST backend and React TypeScript frontend.

## Build & Run Commands

### Docker (Recommended)
```powershell
# Start all services (PostgreSQL, backend, frontend)
docker-compose up

# Rebuild after dependency changes
docker-compose up --build
```

### Local Development

**Backend (from `/backend`):**
```powershell
# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed test data
python manage.py seed_data

# Start server
python manage.py runserver
```

**Frontend (from `/frontend`):**
```powershell
npm install
npm run dev      # Development server (port 5173)
npm run build    # Production build
npm run lint     # ESLint
```

### Testing

**Backend tests (pytest):**
```powershell
cd backend
pytest                          # Run all tests
pytest -k "test_name"           # Run specific test
pytest modulo_principal/tests/  # Run tests for an app
```

Tests use `factory-boy` for fixtures. Factories are in `modulo_principal/tests/factories.py`.

## Architecture

### Backend Structure (`/backend`)

- **`base/`** - Django project config (settings, root urls)
- **`modulo_principal/`** - Core inventory module
  - `models/inventario.py` - Laboratorio, Producto, Lote models with business rules
  - `models/usuarios.py` - UsuarioCustom (extends AbstractUser with RUT)
  - `views/`, `serializers/` - Organized by domain (inventario, usuarios, tokenAuth)
  - `authentication.py` - CustomJWTAuthentication (cookie-based)
  - `management/commands/seed_data.py` - Test data seeder
- **`punto_venta/`** - Point of sale module
  - `models.py` - Venta (UUID pk, soft delete), DetalleVenta (frozen prices, FEFO tracking)

### Frontend Structure (`/frontend/src`)

- **`api/axios.ts`** - Axios instance with automatic token refresh interceptor
- **`services/`** - API service classes per domain (auth, laboratorio, producto, lotes, venta)
- **`pages/`** - Route components (LoginPage, LaboratoriosPage, ProductosPage, LotesPages, POSpage)
- **`components/`** - Reusable UI components
- **`hooks/`** - Custom React hooks
- **`domain/`** - Business logic and types

### Key Design Patterns

**Authentication:** JWT tokens stored in HTTP-only cookies, automatic refresh on 401 responses.

**Model Protection (Backend):**
- Laboratorio: Cannot rename if has linked products
- Producto: Immutable fields (laboratorio, codigo_serie) when has lotes
- Lote: Immutable fields (producto, codigo_lote, dates) after creation; cannot delete if cantidad > 0

**Stock Management:** Lote quantity changes automatically update parent Producto's stock_total and activo status.

## API Endpoints

Base URL: `http://localhost:8000/api/`

- `POST /token/` - Login (returns cookies)
- `POST /token/refresh/` - Refresh token
- `POST /logout/` - Logout
- `GET /me/` - Current user profile
- `/usuarios/` - User CRUD (ViewSet)
- `/productos/` - Product CRUD (ViewSet)
- `/laboratorios/` - Laboratory CRUD (ViewSet)
- `/lotes/` - Lot CRUD (ViewSet)
- `/global-search/` - Cross-entity search

## Environment

Backend requires `.env` in `/backend` with:
- `SECRET_KEY`
- `DATABASE_URL` (PostgreSQL connection string)
- `ALLOWED_HOST`
- `DEBUG`

Frontend expects `VITE_API_URL=http://localhost:8000` (set in docker-compose).
