# Arquitectura Web — Healthy

Healthy despliega su backend en Railway (proyecto `healthy-staging`), con PostgreSQL y Redis gestionados por el mismo proveedor. La landing estática se sirve vía S3 + CloudFront (ver [landing-deploy.md](./landing-deploy.md)). AWS **no se usa** para el backend.

---

## Diagrama de arquitectura

```mermaid
graph TD
    subgraph Clientes
        APP[App Móvil\nReact Native + Expo]
    end

    subgraph Railway ["Railway — proyecto healthy-staging"]
        BACKEND["Servicio: ai-studio\nNode.js + Express\nRailpack builder\nai-studio-production-1835.up.railway.app"]
        PG[("PostgreSQL\n(gestionado Railway)")]
        REDIS[("Redis\n(gestionado Railway)")]
    end

    subgraph Externos
        SUPABASE[Supabase\nAuth / OTP]
        ANTHROPIC[Anthropic API\nClaude claude-sonnet-4-6]
        SMTP[Gmail SMTP\nsmtp.gmail.com:587]
    end

    subgraph CICD ["CI/CD — GitHub Actions"]
        PR[Pull Request\ndevelop → main]
        CI["ci.yml\nlint + tests + docker build"]
        DEPLOY["deploy.yml\nrailway up"]
    end

    APP -->|HTTPS| BACKEND
    BACKEND --> PG
    BACKEND --> REDIS
    BACKEND --> SUPABASE
    BACKEND --> ANTHROPIC
    BACKEND --> SMTP

    PR --> CI
    CI -->|merge a main| DEPLOY
    DEPLOY -->|railway up| BACKEND
```

---

## Diagrama ASCII

```
┌──────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                  │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ HTTPS
                                   ▼
                    ┌──────────────────────────────┐
                    │  Railway — ai-studio         │
                    │  Node.js + Express + Prisma  │
                    │  (Railpack, root: backend/)  │
                    │  ai-studio-production-       │
                    │  1835.up.railway.app         │
                    └───────────┬──────────────────┘
                                │
                   ┌────────────┴────────────┐
                   ▼                         ▼
          ┌─────────────────┐      ┌─────────────────┐
          │  PostgreSQL      │      │  Redis          │
          │  (Railway        │      │  (Railway       │
          │  managed)        │      │  managed)       │
          └─────────────────┘      └─────────────────┘

──────── SERVICIOS EXTERNOS ───────────────────────────────────────────

  Backend ──────→  Supabase        (Auth / OTP emails)
  Backend ──────→  Anthropic API   (Claude claude-sonnet-4-6)
  Backend ──────→  Gmail SMTP      (smtp.gmail.com:587)

──────── CI / CD ──────────────────────────────────────────────────────

  GitHub                         GitHub
  push develop                   push main
       │                              │
       ▼                              ▼
  deploy.yml                    deploy.yml
  railway up                    railway up
  → staging                     → producción
  backend-staging-              ai-studio-production-
  01ee.up.railway.app           1835.up.railway.app

  (En PRs: ci.yml — lint + tests + docker build, sin deploy)
```

---

## Componentes

| Componente | Proveedor | Descripción |
|---|---|---|
| **Backend `ai-studio`** | Railway | Servicio Node.js + Express + Prisma. Builder Railpack. Root: `projects/healthy/backend`. Dominio `ai-studio-production-1835.up.railway.app`. Service ID: `ec2720da-2f41-436c-a5e2-e39f7b7d9a6e`. |
| **PostgreSQL** | Railway (managed) | Base de datos principal. Referenciada como `${{Postgres.DATABASE_URL}}`. Backups automáticos incluidos en el plan Railway. |
| **Redis** | Railway (managed) | Caché de planes IA (TTL 24 h) y store de refresh tokens. Referenciado como `${{Redis.REDIS_URL}}`. |
| **Supabase** | External (EU) | Autenticación de usuarios: registro, verificación OTP por email, tokens JWT. Gestiona el proveedor de emails transaccionales. |
| **Anthropic API** | External | Generación de planes personalizados con `claude-sonnet-4-6`. Prompt caching activado (`cache_control`) para el system prompt base (~80 % reducción de tokens facturados). |
| **Gmail SMTP** | External | Envío de emails de verificación y recuperación de contraseña. Host: `smtp.gmail.com:587`. Usuario: `trutool@gmail.com`. |
| **Landing (S3 + CloudFront)** | AWS | Landing estática independiente del backend. Ver [landing-deploy.md](./landing-deploy.md). |

---

## Entornos Railway

| Entorno | Servicio | Dominio | Rama |
|---------|---------|---------|------|
| Producción | `ai-studio` (ID: `ec2720da-...`) | `ai-studio-production-1835.up.railway.app` | `main` |
| Staging | `backend` (ID: `fa137c98-...`) | `backend-staging-01ee.up.railway.app` | `develop` |

Proyecto Railway: `healthy-staging` (ID: `a01d9f3d-510b-4529-b75a-d9d7198cbcb5`)

---

## Flujo CI/CD

### Backend (push a `develop` o `main`)

```
1. Push a develop o main
2. GitHub Actions dispara deploy.yml:
   a. test   → npm test --coverage (cobertura ≥ 80 %)
   b. deploy → railway up (Railpack build + deploy en Railway)
   c. smoke  → GET /health con 3 reintentos
```

### En Pull Requests (ci.yml)

```
1. Apertura / actualización de PR
2. GitHub Actions dispara ci.yml:
   a. lint        → ESLint
   b. tests       → Jest con cobertura ≥ 80 % (tests.yml)
   c. docker build → verifica que la imagen compila (sin push ni deploy)
```

### Landing (push a `main` con cambios en `landing/`)

Ver [landing-deploy.md](./landing-deploy.md).

### Secretos necesarios en GitHub

| Secret | Uso |
|--------|-----|
| `RAILWAY_TOKEN` | Autenticación Railway CLI en CI (`railway up`) |
| `JWT_SECRET` | Clave de access tokens |
| `JWT_REFRESH_SECRET` | Clave de refresh tokens |
| `SUPABASE_URL` | URL Supabase del entorno |
| `SUPABASE_ANON_KEY` | Clave anon Supabase |
| `SMTP_USER` | `trutool@gmail.com` |
| `SMTP_PASS` | Contraseña de aplicación Gmail |
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `AWS_ACCESS_KEY_ID` | Solo para deploy de la landing |
| `AWS_SECRET_ACCESS_KEY` | Solo para deploy de la landing |
| `CLOUDFRONT_DISTRIBUTION_ID` | Solo para invalidación de caché de la landing |

---

## Estimación de costes mensuales

> Estimación para tráfico bajo (early stage). Precios aproximados Railway, junio 2026.

| Servicio | Tier / Uso | Coste estimado |
|---|---|---|
| Railway backend `ai-studio` | Hobby/Pro, uso bajo | ~$5–10/mes |
| Railway PostgreSQL | Managed, early stage | ~$5–10/mes |
| Railway Redis | Managed, early stage | ~$3–5/mes |
| Supabase | Free tier (hasta 50k MAU) | $0/mes |
| Anthropic API | Variable según uso | ~$5–20/mes |
| Gmail SMTP | Gratuito (límite 500 emails/día) | $0/mes |
| S3 + CloudFront (landing) | Tráfico bajo | ~$1–5/mes |
| **Total estimado** | | **~$19–50/mes** |

El mayor salto de coste vendrá al escalar el plan Railway (más RAM/CPU) o superar el free tier de Supabase. Significativamente más económico que la arquitectura AWS anterior (~$56–80/mes).

---

> Última actualización: 2026-06-29 — Docs Agent (reescritura completa; eliminada arquitectura AWS, reemplazada por Railway)
