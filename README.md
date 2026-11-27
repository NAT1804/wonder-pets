# Wonder Pets

Nx monorepo for the **Wonder Pets** e-commerce platform (**Angular 21** + **NestJS 11** + **Prisma** + **PostgreSQL 16**).

## Structure

- `apps/pets-shop` — Angular 21 storefront application
- `apps/api` — NestJS 11 backend API (`/api/v1`, Swagger at `/api/docs`)
- `libs/auth` — Self-hosted JWT/cookie auth client (`ApiAuthService`, `apiAuthInterceptor`, guards) + Keycloak OIDC research code
- `libs/shared/contracts` (`@wonder-pets/contracts`) — Shared TypeScript DTO/response contracts between frontend and backend
- `libs/home`, `libs/page-not-found` — Angular feature libraries
- `prisma/` — Prisma schema (`schema.prisma`) and dev seed script (`seed.ts`)
- `docker/` — Local and production Docker Compose stacks + Keycloak research theme (`docker/themes/pets-shop-theme`)

## Local Development

```bash
# 1. Install dependencies & generate Prisma Client
npm ci
npm run prisma:generate

# 2. Prepare environment files
cp .env.example .env
cp docker/.env.example docker/.env

# 3. Start PostgreSQL (pets-shop-db on port 5433)
docker compose -f docker/docker-compose.yaml --env-file docker/.env up -d
# Optional: also start Keycloak + its DB for OIDC research
# docker compose -f docker/docker-compose.yaml --env-file docker/.env --profile keycloak up -d

# 4. Run database migrations & seed sample data
npm run prisma:migrate -- --name init
npm run prisma:seed

# 5. Start backend API (http://localhost:3000/api/v1, Swagger: http://localhost:3000/api/docs)
npm run start:api

# 6. Start Angular frontend (http://localhost:4200, proxies /api -> localhost:3000)
npm start
```

## Quality Checks

```bash
npx nx run-many -t lint test build
```

## Production Deployment (Cloudflare + VPS)

### 1. Frontend (`apps/pets-shop`) on Cloudflare Pages
- **Build command**: `npx nx build pets-shop`
- **Build output directory**: `dist/apps/pets-shop/browser`
- SPA routing fallback is configured via `apps/pets-shop/public/_redirects`.

### 2. Media Storage on Cloudflare R2
- Create an R2 bucket (e.g. `wonder-pets-media`) with a custom public domain (e.g. `https://media.wonderpets.vn`).
- Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_BASE_URL` in production env.
- Admins request presigned `PUT` URLs via `POST /api/v1/storage/presign-upload`.

### 3. Backend (`apps/api`) + PostgreSQL on a 1–2GB VPS
```bash
cp docker/.env.prod.example docker/.env.prod
# Fill in strong passwords and JWT_ACCESS_SECRET (>= 32 chars)
docker compose -f docker/docker-compose.prod.yaml --env-file docker/.env.prod up -d --build
```
Expose `127.0.0.1:3000` through **Cloudflare Tunnel (`cloudflared`)** or a reverse proxy behind Cloudflare Proxy/WAF.
