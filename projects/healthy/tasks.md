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
| Cloud       | AWS                                    |
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

- [ ] **DB-01** Ejecutar `prisma migrate dev` y verificar que todas las migraciones aplican sin errores en local
- [ ] **DB-02** Crear script de seed con datos de prueba realistas (usuarios, planes, alimentos, ejercicios)
- [ ] **DB-03** Añadir índices en columnas de alta consulta: `user_id`, `created_at`, `date` en tablas de logs y progreso
- [ ] **DB-04** Configurar Redis: TTL para caché de planes IA (24 h) y sesiones JWT (refresh token store)
- [ ] **DB-05** Verificar integridad referencial y constraints en toda la schema
- [ ] **DB-06** Documentar ERD actualizado en `database/ERD.md`

**Dependencias:** ninguna — es el primer paso

---

### Backend
> Carpeta: `projects/healthy/backend/`

- [ ] **BE-01** Implementar lógica real de autenticación: registro, verificación OTP por email (Supabase), login JWT, refresh token y recuperación de contraseña
- [ ] **BE-02** Implementar endpoint `POST /onboarding` que guarda los 7 pasos y dispara la generación del plan IA
- [ ] **BE-03** Implementar endpoints de entrenamiento: obtener sesión del día, registrar serie (peso + reps), completar sesión
- [ ] **BE-04** Implementar endpoints de nutrición: plan del día, registro de comidas, búsqueda de alimentos (integrar Open Food Facts API o similar), escáner de código de barras
- [ ] **BE-05** Implementar endpoints de progreso: registro de peso/medidas, subida de fotos, gráficas y logros
- [ ] **BE-06** Implementar endpoints de logs diarios: agua, sueño, pasos, energía, ánimo
- [ ] **BE-07** Añadir middleware de validación (Zod) en todos los endpoints con request body
- [ ] **BE-08** Implementar rate limiting en endpoints de autenticación (máx. 5 intentos/min)
- [ ] **BE-09** Conectar caché Redis para planes IA y respuestas de búsqueda de alimentos
- [ ] **BE-10** Verificar que todos los endpoints responden < 500 ms bajo carga normal

**Dependencias:** DB-01, DB-02, AI-01

---

### AI
> Carpeta: `projects/healthy/ai/`

- [ ] **AI-01** Implementar prompt de generación de plan personalizado usando los datos del onboarding (complexión, edad, peso, objetivo, estilo de vida, preferencias, restricciones, salud)
- [ ] **AI-02** Incluir cálculo de TMB y TDEE con fórmula Mifflin-St Jeor en el contexto enviado a Claude
- [ ] **AI-03** Estructurar la respuesta de Claude en JSON tipado: `{ training_plan, nutrition_plan, macros, weekly_schedule }`
- [ ] **AI-04** Implementar lógica de regeneración automática del plan cuando el progreso indica estancamiento (> 2 semanas sin avance)
- [ ] **AI-05** Añadir prompt caching (Anthropic cache_control) para el system prompt base y reducir latencia y coste
- [ ] **AI-06** Implementar fallback si la API de Claude falla: retornar plan genérico calculado por reglas
- [ ] **AI-07** Logs de uso de tokens por usuario para monitorización de costes

**Dependencias:** DB-04 (Redis para caché de planes)

---

### Frontend
> Carpeta: `projects/healthy/frontend/`

- [ ] **FE-01** Configurar cliente HTTP (Axios o fetch) con base URL desde variable de entorno y interceptor de token JWT
- [ ] **FE-02** Implementar flujo de autenticación completo: conectar pantallas de registro, OTP, contraseña, login y recuperación al backend real
- [ ] **FE-03** Conectar onboarding (7 pasos) al endpoint `POST /onboarding` y navegar al plan generado
- [ ] **FE-04** Conectar pantalla de entrenamiento: cargar sesión del día, registrar series y completar sesión
- [ ] **FE-05** Conectar pantalla de nutrición: plan del día, búsqueda de alimentos y registro de comidas con macros en tiempo real
- [ ] **FE-06** Conectar pantalla de progreso: subida de fotos, gráficas y logros
- [ ] **FE-07** Conectar logs diarios: formulario y guardado
- [ ] **FE-08** Implementar estado global con Zustand o Context: user profile, plan, daily logs
- [ ] **FE-09** Implementar persistencia local (MMKV o AsyncStorage) para tokens y datos offline básicos
- [ ] **FE-10** Soporte modo oscuro completo usando NativeWind y tokens de diseño
- [ ] **FE-11** Loading states y manejo de errores en todas las pantallas (skeleton loaders, toasts)
- [ ] **FE-12** Accesibilidad WCAG AA: etiquetas accessibilityLabel, contraste, tamaños mínimos táctiles

**Dependencias:** BE-01..BE-09, DS-01

---

### Design
> Carpeta: `projects/healthy/design/`

- [ ] **DS-01** Auditoría del sistema de diseño actual: verificar que todos los tokens (color, spacing, tipografía) están aplicados consistentemente en las pantallas
- [ ] **DS-02** Definir paleta de colores modo oscuro y tokens correspondientes en NativeWind
- [ ] **DS-03** Revisar onboarding: flujo de 7 pasos visualmente coherente, barra de progreso, transiciones
- [ ] **DS-04** Revisar pantalla de plan diario: jerarquía visual clara entre entrenamiento y nutrición
- [ ] **DS-05** Diseñar estados vacíos (sin datos aún) y estados de error para todas las pantallas principales
- [ ] **DS-06** Validar accesibilidad visual: contraste mínimo 4.5:1 en texto normal, 3:1 en texto grande

**Dependencias:** ninguna (puede trabajar en paralelo con Backend)

---

### Tests
> Carpeta: `projects/healthy/tests/`

- [ ] **TS-01** Auditar los 217 tests existentes: identificar qué módulos tienen cobertura < 80 %
- [ ] **TS-02** Añadir tests unitarios para la lógica de cálculo TMB/TDEE/macros en el agente IA
- [ ] **TS-03** Añadir tests de integración para los endpoints de autenticación con base de datos real (no mocks)
- [ ] **TS-04** Añadir tests de integración para el flujo onboarding → generación de plan
- [ ] **TS-05** Añadir tests E2E con Playwright (o Detox para móvil) para el flujo crítico: registro → onboarding → ver plan → registrar sesión
- [ ] **TS-06** Añadir tests de integración para endpoints de nutrición y progreso
- [ ] **TS-07** Configurar informe de cobertura en CI y fallar el pipeline si cae del 80 %
- [ ] **TS-08** Tests de carga básicos en los endpoints más pesados (generación de plan IA)

**Dependencias:** BE-01..BE-09, AI-01..AI-07 (para tests de integración reales)

---

### Security
> Carpeta: `projects/healthy/security/`

- [ ] **SEC-01** Auditar que todas las variables de entorno sensibles (DB, Redis, Claude API key, Supabase, JWT secret) están en `.env` y **nunca** en el repositorio
- [ ] **SEC-02** Revisar headers HTTP: añadir Helmet.js con CSP, HSTS, X-Frame-Options
- [ ] **SEC-03** Verificar que los datos de salud del usuario (condiciones médicas, métricas corporales) están cifrados at-rest o marcados como sensibles en el schema
- [ ] **SEC-04** Auditoría RGPD: verificar flujo de consentimiento, derecho al olvido (endpoint `DELETE /user`), exportación de datos (`GET /user/export`)
- [ ] **SEC-05** Revisar que los tokens JWT tienen expiración correcta (access: 15 min, refresh: 30 días) y rotación en cada uso
- [ ] **SEC-06** Validar que el rate limiting está activo en todos los endpoints públicos
- [ ] **SEC-07** Revisar política de contraseñas: mínimo 8 caracteres, sin restricciones absurdas, bcrypt con salt ≥ 12
- [ ] **SEC-08** Generar informe de auditoría en `security/audit-report.md`

**Dependencias:** BE-01..BE-09 (para auditar endpoints reales)

---

### DevOps
> Carpeta: `projects/healthy/devops/`

- [ ] **DO-01** Crear `.env.example` completo con todas las variables necesarias y sus descripciones
- [ ] **DO-02** Configurar secretos reales en GitHub Actions (CI/CD): DB_URL, REDIS_URL, CLAUDE_API_KEY, SUPABASE keys, AWS credentials
- [ ] **DO-03** Configurar entorno de staging en AWS: RDS (PostgreSQL), ElastiCache (Redis), ECS o EC2 para la API
- [ ] **DO-04** Configurar pipeline de despliegue automático a staging en merge a `develop`
- [ ] **DO-05** Configurar Expo EAS Build para generar builds de iOS y Android en CI
- [ ] **DO-06** Configurar Expo EAS Submit para enviar a TestFlight (iOS) y Google Play Internal (Android)
- [ ] **DO-07** Añadir health check endpoint `GET /health` y configurar monitorización básica (UptimeRobot o AWS CloudWatch)
- [ ] **DO-08** Configurar backups automáticos diarios de la base de datos en S3

**Dependencias:** SEC-01 (variables de entorno auditadas antes de configurar CI)

---

### Docs
> Carpeta: `projects/healthy/docs/`

- [ ] **DOC-01** Generar documentación OpenAPI/Swagger de todos los endpoints del backend
- [ ] **DOC-02** Escribir guía de despliegue paso a paso (local, staging, producción)
- [ ] **DOC-03** Documentar arquitectura de la IA: cómo se construye el prompt, qué datos entran, qué JSON sale
- [ ] **DOC-04** Actualizar documentación RGPD con los flujos reales implementados (consentimiento, exportación, borrado)
- [ ] **DOC-05** Escribir README del proyecto con requisitos, instalación, variables de entorno y comandos principales

**Dependencias:** BE-01..BE-09, AI-01..AI-07, SEC-04

---

## Orden de ejecución

```
Fase 1 — Infraestructura (en paralelo)
  Database (DB-01..DB-06)
  Design   (DS-01..DS-06)
  AI       (AI-01..AI-07)

Fase 2 — Backend (depende de Fase 1)
  Backend  (BE-01..BE-10)

Fase 3 — Frontend + Seguridad (en paralelo, dependen de Fase 2)
  Frontend  (FE-01..FE-12)
  Security  (SEC-01..SEC-08)

Fase 4 — Tests (depende de Fase 2 y 3)
  Tests    (TS-01..TS-08)

Fase 5 — DevOps + Docs (en paralelo, dependen de Fase 3 y 4)
  DevOps   (DO-01..DO-08)
  Docs     (DOC-01..DOC-05)
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

---

## Métricas de éxito

- [ ] Cobertura de tests ≥ 80 %
- [ ] Tiempo de respuesta API < 500 ms (p95)
- [ ] App publicada en TestFlight y Google Play Internal
- [ ] Auditoría RGPD sin hallazgos críticos
- [ ] Pipeline CI/CD verde en rama `develop`
- [ ] Modo oscuro funcional en todas las pantallas
