# Tasks — Healthy App

## Estado del proyecto
Proyecto en fase de integración. La base estructural está completa
(schema, endpoints stub, diseño, pantallas, tests, CI/CD, RGPD).
El foco actual es conectar las piezas y llevarlo a producción.

---

## Stack tecnológico

| Capa        | Tecnología                              |
|-------------|----------------------------------------|
| Frontend    | React Native + Expo + TypeScript + NativeWind |
| Backend     | Node.js + Express + Prisma             |
| Base datos  | PostgreSQL + Redis                     |
| IA          | Claude API (claude-sonnet-4-6)         |
| Auth        | Supabase                               |
| Landing     | HTML/CSS/JS estático — S3 + CloudFront |
| Cloud       | AWS (ECS, RDS, ElastiCache, S3, CloudFront, Route 53) |
| CI/CD       | GitHub Actions + Expo EAS              |

---

## Agentes necesarios

- **database** → migraciones Prisma y seed
- **backend**  → implementar lógica real en los endpoints stub
- **ai**       → integrar Claude API en el flujo de plan personalizado
- **frontend** → conectar pantallas al backend real
- **design**   → revisión visual final y modo oscuro
- **tests**    → ampliar cobertura hasta ≥ 80 % y tests E2E
- **security** → auditoría RGPD y variables de entorno
- **devops**   → variables de entorno reales y despliegue AWS
- **docs**     → documentación técnica de la API y guía de despliegue

---

## Tareas por agente

### Database
> Carpeta: `projects/healthy/database/`

- [~] **DB-01** Ejecutar `prisma migrate dev` — `MIGRATION_LOG.md` creado; requiere PostgreSQL corriendo: `cd projects/healthy/backend && npx prisma migrate dev --schema ../database/schema.prisma --name init`
- [x] **DB-02** Crear script de seed con datos de prueba realistas — `database/seed.ts` creado (10 usuarios, 20 ejercicios, 200 alimentos, 5 planes)
- [x] **DB-03** Añadir índices en columnas de alta consulta — ya implementados en `schema.prisma`
- [x] **DB-04** Configurar Redis — `database/redis.ts` + `database/CACHE_STRATEGY.md` creados
- [x] **DB-05** Verificar integridad referencial — constraints ya en `schema.prisma` (onDelete: Cascade, UNIQUE, NOT NULL)
- [x] **DB-06** Documentar ERD actualizado — `database/ERD.md` creado (diagrama Mermaid, 21 entidades)

**Dependencias:** ninguna — es el primer paso

---

### Backend
> Carpeta: `projects/healthy/backend/`

- [x] **BE-01** Auth completa: register, verify-email, set-password, login, logout, forgot-password, reset-password, refresh, me
- [x] **BE-02** `POST /onboarding/complete` → guarda 7 pasos, llama AI, calcula TMB/TDEE, persiste plan+sesiones+comidas en DB
- [x] **BE-03** Entrenamiento: `/training/today`, sessions, complete, registrar series (peso + reps)
- [x] **BE-04** Nutrición: meals/today, mark complete, `/foods/search`, `/foods/barcode/:code`
- [x] **BE-05** Progreso: historial, crear medición (con detección de estancamiento AI-04), stats + racha
- [x] **BE-06** Logs diarios: get/create today, update (agua/sueño/energía/pasos/ánimo), history
- [x] **BE-07** Validación: express-validator en todos los endpoints; Zod disponible para servicios
- [x] **BE-08** Rate limiting: authLimiter (5 req/15min en `/auth/*`), apiLimiter (100 req/15min autenticados)
- [x] **BE-09** Redis cache: planes IA, sesiones JWT, búsqueda de alimentos (6h)
- [x] **BE-10** `GET /health` → estado real DB + Redis + timestamp + version

> ⚠️ Ejecutar en backend/: `npm install @anthropic-ai/sdk zod` antes de arrancar
> ⚠️ `database/schema.prisma` actualizado con `TokenUsageLog` — requiere nueva migración

**Dependencias:** DB-01, DB-02, AI-01

---

### AI
> Carpeta: `projects/healthy/ai/`

- [x] **AI-01** Prompt de generación con 7 dimensiones de onboarding — `ai/planGenerator.ts`
- [x] **AI-02** Cálculo TMB/TDEE Mifflin-St Jeor incluido en contexto — `ai/types.ts::calculateMetabolism`
- [x] **AI-03** Respuesta JSON tipada: `GeneratedPlan` con `training_plan`, `nutrition_plan`, `macros`, `weekly_schedule` — `ai/types.ts`
- [x] **AI-04** Regeneración automática: `shouldRegeneratePlan` + `regeneratePlan` — `ai/planGenerator.ts`
- [x] **AI-05** Prompt caching con `cache_control: ephemeral` en system prompt — `ai/planGenerator.ts`
- [x] **AI-06** Fallback plan genérico por reglas si Claude falla — `ai/fallbackPlan.ts`
- [x] **AI-07** Token logger con estimación de coste USD — `ai/tokenLogger.ts` (⚠️ BE debe añadir tabla `token_usage_logs` al schema Prisma)

**Dependencias:** DB-04 (Redis para caché de planes)

---

### Frontend
> Carpeta: `projects/healthy/frontend/`

- [x] **FE-01** Cliente HTTP con interceptor JWT + auto-refresh + queue anti-race-condition — `src/services/api.ts`
- [x] **FE-02** Auth completo: register→verify→set-password→login→logout, tokens en SecureStore — todas las pantallas auth
- [x] **FE-03** Onboarding 7 pasos conectados: PUT por paso + POST /onboarding/complete con loading 5-15s + banner fallback IA
- [x] **FE-04** TrainingScreen: GET /training/today, SetModal (peso+reps), completar ejercicio/sesión, skeleton loader
- [x] **FE-05** NutritionScreen: GET /nutrition/today, FoodSearchBar debounce 300ms, toggle completar comida
- [x] **FE-06** ProgressScreen: GET /progress+stats, modal registro, modal regenerar plan si `needs_plan_regeneration`
- [x] **FE-07** HomeScreen: logs agua/sueño/energía/pasos/ánimo vía PUT /logs/today
- [x] **FE-08** Zustand: authStore (accessToken+refreshToken+login/logout), planStore (training/nutrition/progress/logs), onboardingStore
- [x] **FE-09** Persistencia: SecureStore para tokens, AsyncStorage para plan offline (MMKV en package.json, pendiente build nativo)
- [x] **FE-10** Dark mode: `useTheme()` hook + tokens dark.* — `src/hooks/useTheme.ts`
- [x] **FE-11** Skeleton loaders en todas las pantallas + Toast component con accessibilityRole="alert"
- [x] **FE-12** WCAG AA: colores corregidos en `theme/colors.ts`, Button.tsx fondo `#16A34A`, hitSlop en touchables, accessibilityLabel en todos los componentes
- [x] **FE-13** TrainingScreen: WorkoutCard inProgress + ExerciseRow + RestTimer + WorkoutSummary integrados
- [x] **FE-14** ProgressScreen: ActivityRings + RecoveryScore + MetricGrid integrados

**Dependencias:** BE-01..BE-09, DS-01..DS-10

---

### Design
> Carpeta: `projects/healthy/design/`

- [x] **DS-01** Auditoría del sistema de diseño actual: tokens de color, spacing y tipografía verificados y exportados consistentemente desde `components/index.js`
- [x] **DS-02** Paleta modo oscuro definida en `tokens/colors.js` (`dark.*`) y paleta Whoop-inspired (`whoop.*`) para dashboards de métricas de salud
- [x] **DS-03** Revisar onboarding — `design/screens/ONBOARDING_UI.md` creado
- [x] **DS-04** Revisar pantalla de plan diario — `design/screens/DAILY_PLAN_UI.md` creado
- [x] **DS-05** Diseñar estados vacíos y de error — `design/screens/EMPTY_ERROR_STATES.md` creado
- [x] **DS-06** Validar accesibilidad visual — `design/ACCESSIBILITY_AUDIT.md` creado (54%→92% WCAG AA, 5 blockers con fixes exactos)
- [x] **DS-07** Crear `ProgressRing`, `ActivityRings`, `DailyProgressRing` — anillos de progreso animados inspirados en Apple Watch / Fitness+ con gradiente y fallback sin SVG
- [x] **DS-08** Crear `MetricCard`, `RecoveryScore`, `MetricGrid` — tarjetas de métricas de salud estilo Whoop con sparkline, trend y animación de número
- [x] **DS-09** Crear `WorkoutCard`, `ExerciseRow`, `RestTimer`, `WorkoutSummary` — componentes de sesión de entrenamiento estilo Apple Fitness+ con variantes featured / compact / inProgress
- [x] **DS-10** Diseñar landing page HTML estilo Tag Heuer Connected — paleta cinemática oscura, tipografía premium. Movida a `landing/index.html`

**Dependencias:** ninguna (puede trabajar en paralelo con Backend)

---

### Tests
> Carpeta: `projects/healthy/tests/`

- [x] **TS-01** Auditar los 217 tests existentes: identificar qué módulos tienen cobertura < 80 % — `tests/COVERAGE_REPORT.md` creado
- [x] **TS-02** Añadir tests unitarios para la lógica de cálculo TMB/TDEE/macros en el agente IA — `tests/unit/nutritionCalculator.test.js` (53 tests)
- [x] **TS-03** Añadir tests de integración para los endpoints de autenticación con base de datos real (no mocks) — `tests/integration/auth.test.js`
- [x] **TS-04** Añadir tests de integración para el flujo onboarding → generación de plan — `tests/integration/onboarding.test.js` (AI mockeado)
- [x] **TS-05** Añadir tests E2E con Supertest para el flujo crítico: registro → onboarding → ver plan → registrar medición — `tests/e2e/criticalFlow.test.js`
- [x] **TS-06** Añadir tests de integración para endpoints de nutrición y progreso — `tests/integration/nutrition.test.js` + `tests/integration/progress.test.js`
- [x] **TS-07** Configurar informe de cobertura en CI y fallar el pipeline si cae del 80 % — `.github/workflows/tests.yml` creado
- [x] **TS-08** Tests de carga básicos en los endpoints más pesados (generación de plan IA) — `tests/load/planGeneration.js` + `tests/LOAD_TEST_REPORT.md`

**Dependencias:** BE-01..BE-09, AI-01..AI-07 (para tests de integración reales)

---

### Security
> Carpeta: `projects/healthy/security/`

- [x] **SEC-01** Variables de entorno auditadas — WARN: sin hardcoding, JWT_SECRET sin validación startup
- [x] **SEC-02** Headers HTTP — Helmet con CSP explícita, `frameguard: deny`, HSTS preload, CORS sin fallback `*`
- [~] **SEC-03** Datos de salud — pendiente: `condition_name`, `notes`, `ai_prompt_used` sin cifrado at-rest (mejora para v2)
- [x] **SEC-04** RGPD — `DELETE /user/me` (Art.17) + `GET /user/me/export` (Art.20) + `health_consent_given_at` en schema + verificación edad 16
- [x] **SEC-05** JWT — PASS: access 15min, refresh 30d, rotación one-time, logout invalida Redis+BD
- [x] **SEC-06** Rate limiting — `planRegenerateLimiter`: 3 req/24h por userId en `/plans/regenerate`
- [x] **SEC-07** OTP usa `crypto.randomInt()` — `src/utils/crypto.util.js`
- [x] **SEC-08** `security/SECURITY_AUDIT.md` + `INCIDENT_RESPONSE.md` + `VULNERABILITIES.md` creados

> ⚠️ Nueva migración pendiente: `npx prisma migrate dev --schema ../database/schema.prisma --name add_health_consent`

**Dependencias:** BE-01..BE-09 (para auditar endpoints reales)

---

### DevOps
> Carpeta: `projects/healthy/devops/`

- [x] **DO-01** Crear `devops/ENV_VARS.md` con todas las variables por categoría (DB, Redis, JWT, Supabase, AI, SMTP, AWS, App) y actualizar `backend/.env.example`
- [x] **DO-02** Crear `devops/GITHUB_SECRETS.md` con lista completa de secretos GitHub Actions separados por staging/producción con instrucciones paso a paso
- [x] **DO-03** Crear `devops/infrastructure/staging.md` con diagrama ASCII de arquitectura + security groups + sizing; crear `infra/vpc.tf`, `infra/rds.tf`, `infra/elasticache.tf`, `infra/ecs.tf`, `infra/alb.tf`
- [x] **DO-04** Crear `.github/workflows/deploy-staging.yml` con jobs: test (cobertura 80%), build (ECR), deploy (ECS), smoke-test (/health con retry)
- [x] **DO-05** Crear `frontend/eas.json` con perfiles development/preview/production y `devops/EAS_BUILD.md` con instrucciones completas + workflow `eas-build.yml`
- [x] **DO-06** Crear `devops/EAS_SUBMIT.md` con requisitos Apple/Google, pasos para generar credenciales, y workflow `eas-submit.yml` (trigger: tag `v*.*.*`)
- [x] **DO-07** Crear `devops/MONITORING.md` con UptimeRobot, CloudWatch Alarms (CPU/RAM/RDS/5xx), logs `/ecs/healthy-api` con retención 30 días, comandos `aws logs tail` y dashboard CloudWatch
- [x] **DO-08** Crear `devops/BACKUP_STRATEGY.md` con RDS automated backups 7 días, snapshots pre-deploy, procedimiento de restauración 5 pasos, y workflow `db-backup.yml` (cron: domingo 02:00 UTC)
- [x] **DO-09** Crear bucket S3 `healthy-landing-prod` para sitio estático: activar static website hosting, bucket policy de acceso público, bloquear uploads directos (solo CI)
- [x] **DO-10** Configurar CloudFront distribution frente al bucket S3: certificado SSL via ACM, dominio personalizado (`healthy.app`), compresión gzip/brotli, redirección HTTP → HTTPS, TTL de caché `86400` para assets
- [x] **DO-11** Configurar DNS en Route 53: registrar o delegar dominio `healthy.app`, crear registro A alias apuntando a la CloudFront distribution
- [x] **DO-12** Añadir job `deploy-landing` en el pipeline GitHub Actions: se dispara en push a `main` con cambios en `landing/`; ejecuta `aws s3 sync landing/ s3://healthy-landing-prod --delete` seguido de `aws cloudfront create-invalidation --paths "/*"`
- [x] **DO-13** Configurar cabeceras de seguridad en CloudFront para la landing vía Lambda@Edge o CloudFront Functions: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`

**Dependencias:** SEC-01 (variables de entorno auditadas antes de configurar CI); DO-09 antes de DO-10 antes de DO-11 antes de DO-12

---

### Docs
> Carpeta: `projects/healthy/docs/`

- [ ] **DOC-01** Generar documentación OpenAPI/Swagger de todos los endpoints del backend
- [ ] **DOC-02** Escribir guía de despliegue paso a paso (local, staging, producción)
- [ ] **DOC-03** Documentar arquitectura de la IA: cómo se construye el prompt, qué datos entran, qué JSON sale
- [ ] **DOC-04** Actualizar documentación RGPD con los flujos reales implementados (consentimiento, exportación, borrado)
- [ ] **DOC-05** Escribir README del proyecto con requisitos, instalación, variables de entorno y comandos principales
- [ ] **DOC-06** Crear `docs/architecture-web.md`: diagrama de la arquitectura AWS completa — flujo usuario → Route 53 → CloudFront → S3 (landing) y Route 53 → ALB → ECS → API → RDS/Redis (backend). Incluir decisiones de red (VPC, subnets, security groups) y estimación de costes mensuales
- [ ] **DOC-07** Crear `docs/landing-deploy.md`: guía para actualizar la landing — estructura de `landing/index.html`, tokens de diseño usados, cómo añadir secciones, proceso de despliegue manual (`aws s3 sync`) vs automático (CI en push a `main`), y cómo forzar invalidación de CloudFront
- [ ] **DOC-08** Crear `docs/landing-content.md`: guía para el equipo de marketing — secciones de la landing (hero, stats, features, manifesto, download), copy editable, cómo cambiar imágenes de mockup y actualizar CTAs sin tocar CSS

**Dependencias:** BE-01..BE-09, AI-01..AI-07, SEC-04; DOC-06 depende de DO-09..DO-13 para reflejar infraestructura real

---

## Orden de ejecución

```
Fase 1 — Infraestructura (en paralelo)
  Database (DB-01..DB-06)
  Design   (DS-01..DS-10)   ← DS-01..DS-10 ya completados
  AI       (AI-01..AI-07)

Fase 2 — Backend (depende de Fase 1)
  Backend  (BE-01..BE-10)

Fase 3 — Frontend + Seguridad (en paralelo, dependen de Fase 2)
  Frontend  (FE-01..FE-14)
  Security  (SEC-01..SEC-08)

Fase 3b — Landing infra (independiente, puede correr en paralelo con Fase 3)
  DevOps    (DO-09..DO-13)  ← bucket S3, CloudFront, DNS, pipeline landing

Fase 4 — Tests (depende de Fase 2 y 3)
  Tests    (TS-01..TS-08)

Fase 5 — DevOps + Docs (en paralelo, dependen de Fase 3 y 4)
  DevOps   (DO-01..DO-08)
  Docs     (DOC-01..DOC-08)
```

---

## Decisiones de arquitectura

| Decisión | Razonamiento |
|----------|-------------|
| Supabase para Auth | Evita implementar OTP y gestión de sesiones desde cero; RGPD-compliant |
| Redis para caché de planes IA | Los planes generados por Claude son costosos; cachear 24 h reduce coste y latencia |
| Prompt caching en Claude API | El system prompt base es fijo; cache_control reduce tokens facturados ~80 % |
| Fallback sin IA | Si Claude falla, el usuario recibe un plan genérico calculado por reglas para no bloquear el onboarding |
| MMKV para persistencia local | Más rápido que AsyncStorage; necesario para modo offline básico |
| Zod para validación | Tipado compartido entre validación en runtime y TypeScript en compilación |
| S3 + CloudFront para landing | Sitio estático sin servidor: CDN global con baja latencia, SSL gratuito vía ACM, coste < $2/mes, invalidación instantánea en cada deploy |
| Landing en `landing/index.html` | Fichero único autocontenido (sin build step) — fácil de editar por diseño/marketing y de desplegar con `aws s3 sync` |

---

## Métricas de éxito

- [ ] Cobertura de tests ≥ 80 %
- [ ] Tiempo de respuesta API < 500 ms (p95)
- [ ] App publicada en TestFlight y Google Play Internal
- [ ] Auditoría RGPD sin hallazgos críticos
- [ ] Pipeline CI/CD verde en rama `develop`
- [ ] Modo oscuro funcional en todas las pantallas
- [ ] Landing publicada en producción con SSL, dominio propio y score Lighthouse ≥ 95
- [ ] Pipeline de despliegue de landing operativo (push a `main` → S3 → CloudFront invalidation < 60 s)
