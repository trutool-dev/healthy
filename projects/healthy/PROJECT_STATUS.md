# PROJECT STATUS — Healthy App

> Archivo de estado del proyecto. El agente orquestador lo lee al iniciar cada sesión
> y lo actualiza al finalizar. Es la fuente de verdad del proyecto.
>
> Ultima actualización: 2026-08-31 | Sesión: 1f88c3c9

---

## Estado general

| Campo | Valor |
|-------|-------|
| Fase actual | Fase 10 completada — preparando release v1.0.0 |
| Rama activa | develop (sincronizada con origin) |
| Backend staging | ACTIVO — Railway Hobby ($5/mes) |
| Tests | 454/454 pasando — lineas 96.78% / branches 85.01% |
| Siguiente accion inmediata | M-2 verificar build Android + M-4 seed ejercicios + M-12 merge a main |

---

## Infraestructura

| Componente | Solucion | Estado |
|------------|----------|--------|
| Backend Node.js | Railway healthy-staging | ACTIVO — Plan Hobby |
| PostgreSQL | Railway PostgreSQL plugin | ACTIVO |
| Redis | Railway Redis plugin | ACTIVO |
| Landing page | AWS S3 + CloudFront | OK — produccion |
| CI/CD backend | GitHub Actions → Railway CLI | OK |
| App Android | EAS Build (Expo) | Build pendiente de verificar |
| App iOS | EAS Build (Expo) | Bloqueado — falta Bundle ID Apple |

**IDs Railway:**
- Proyecto: `a01d9f3d-510b-4529-b75a-d9d7198cbcb5`
- Service staging: `fa137c98-5210-4057-a531-f1c7fbf39743`
- Env staging: `1bc84954-5618-44fd-98fc-5b4190523cf0`

**Expo:**
- Cuenta: `trutool` | Project ID: `aea3d849-76a5-48a2-950f-936ee2422eee`

---

## Tareas pendientes — MANUALES (Antonio)

| ID | Tarea | Prioridad | Estado |
|----|-------|-----------|--------|
| M-1 | Actualizar Railway a plan Hobby en railway.app ($5/mes) | CRITICO | Completada |
| M-2 | Verificar build Android: `eas build:list --limit 1 --platform android` | CRITICO | Pendiente |
| M-3 | Si build falló: `eas build --platform android --profile preview` | CRITICO | Pendiente (depende M-2) |
| M-4 | Ejecutar seed de ejercicios: `node projects/healthy/database/seedExercises.js` | IMPORTANTE | Pendiente (depende M-1) |
| M-5 | Registrar Bundle ID `com.healthy.app` en developer.apple.com | IMPORTANTE | Pendiente |
| M-6 | Crear app en App Store Connect para iOS | IMPORTANTE | Pendiente (depende M-5) |
| M-7 | Instalar y probar APK en dispositivo Android real | IMPORTANTE | Pendiente (depende M-2/M-3) |
| M-8 | Publicar APK en Google Play Console → Internal Testing | IMPORTANTE | Pendiente (depende M-7) |
| M-9 | Configurar dominio `api.healthy.app` → Railway en panel DNS | PRO FINAL | Pendiente |
| M-10 | Ejecutar Lighthouse en URL CloudFront de la landing | PRO FINAL | Pendiente |
| M-11 | Re-ejecutar tests CP-01 a CP-10 contra staging activo | PRO FINAL | Pendiente (depende M-1) |
| M-12 | Aprobar y mergear PR develop → main en GitHub | RELEASE | Pendiente |
| M-13 | Crear tag v1.0.0: `git tag v1.0.0 && git push origin v1.0.0` | RELEASE | Pendiente (depende M-12) |

## Tareas pendientes — AUTOMATICAS (agentes)

| ID | Tarea | Agente | Estado | Depende de |
|----|-------|--------|--------|------------|
| A-1 | Mejorar branch coverage de 69.57% a 80%+ | Tests Agent | Completada — 85.01% / 454 tests | Nada |
| A-2 | Build iOS en EAS: `eas build --platform ios --profile preview` | DevOps Agent | Pendiente | M-5, M-6 |
| A-3 | Subir a TestFlight: `eas submit --platform ios` | DevOps Agent | Pendiente | A-2 |
| A-4 | Deploy a Railway tras merge a main | CI/CD GitHub Actions | Pendiente | M-12 |
| A-5 | Generar documentacion API (Swagger/OpenAPI) con endpoint /exercises | Docs Agent | Completada — swagger.yaml 40 endpoints | Nada |

---

## Checklist Go-live

| Criterio | Objetivo | Estado |
|----------|----------|--------|
| Tests lineas | >= 80% | OK — 96.78% |
| Tests branches | >= 80% | OK — 85.01% |
| Lighthouse landing | >= 95 | PENDIENTE |
| App Android Google Play Internal | Publicada | PENDIENTE |
| App iOS TestFlight | Publicada | PENDIENTE |
| Backend staging operativo | Activo | OK — Railway Hobby activo |
| Seed 1.324 ejercicios ejecutado | Completo | PENDIENTE — ejecutar M-4 |
| Tag v1.0.0 | Creado | PENDIENTE |

---

## Historial de fases completadas

| Fase | Descripcion | Commit | Fecha |
|------|-------------|--------|-------|
| Fase 1-4 | Auth, onboarding, planes, entrenamiento | — | 2026-06 |
| Fase 5 | Deploy Railway staging | — | 2026-07 |
| Fase 6 | Variables de entorno Railway | — | 2026-07 |
| Fase 7 | Tests 253/253 — cobertura 88.21% | — | 2026-07 |
| Fase 8 | Build Android (EAS) | — | 2026-07 |
| Fase 9 | Entregables de evaluacion AI | — | 2026-07 |
| Fase 10 | Integracion 1.324 ejercicios reales | 40bdb9d | 2026-08-28 |

### Fase 10 — Detalle tecnico (2026-08-28)

- `exerciseSelector.service.js`: filtra ejercicios por equipamiento, objetivo, dificultad y lesiones (hasta 80 por peticion)
- `GET /exercises`: endpoint nuevo con filtros category, equipment, difficulty, target, limit, offset
- `buildUserContextPrompt`: acepta parametro exercises[] — Claude usa SOLO ejercicios del catalogo real
- Schema Exercise: 11 campos nuevos (externalId, category, bodyPart, target, secondaryMuscles, instructionsEs/En, gifUrl, thumbnailUrl, equipment, createdAt)
- Seed: `node projects/healthy/database/seedExercises.js` — descarga desde GitHub, batch 100, skipDuplicates
- 64 tests nuevos → total 317/317

---

## Notas tecnicas para el orquestador

- `railway up` y `git` siempre desde RAIZ del repo: `c:\Users\Antonio\Documents\ai-studio`
- DATABASE_URL y REDIS_URL: URLs directas (no templates `${{...}}`)
- `jest.config.js` tiene `modulePaths: ['<rootDir>/node_modules']` — no eliminar
- Prisma 7: `prisma-client-js`, cliente generado en `src/generated/prisma/`
- Discrepancia pendiente: brief dice "-500 kcal/dia", codigo implementa "80% TDEE"
- Mocks en `backend/src/__mocks__/` — tests funcionan sin infraestructura local

---

## Instrucciones para el orquestador

### Al INICIAR sesion
1. Leer este archivo para conocer el estado actual del proyecto
2. Preguntar a Antonio qué tareas manuales ha completado desde la ultima sesion
3. Actualizar los estados correspondientes en este archivo
4. Proponer el plan de trabajo para la sesion basandose en las tareas pendientes

### Al FINALIZAR sesion
1. Actualizar el estado de cada tarea trabajada (Pendiente → En curso / Completada)
2. Actualizar la seccion "Estado general" con la fecha y sesion actuales
3. Anotar cualquier nuevo bloqueante o deuda tecnica descubierta
4. Actualizar tambien `C:\Users\Antonio\.claude\projects\c--Users-Antonio-Documents-ai-studio\memory\current_status.md`
