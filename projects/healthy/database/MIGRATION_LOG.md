# Migration Log — Healthy Database

## Estado: Pendiente de ejecución manual

Las migraciones no han sido ejecutadas automáticamente porque requieren
una instancia de PostgreSQL corriendo localmente o en Docker.

---

## Comandos a ejecutar manualmente

### Prerrequisitos

1. Asegúrate de que PostgreSQL está corriendo (ver opciones más abajo).
2. Asegúrate de que el fichero `.env` existe en `projects/healthy/backend/`.
3. El fichero `.env` debe contener `DATABASE_URL` apuntando a la base de datos.

**Ejemplo de DATABASE_URL:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthy_dev"
```

---

### Opción A: PostgreSQL via Docker (recomendado para desarrollo)

```bash
# Desde la carpeta projects/healthy/
docker-compose up -d db

# O si usas el Dockerfile de database/
cd projects/healthy/database
docker build -t healthy-db .
docker run -d \
  --name healthy-postgres \
  -e POSTGRES_DB=healthy_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  healthy-db
```

---

### Opción B: PostgreSQL nativo

Asegúrate de que el servicio PostgreSQL está activo en el sistema.

---

### Ejecutar la migración inicial

```bash
# Desde projects/healthy/backend/
npx prisma migrate dev --name init
```

Este comando:
1. Lee el schema en `database/schema.prisma` (vía `prisma.schema` en package.json o ruta relativa)
2. Genera la carpeta `migrations/` con el SQL de la migración inicial
3. Aplica la migración a la base de datos
4. Genera el Prisma Client

**Nota:** El schema está en `projects/healthy/database/schema.prisma`.
Si Prisma lo busca en `prisma/schema.prisma`, puedes especificar la ruta:

```bash
npx prisma migrate dev --schema ../database/schema.prisma --name init
```

---

### Ejecutar el seed después de la migración

```bash
# Desde projects/healthy/backend/
npx ts-node ../database/seed.ts

# O si usas ts-node directamente desde la carpeta database/
cd projects/healthy/database
npx ts-node seed.ts
```

---

### Verificar el estado de las migraciones

```bash
# Desde projects/healthy/backend/
npx prisma migrate status --schema ../database/schema.prisma
```

---

### Reset completo (destruye datos — solo desarrollo)

```bash
npx prisma migrate reset --schema ../database/schema.prisma
```

---

## Errores frecuentes y soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `P1001: Can't reach database server` | PostgreSQL no está corriendo | Arrancar Docker o servicio PostgreSQL |
| `P1003: Database does not exist` | Base de datos no creada | Ejecutar `npx prisma db push` primero o crear la BD manualmente |
| `Environment variable not found: DATABASE_URL` | `.env` ausente o mal configurado | Copiar `.env.example` a `.env` y configurar `DATABASE_URL` |
| `Schema file not found` | Ruta incorrecta al schema | Usar `--schema ../database/schema.prisma` |

---

## Historial de migraciones

| Fecha | Versión | Descripción | Estado |
|-------|---------|-------------|--------|
| Pendiente | `20260429210701_init` | Migración inicial — todas las tablas (21 entidades) | No ejecutada |
| Pendiente | `20260608184928_add_token_usage_logs_and_health_consent` | Añade tabla `token_usage_logs` y campos RGPD en `users` | No ejecutada |

---

## Detalle — Migración pendiente

### `20260608184928_add_token_usage_logs_and_health_consent`

**Fecha de creación del fichero:** 2026-06-08  
**Generada por:** agente database (PR-2)  
**Motivo:*