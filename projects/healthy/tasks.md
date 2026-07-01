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

---

## PRs hacia v1.0.0

> Estas PRs son la hoja de ruta final para llevar Healthy a producción.
> El orquestador coordina; cada agente trabaja exclusivamente en su carpeta asignada.
> Fuente de análisis: `projects/healthy/PR_PLAN.md` (2026-06-15).

### Orden de ejecución

```
PR-1 (backend)   PR-2 (database)   PR-3 (docs)
     │                 │                │
     ▼                 ▼                │
PR-4 (backend)   PR-5 (devops)         │
     │                 │                │
     └────────┬─────────┘────────────────┘
              ▼
       PR-6 (orquestador — go-live)
```

PR-1, PR-2 y PR-3 no tienen dependencias entre sí y pueden abrirse en paralelo.
PR-4 depende de PR-1. PR-5 depende de PR-2. PR-6 bloquea hasta que las cinco anteriores estén mergeadas.

---

### PR-1 — `refactor: eliminar archivos duplicados`

**Agente responsable:** backend  
**Carpeta de trabajo:** `projects/healthy/backend/`  
**Riesgo:** MEDIO — los archivos camelCase contienen lógica más completa que los dot.notation activos; hay riesgo de pérdida de funcionalidad si no se migra antes de eliminar.

#### Tareas ordenadas

1. **CLEAN-06** Auditar `response.util.js` contra `response.js` y ampliar `response.util.js` con las 6 funciones faltantes: `sendCreated`, `sendNotFound`, `sendUnauthorized`, `sendForbidden`, `sendValidationError`, `sendServerError`. Sin este paso no se puede eliminar nada más.
2. **CLEAN-01** Comparar cada par camelCase / dot.notation en `controllers/`. Para cada endpoint que exista en el camelCase pero no en el dot.notation, migrar la lógica al dot.notation. Controladores a eliminar tras migración: `authController.js`, `logsController.js`, `nutritionController.js`, `onboardingController.js`, `planController.js`, `progressController.js`, `trainingController.js`.
3. **CLEAN-02** Eliminar middleware muerto: `middleware/auth.js`, `middleware/errorHandler.js`.
4. **CLEAN-03** Migrar `planRegenerateLimiter` (y `apiLimiter` si se usa en algún punto) a `rateLimiter.middleware.js`. Actualizar `plans.routes.js` para importar desde `rateLimiter.middleware`. Eliminar `middleware/rateLimiter.js`.
5. **CLEAN-05** Eliminar `services/emailService.js`, `utils/logger.js`, `utils/response.js`, `utils/prismaClient.js`.
6. Ejecutar `npm test` en `backend/` para verificar que ningún test rompe tras las eliminaciones.

#### Archivos a tocar

```
backend/src/utils/response.util.js              (MODIFICAR — ampliar con funciones faltantes)
backend/src/controllers/auth.controller.js      (MODIFICAR — incorporar handlers faltantes)
backend/src/controllers/logs.controller.js      (MODIFICAR si falta algún handler)
backend/src/controllers/nutrition.controller.js (MODIFICAR si falta algún handler)
backend/src/controllers/onboarding.controller.js (MODIFICAR si falta algún handler)
backend/src/controllers/plans.controller.js     (MODIFICAR si falta algún handler)
backend/src/controllers/progress.controller.js  (MODIFICAR si falta algún handler)
backend/src/controllers/training.controller.js  (MODIFICAR si falta algún handler)
backend/src/middleware/rateLimiter.middleware.js (MODIFICAR — añadir planRegenerateLimiter)
backend/src/routes/plans.routes.js              (MODIFICAR — actualizar import rateLimiter)
backend/src/controllers/authController.js       (ELIMINAR)
backend/src/controllers/logsController.js       (ELIMINAR)
backend/src/controllers/nutritionController.js  (ELIMINAR)
backend/src/controllers/onboardingController.js (ELIMINAR)
backend/src/controllers/planController.js       (ELIMINAR)
backend/src/controllers/progressController.js   (ELIMINAR)
backend/src/controllers/trainingController.js   (ELIMINAR)
backend/src/middleware/auth.js                  (ELIMINAR)
backend/src/middleware/errorHandler.js          (ELIMINAR)
backend/src/middleware/rateLimiter.js           (ELIMINAR)
backend/src/services/emailService.js            (ELIMINAR)
backend/src/utils/logger.js                     (ELIMINAR)
backend/src/utils/response.js                   (ELIMINAR)
backend/src/utils/prismaClient.js               (ELIMINAR)
```

> **Nota:** `middleware/validate.js` (Zod) se mantiene sin tocar hasta que PR-4 decida la estrategia de validación.

#### Criterios de aceptación (merge gate)

- [ ] `npm test` en `backend/` pasa al 100 % (ningún test roto)
- [ ] `GET /health` devuelve `200 {"success": true}`
- [ ] Flujo auth completo funciona: `register → verify-email → set-password → login → me → logout`
- [ ] No existe ningún `import` o `require` apuntando a los archivos eliminados (verificar con `grep -r "authController\|logsController\|emailService\|prismaClient" backend/src`)
- [ ] `response.util.js` exporta las 8 funciones (2 originales + 6 nuevas)

#### Dependencias

- Ninguna. Puede abrirse en paralelo con PR-2 y PR-3.
- PR-4 no puede empezar hasta que esta PR esté mergeada.

---

### PR-2 — `feat: migración Prisma pendiente`

**Agente responsable:** database  
**Carpeta de trabajo:** `projects/healthy/database/` y `projects/healthy/backend/prisma/`  
**Riesgo:** MEDIO — modifica el schema de base de datos; requiere PostgreSQL disponible y coordinación con staging.

#### Tareas ordenadas

1. **INFRA-01a** Verificar el estado actual de migraciones: ejecutar `npx prisma migrate status --schema ../database/schema.prisma` desde `backend/`. Comprobar si la migración `20260608184928_add_token_usage_logs_and_health_consent` está aplicada o solo existe en fichero.
2. **INFRA-01b** Si el schema en `backend/prisma/schema.prisma` aún no incluye `TokenUsageLog` y `health_consent_given_at`, añadirlos. Referencia: notas de BE-07 (`token_usage_logs`) y SEC-04 (`health_consent_given_at`).
3. **DB-01** Ejecutar `npx prisma migrate dev --schema ../database/schema.prisma --name add_token_usage_logs_and_health_consent` para generar y aplicar la migración en local. Commitear el directorio `prisma/migrations/` generado.
4. Documentar en `database/MIGRATION_LOG.md`: fecha de ejecución, nombre de la migración, campos añadidos, procedimiento de rollback (`prisma migrate reset` en local; en producción restaurar desde snapshot pre-deploy).
5. Actualizar `database/ERD.md` añadiendo la entidad `TokenUsageLog` al diagrama Mermaid y el campo `health_consent_given_at` en la entidad `User`.
6. Ejecutar `npx prisma validate` para confirmar que el schema es consistente.
7. Ejecutar `npx ts-node database/seed.ts` para verificar que el seed no rompe con el schema actualizado.

#### Archivos a tocar

```
backend/prisma/schema.prisma                                    (MODIFICAR si faltan campos)
backend/prisma/migrations/<timestamp>_add_token_usage_logs/     (CREAR — generado por Prisma)
database/MIGRATION_LOG.md                                       (MODIFICAR — documentar)
database/ERD.md                                                 (MODIFICAR — añadir TokenUsageLog)
```

#### Criterios de aceptación (merge gate)

- [ ] `npx prisma migrate status` muestra todas las migraciones como `Applied`
- [ ] `npx prisma validate` sin errores
- [ ] `npx ts-node database/seed.ts` ejecuta sin errores
- [ ] `database/MIGRATION_LOG.md` documenta la migración con procedimiento de rollback
- [ ] `database/ERD.md` actualizado con los nuevos campos

#### Dependencias

- Ninguna. Puede abrirse en paralelo con PR-1 y PR-3.
- PR-5 no puede empezar hasta que esta PR esté mergeada (la infra de producción necesita el schema final).

---

### PR-3 — `docs: documentación técnica completa`

**Agente responsable:** docs  
**Carpeta de trabajo:** `projects/healthy/docs/`  
**Riesgo:** BAJO — solo documentación, no modifica código ejecutable.

#### Tareas ordenadas

1. **DOC-05** `docs/README.md` (o README en raíz del proyecto): requisitos previos, instrucciones de instalación, variables de entorno necesarias, comandos principales (`npm run dev`, `npm test`, `npx prisma migrate dev`). Este es el punto de entrada para cualquier desarrollador nuevo.
2. **DOC-01** `docs/api-reference.md`: documentación de todos los endpoints agrupados por dominio (auth, onboarding, plans, training, nutrition, progress, logs, foods, user, health). Para cada endpoint: método, ruta, descripción, body/params, respuesta exitosa, errores posibles. Fuente: `backend/src/routes/`.
3. **DOC-03** `docs/ai-architecture.md`: cómo se construye el prompt en `ai/planGenerator.ts`, qué datos de onboarding entran (7 dimensiones + TMB/TDEE calculados), qué estructura JSON devuelve Claude (`GeneratedPlan`), cómo funciona el prompt caching (`cache_control: ephemeral`) y el fallback genérico.
4. **DOC-04** `docs/rgpd-compliance.md`: flujos reales implementados — consentimiento (`health_consent_given_at`), verificación de edad (16 años), exportación de datos (`GET /user/me/export`, Art. 20), borrado (`DELETE /user/me`, Art. 17). Referenciar `security/SECURITY_AUDIT.md`.
5. **DOC-02** `docs/deployment-guide.md`: guía paso a paso para los tres entornos. Local: prerequisitos, variables de entorno, migraciones, seed, arrancar backend y frontend. Staging: workflow `deploy-staging.yml`, secretos GitHub necesarios, URL de verificación. Producción: pasos adicionales, backup pre-deploy, tag `v*.*.*` para disparar `eas-submit.yml`.
6. **DOC-06** `docs/architecture-web.md`: diagrama ASCII o Mermaid de la arquitectura AWS completa — flujo usuario → Route 53 → CloudFront → S3 (landing) y Route 53 → ALB → ECS → API → RDS/Redis (backend). Decisiones de red (VPC, subnets, security groups) y estimación de costes mensuales. Fuente: `devops/infrastructure/staging.md`, `devops/ENV_VARS.md`.
7. **DOC-07** `docs/landing-deploy.md`: guía para actualizar la landing — estructura de `landing/index.html`, tokens de diseño usados, cómo añadir secciones, despliegue manual (`aws s3 sync`) vs automático (CI en push a `main`), y cómo forzar invalidación de CloudFront.
8. **DOC-08** `docs/landing-content.md`: guía para el equipo de marketing — secciones de la landing (hero, stats, features, manifesto, download), copy editable, cómo cambiar imágenes de mockup y actualizar CTAs sin tocar CSS.

#### Archivos a tocar

```
docs/README.md              (CREAR)
docs/api-reference.md       (CREAR)
docs/ai-architecture.md     (CREAR)
docs/rgpd-compliance.md     (CREAR)
docs/deployment-guide.md    (CREAR)
docs/architecture-web.md    (CREAR)
docs/landing-deploy.md      (CREAR)
docs/landing-content.md     (CREAR)
```

#### Criterios de aceptación (merge gate)

- [ ] Los 8 documentos existen y no están vacíos
- [ ] `docs/api-reference.md` cubre los 10 dominios de endpoints
- [ ] `docs/deployment-guide.md` incluye los tres entornos (local, staging, producción)
- [ ] `docs/rgpd-compliance.md` referencia los artículos 17 y 20 con los endpoints reales
- [ ] `docs/architecture-web.md` incluye estimación de costes mensuales AWS
- [ ] Ningún documento referencia archivos que no existen en el repo (links rotos)

#### Dependencias

- Ninguna. Puede abrirse en paralelo con PR-1 y PR-2.
- Depende conceptualmente de que BE-01..BE-09 y DO-09..DO-13 estén completos para reflejar la realidad — ambos ya están marcados como `[x]` en `tasks.md`.
- PR-6 no puede cerrarse hasta que esta PR esté mergeada.

---

### PR-4 — `refactor: unificar validación Zod/express-validator`

**Agente responsable:** backend  
**Carpeta de trabajo:** `projects/healthy/backend/`  
**Riesgo:** MEDIO — afecta a todas las rutas activas; un error en la validación rompe el flujo de auth.

#### Decisión de arquitectura

**Se adopta express-validator como estrategia única.** Razonamiento: ya está integrado en todas las rutas activas a través de `validate.middleware.js`. Migrar a Zod requeriría reescribir todas las rutas sin beneficio inmediato para v1.0.0. `validate.js` (con los schemas Zod) se elimina; si en el futuro se quiere Zod, se reintroduce desde cero con un diseño limpio.

#### Tareas ordenadas

1. Verificar que `validate.js` (Zod) no es importado desde ninguna ruta activa: `grep -r "validate.js\|from.*validate'" backend/src/routes/`.
2. Auditar `validate.middleware.js`: comprobar que el helper `validate` (express-validator) cubre todos los endpoints. Si hay rutas sin validación, añadir los schemas inline en la ruta correspondiente.
3. Asegurar que todos los endpoints devuelven errores de validación en formato uniforme: `{ success: false, error: 'VALIDATION_ERROR', details: [...] }`. Corregir los que no cumplan.
4. Eliminar `middleware/validate.js`.
5. Ejecutar suite completa de tests para confirmar que ningún test de auth o integración rompe.

#### Archivos a tocar

```
backend/src/middleware/validate.js            (ELIMINAR)
backend/src/middleware/validate.middleware.js (MODIFICAR — posibles ampliaciones de schemas)
backend/src/routes/auth.routes.js            (REVISAR — confirmar validaciones completas)
backend/src/routes/onboarding.routes.js      (REVISAR)
backend/src/routes/plans.routes.js           (REVISAR)
backend/src/routes/training.routes.js        (REVISAR)
backend/src/routes/nutrition.routes.js       (REVISAR)
backend/src/routes/progress.routes.js        (REVISAR)
backend/src/routes/logs.routes.js            (REVISAR)
```

#### Criterios de aceptación (merge gate)

- [ ] `middleware/validate.js` no existe en el repositorio
- [ ] `grep -r "validate.js" backend/src` devuelve 0 resultados
- [ ] Todos los tests de integración de auth pasan: `tests/integration/auth.test.js`
- [ ] Los errores de validación devuelven `400` con `error: 'VALIDATION_ERROR'` en todos los endpoints
- [ ] `npm test` en `backend/` pasa al 100 %

#### Dependencias

- **Requiere PR-1 mergeada** — los archivos camelCase eliminados en PR-1 también importaban `validate.js`; si PR-1 no está mergeada, al eliminar `validate.js` en PR-4 podría haber imports rotos en archivos que aún existen.
- PR-6 no puede cerrarse hasta que esta PR esté mergeada.

---

### PR-5 — `chore: pipeline CI/CD y vars producción`

**Agente responsable:** devops  
**Carpeta de trabajo:** `projects/healthy/devops/` y `.github/workflows/`  
**Riesgo:** ALTO — toca configuración de producción; un error aquí puede dejar staging/producción inaccesible.

#### Tareas ordenadas

1. Verificar que todos los secretos listados en `devops/GITHUB_SECRETS.md` están cargados en GitHub Actions para los entornos `staging` y `production`. Documentar en `devops/SECRETS_STATUS.md` cuáles están configurados y cuáles faltan.
2. Revisar `backend/.env.example` contra `devops/ENV_VARS.md`: confirmar que no hay variables documentadas que falten en el `.env.example`. Actualizar si hay discrepancias.
3. Hacer un dry-run completo del workflow `deploy-staging.yml`: job `test` (cobertura ≥ 80 %) → job `build` (imagen ECR) → job `deploy` (ECS) → job `smoke-test` (`GET /health` con retry). Documentar el resultado en `devops/PIPELINE_DRYRUN.md`.
4. Verificar que el workflow `eas-build.yml` compila la app móvil correctamente para el perfil `preview`. Registrar resultado.
5. Confirmar que `deploy-landing.yml` sincroniza `landing/` con S3 (`healthy-landing-prod`) y lanza invalidación CloudFront. Verificar que la landing carga en la URL de staging con SSL válido.
6. Ejecutar backup pre-go-live según `devops/BACKUP_STRATEGY.md` (snapshot RDS manual). Documentar el ARN del snapshot en `devops/PIPELINE_DRYRUN.md`.
7. Si se detectan ajustes necesarios en los workflows (variables hardcodeadas, nombres de secrets incorrectos, etc.), corregirlos y commitear.

#### Archivos a tocar

```
devops/SECRETS_STATUS.md                            (CREAR — estado de cada secret)
devops/PIPELINE_DRYRUN.md                           (CREAR — resultados del dry-run)
.github/workflows/deploy-staging.yml               (MODIFICAR si hay ajustes necesarios)
.github/workflows/deploy-landing.yml               (MODIFICAR si hay ajustes necesarios)
.github/workflows/eas-build.yml                    (MODIFICAR si hay ajustes necesarios)
backend/.env.example                                (MODIFICAR si hay variables faltantes)
devops/ENV_VARS.md                                  (MODIFICAR si hay variables faltantes)
```

#### Criterios de aceptación (merge gate)

- [ ] Pipeline staging verde de extremo a extremo (test → build → deploy → smoke-test)
- [ ] `GET https://<staging-url>/health` devuelve `{"success": true}`
- [ ] Landing carga en URL de staging con SSL válido y sin errores de consola
- [ ] Backup de base de datos (snapshot RDS) confirmado y ARN documentado
- [ ] `devops/SECRETS_STATUS.md` confirma que todos los secrets están configurados
- [ ] `eas-build.yml` compila sin errores para el perfil `preview`

#### Dependencias

- **Requiere PR-2 mergeada** — el schema de base de datos debe estar en su estado final antes de configurar el entorno de producción; de lo contrario, el ECS apuntaría a un schema desactualizado.
- PR-6 no puede cerrarse hasta que esta PR esté mergeada.

---

### PR-6 — `chore: verificación final go-live v1.0.0`

**Agente responsable:** orquestador  
**Carpeta de trabajo:** `projects/healthy/` (nivel raíz del proyecto)  
**Riesgo:** ALTO — es la última barrera antes del go-live. No mergear si algún criterio no se cumple.

#### Condición de entrada

Esta PR solo puede abrirse cuando PR-1, PR-2, PR-3, PR-4 y PR-5 estén todas mergeadas en `main`.

#### Tareas ordenadas

1. **METRICS-01a** Ejecutar la suite completa de tests con cobertura: `npm test --coverage` desde `backend/`. Verificar cobertura ≥ 80 %. Si no se alcanza, bloquear el go-live y reportar al agente tests.
2. **METRICS-01b** Ejecutar tests de carga: `node tests/load/planGeneration.js`. Verificar p95 < 500 ms. Documentar resultado en `docs/LOAD_TEST_FINAL.md`.
3. **METRICS-01c** Ejecutar auditoría Lighthouse en la landing de staging. Verificar score ≥ 95 en Performance, Accessibility, Best Practices, SEO. Documentar en `docs/LIGHTHOUSE_FINAL.md`.
4. Revisar `security/SECURITY_AUDIT.md` y `security/VULNERABILITIES.md`. Confirmar que no hay hallazgos con severidad `CRITICAL` o `HIGH` abiertos. Si los hay, bloquear el go-live y reportar al agente security.
5. Confirmar que la migración Prisma del PR-2 está aplicada en el entorno de producción (no solo en staging): `npx prisma migrate status` contra la base de datos de producción.
6. Confirmar que la app está disponible en TestFlight (iOS) y en Google Play Internal Testing (Android) mediante el workflow `eas-submit.yml` disparado por el tag `v1.0.0`.
7. Actualizar `tasks.md`: marcar todas las métricas de éxito como `[x]`.
8. Actualizar `ORCHESTRATOR_STATUS.log` cerrando el proyecto con reporte final: fecha, versión, métricas alcanzadas, issues pendientes para v1.1.0.
9. Crear tag `v1.0.0` en el repositorio y verificar que `eas-submit.yml` se dispara correctamente.

#### Archivos a tocar

```
tasks.md                        (MODIFICAR — marcar métricas de éxito como [x])
ORCHESTRATOR_STATUS.log         (MODIFICAR — reporte final de cierre)
docs/LOAD_TEST_FINAL.md         (CREAR — resultados de tests de carga finales)
docs/LIGHTHOUSE_FINAL.md        (CREAR — resultados Lighthouse finales)
```

#### Criterios de aceptación (merge gate — todos obligatorios)

- [ ] Cobertura de tests ≥ 80 % (evidencia: salida de `npm test --coverage`)
- [ ] API p95 < 500 ms bajo carga (evidencia: `docs/LOAD_TEST_FINAL.md`)
- [ ] Landing Lighthouse ≥ 95 en los 4 indicadores (evidencia: `docs/LIGHTHOUSE_FINAL.md`)
- [ ] Sin hallazgos de seguridad `CRITICAL` o `HIGH` abiertos en `security/SECURITY_AUDIT.md`
- [ ] Migración Prisma aplicada en producción (`prisma migrate status` muestra `Applied`)
- [ ] App disponible en TestFlight (iOS)
- [ ] App disponible en Google Play Internal Testing (Android)
- [ ] Tag `v1.0.0` creado y visible en el repositorio
- [ ] `tasks.md` con todas las métricas de éxito marcadas `[x]`

#### Dependencias

- **Requiere PR-1, PR-2, PR-3, PR-4 y PR-5 mergeadas** — sin excepción.

---

### Resumen de PRs

| PR | Título | Agente | Riesgo | Depende de |
|---|---|---|---|---|
| **PR-1** | `refactor: eliminar archivos duplicados` | backend | MEDIO | — |
| **PR-2** | `feat: migración Prisma pendiente` | database | MEDIO | — |
| **PR-3** | `docs: documentación técnica completa` | docs | BAJO | — |
| **PR-4** | `refactor: unificar validación Zod/express-validator` | backend | MEDIO | PR-1 |
| **PR-5** | `chore: pipeline CI/CD y vars producción` | devops | ALTO | PR-2 |
| **PR-6** | `chore: verificación final go-live v1.0.0` | orquestador | ALTO | PR-1, PR-2, PR-3, PR-4, PR-5 |

> **Decisiones de orquestador documentadas:**
> - PR-4 adopta express-validator como estrategia única de validación (Zod queda descartado para v1.0.0).
> - `middleware/validate.js` (Zod) se elimina en PR-4 y no en PR-1 para mantener las PRs atómicas y reducir el riesgo de PR-1.
> - PR-6 la ejecuta el orquestador (no un agente especializado) porque implica verificación cruzada de todos los dominios y la decisión final de go-live.
