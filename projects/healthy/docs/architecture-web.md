# Arquitectura Web — Healthy

Healthy despliega su infraestructura en AWS (región `eu-west-1`), con una landing estática servida vía S3 + CloudFront y una API containerizada en ECS Fargate. El tráfico a ambas capas pasa por Route 53 y se termina con SSL/TLS gestionado por ACM.

---

## Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                   │
└──────────┬──────────────────────────────────────┬───────────────────────┘
           │                                      │
           ▼                                      ▼
  ┌─────────────────┐                   ┌─────────────────┐
  │   Route 53      │                   │   Route 53      │
  │  healthy.app    │                   │  api.healthy.app│
  │  (A alias CF)   │                   │  (A alias ALB)  │
  └────────┬────────┘                   └────────┬────────┘
           │                                     │
           ▼                                     ▼
  ┌─────────────────┐                   ┌─────────────────┐
  │   CloudFront    │                   │      ALB        │
  │  (CDN global)   │                   │  (eu-west-1)    │
  │  SSL · OAC · CF │                   │  443 / HTTPS    │
  │  Functions      │                   └────────┬────────┘
  └────────┬────────┘                            │
           │                                     ▼
           ▼                           ┌─────────────────────┐
  ┌─────────────────┐                  │    ECS Fargate      │
  │  S3 Bucket      │                  │  Node.js + Express  │
  │  healthy-       │                  │  (0.25 vCPU/0.5GB)  │
  │  landing-prod   │                  └──────┬──────────────┘
  │  (eu-west-1)    │                         │
  └─────────────────┘                   ┌─────┴──────┐
                                         │            │
                                         ▼            ▼
                                  ┌──────────┐  ┌──────────┐
                                  │   RDS    │  │  Redis   │
                                  │ Postgres │  │ ElastiC. │
                                  │(privado) │  │(privado) │
                                  └──────────┘  └──────────┘

──────── FLUJO APP MÓVIL ──────────────────────────────────────────────────

  ┌──────────────────┐
  │  App Móvil       │  React Native + Expo (iOS / Android)
  │  (dispositivo)   │
  └────────┬─────────┘
           │  HTTPS
           ▼
  ┌─────────────────┐
  │      ALB        │  → ECS Fargate → RDS + Redis
  └─────────────────┘

──────── SERVICIOS EXTERNOS ───────────────────────────────────────────────

  ECS Fargate ──────→  Supabase        (Auth / OTP emails)
  ECS Fargate ──────→  Anthropic API   (Claude claude-sonnet-4-6)

──────── CI / CD ──────────────────────────────────────────────────────────

  GitHub                          GitHub
  push main                       push main / develop
  (landing/ changes)              (backend changes)
       │                                │
       ▼                                ▼
  GitHub Actions               GitHub Actions
  deploy-landing               build-push (ECR)
       │                                │
       ├── aws s3 sync          ┌────────┴────────┐
       │   s3://healthy-        │                 │
       │   landing-prod         ▼                 ▼
       │                  deploy-staging    deploy-production
       └── CloudFront          (develop)         (main)
           invalidation           │                 │
           "/*"                   ▼                 ▼
                            ECS staging      ECS production
                            (force new       (aprobación
                            deployment)       manual)
```

---

## Componentes

| Componente | Región | Descripción |
|---|---|---|
| **Route 53** | eu-west-1 / global | DNS autoritativo. Hosted zone `healthy.app`. Registros A alias para apex y `www` → CloudFront; alias para API → ALB. |
| **CloudFront** | Global (us-east-1 control) | CDN. SSL termination con certificado ACM. Dominio `healthy.app` + `www.healthy.app`. TTL 86 400 s, compresión activada, redirige HTTP → HTTPS. CloudFront Functions inyectan security headers en cada respuesta. OAC para autenticar las peticiones al bucket S3. |
| **ACM** | us-east-1 | Certificado SSL wildcard / multi-dominio para CloudFront (CloudFront exige ACM en `us-east-1`). Gratuito, renovación automática. |
| **S3 `healthy-landing-prod`** | eu-west-1 | Aloja `landing/index.html`. Static website hosting habilitado. Acceso público GET permitido vía política de bucket. Versioning activado (permite rollback). Solo el rol de CI puede escribir. |
| **ALB** | eu-west-1 | Load balancer HTTPS frente a ECS. Listener en 443, forward al target group del servicio `healthy-backend`. Health check en `GET /health`. |
| **ECS Fargate** | eu-west-1 | Contenedor del backend Node.js + Express + Prisma. Tarea con 0,25 vCPU y 0,5 GB RAM. Una tarea mínima en producción; auto-scaling opcional. Imagen almacenada en ECR `healthy-backend`. |
| **RDS PostgreSQL** | eu-west-1 | Base de datos principal. Instancia `db.t3.micro`. Desplegada en subnet privada. Multi-AZ desactivado en early stage (activar en producción estable). Backups automáticos diarios en S3. |
| **ElastiCache Redis** | eu-west-1 | Caché de planes IA (TTL 24 h) y store de refresh tokens. Nodo `cache.t3.micro`. Subnet privada. |
| **S3 `healthy-progress-photos`** | eu-west-1 | Almacena las fotos de progreso de los usuarios. Acceso **privado**: el backend genera presigned URLs con expiración corta para upload y download. |
| **Supabase** | External (EU) | Autenticación de usuarios: registro, verificación OTP por email, tokens JWT. Gestiona el proveedor de emails transaccionales. |
| **Anthropic API** | External | Generación de planes personalizados con `claude-sonnet-4-6`. Prompt caching activado (`cache_control`) para el system prompt base (~80 % reducción de tokens facturados). |

---

## Decisiones de red (VPC)

```
VPC: 10.0.0.0/16
│
├── Subnets públicas (AZ-a: 10.0.1.0/24 · AZ-b: 10.0.2.0/24)
│   ├── ALB (requiere subnet pública para recibir tráfico externo)
│   └── NAT Gateway (salida a internet para recursos privados)
│
└── Subnets privadas (AZ-a: 10.0.10.0/24 · AZ-b: 10.0.11.0/24)
    ├── ECS Fargate tasks
    ├── RDS PostgreSQL
    └── ElastiCache Redis
```

### Security Groups

| SG | Regla inbound | Regla outbound |
|---|---|---|
| `sg-alb` | 80/TCP `0.0.0.0/0`, 443/TCP `0.0.0.0/0` | Todo → `sg-ecs` |
| `sg-ecs` | 3000/TCP desde `sg-alb` | Todo (necesita acceder a RDS, Redis, Supabase, Anthropic) |
| `sg-rds` | 5432/TCP desde `sg-ecs` | — |
| `sg-redis` | 6379/TCP desde `sg-ecs` | — |

---

## Estimación de costes mensuales

> Basada en tráfico bajo (early stage). Región eu-west-1. Precios aproximados de mayo 2026.

| Servicio | Instancia / Tier | Coste estimado |
|---|---|---|
| CloudFront | Tráfico landing bajo (~10 GB/mes) | ~$1–5/mes |
| S3 `healthy-landing-prod` | < 1 MB, pocas peticiones | ~$0.10/mes |
| Route 53 | 1 hosted zone + queries | ~$0.50/mes + $0.40/M queries |
| ACM | — | Gratis |
| ALB | 1 ALB, tráfico bajo | ~$16–20/mes |
| ECS Fargate | 0.25 vCPU · 0.5 GB · 1 tarea 24/7 | ~$10–15/mes |
| RDS PostgreSQL | `db.t3.micro`, Single-AZ | ~$15–20/mes |
| ElastiCache Redis | `cache.t3.micro`, 1 nodo | ~$12–15/mes |
| S3 `healthy-progress-photos` | Variable según usuarios | ~$1–5/mes |
| ECR | < 1 GB imágenes | ~$0.10/mes |
| **Total estimado** | | **~$56–80/mes** |

El mayor salto de coste vendrá al activar RDS Multi-AZ (~+$15/mes) y escalar ECS a 2+ tareas (~+$10–15/mes por tarea).

---

## Flujo CI/CD

### Landing (push a `main` con cambios en `landing/`)

```
1. GitHub detecta cambios en landing/ en rama main
2. Dispara job deploy-landing
3. Configura credenciales AWS (secrets del repo)
4. aws s3 sync landing/ → s3://healthy-landing-prod --delete
5. aws s3 cp index.html con cache-control: no-cache (fuerza refresco)
6. aws cloudfront create-invalidation --paths "/*"
7. CloudFront sirve la versión nueva en < 60 s
```

### Backend (push a `develop` o `main`)

```
1. Job build-push
   a. docker build del contexto ./backend
   b. Push a ECR con tags :sha y :staging/:latest

2. Si rama == develop → deploy-staging
   a. aws ecs update-service --force-new-deployment (cluster healthy-staging)
   b. Espera aws ecs wait services-stable

3. Si rama == main → deploy-production
   a. Requiere aprobación manual en GitHub environment "production"
   b. aws ecs update-service --force-new-deployment (cluster healthy-production)
   c. Espera aws ecs wait services-stable
```

### Secretos necesarios en GitHub

| Secret | Uso |
|---|---|
| `AWS_ACCESS_KEY_ID` | Autenticación AWS CLI en CI |
| `AWS_SECRET_ACCESS_KEY` | Autenticación AWS CLI en CI |
| `AWS_REGION` | Región por defecto (`eu-west-1`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | Invalidación de caché en deploy de landing |
