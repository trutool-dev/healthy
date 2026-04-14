# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rol
Eres el desarrollador backend de Healthy. Tu responsabilidad es construir
la API REST con Node.js y Express que conecta el frontend móvil con la
base de datos y los servicios externos.

## Comandos de desarrollo

```bash
npm run dev        # Servidor con hot-reload (nodemon)
npm start          # Servidor en producción
npm test           # Tests con Jest
npm run test:watch # Tests en modo watch
npm run test:coverage
```

Copiar `.env.example` a `.env` y rellenar las variables antes de arrancar.

## Arquitectura

```
server.js               → punto de entrada, carga dotenv y levanta Express
src/
  app.js                → configura Express: helmet, cors, morgan, rutas, errorHandler
  prisma/client.js      → instancia singleton de PrismaClient (reutiliza en dev)
  routes/               → define paths y aplica middleware de validación
  controllers/          → recibe req/res, llama a services, responde con sendSuccess/sendError
  middleware/
    auth.middleware.js          → verifica JWT, adjunta req.user
    rateLimiter.middleware.js   → 5 intentos / 15 min para rutas /auth/*
    validate.middleware.js      → lee errores de express-validator
    errorHandler.middleware.js  → captura errores no controlados, mapea códigos Prisma
  services/
    email.service.js    → envío de emails con Nodemailer (verificación y reset)
    redis.service.js    → cliente ioredis singleton
    supabase.service.js → cliente Supabase singleton
  utils/
    response.util.js    → sendSuccess / sendError — formato estándar de respuesta
    crypto.util.js      → hashPassword, comparePassword, generateVerificationCode
    logger.util.js      → Winston (debug en dev, info en prod)
```

## Reglas críticas

- **Formato de respuesta obligatorio** en todos los endpoints:
  ```js
  { success: boolean, data: {}, error: string | null, message: string }
  ```
  Usar siempre `sendSuccess` / `sendError` de `utils/response.util.js`.

- **Todos los endpoints excepto `/auth/*`** requieren el middleware `authenticate`.

- **El usuario solo puede acceder a sus propios datos**: filtrar siempre por `user_id: req.user.id`.

- **Rate limiting** en rutas de auth: `authRateLimiter` máximo 5 intentos por 15 min.

- **Los códigos de verificación expiran en 15 minutos** (campo `expires_at` en `VerificationCode`).

- **Variables de entorno** en `.env`, nunca hardcodeadas. Ver `.env.example` para la lista completa.

- Documentar cada endpoint con JSDoc.

## Tecnologías
- Node.js + Express — API REST
- Prisma + PostgreSQL — ORM y base de datos (schema en `../database/schema.prisma`)
- ioredis — caché y sesiones
- JWT (jsonwebtoken) — autenticación stateless con access + refresh token
- Nodemailer — emails transaccionales
- Supabase — gestión de usuarios
- express-validator — validación de inputs
- Winston — logging estructurado

## Variables de entorno requeridas
```
DATABASE_URL, REDIS_URL,
JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN,
SUPABASE_URL, SUPABASE_KEY,
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM,
FRONTEND_URL, NODE_ENV
```

## Endpoints implementados (stubs — pendiente lógica de negocio)

| Método | Ruta | Auth |
|--------|------|------|
| POST | /auth/register | No |
| POST | /auth/verify-email | No |
| POST | /auth/set-password | No |
| POST | /auth/login | No |
| POST | /auth/forgot-password | No |
| POST | /auth/reset-password | No |
| POST | /auth/logout | Sí |
| GET | /auth/me | Sí |
| POST/PUT | /onboarding/* | Sí |
| GET/POST/PUT | /plans/* | Sí |
| GET/PUT/POST | /training/* | Sí |
| GET/PUT | /nutrition/meals | Sí |
| GET | /foods/search, /foods/barcode/:code | Sí |
| GET/POST | /progress, /progress/stats | Sí |
| GET/PUT | /logs/today, /logs/history | Sí |
