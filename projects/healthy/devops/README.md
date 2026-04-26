# Infraestructura — Healthy App

## Entornos

| Entorno     | Rama      | Infraestructura           |
|-------------|-----------|---------------------------|
| development | cualquiera| Docker Compose local      |
| staging     | develop   | AWS (réplica de producción)|
| production  | main      | AWS (usuarios reales)     |

---

## Desarrollo local

### Requisitos previos
- Docker Desktop ≥ 4.x
- Copiar `.env.example` → `.env` en la raíz del proyecto y rellenar los valores

### Arrancar el stack completo

```bash
# Desde la raíz del proyecto
cp .env.example .env

docker compose -f devops/docker-compose.yml up -d
```

El backend queda disponible en `http://localhost:3000`.  
Health check: `GET http://localhost:3000/health`

### Comandos útiles

```bash
# Ver logs del backend en tiempo real
docker compose -f devops/docker-compose.yml logs -f backend

# Reiniciar solo el backend
docker compose -f devops/docker-compose.yml restart backend

# Parar todo y eliminar volúmenes (reset completo)
docker compose -f devops/docker-compose.yml down -v

# Acceder a psql dentro del contenedor
docker exec -it healthy-postgres psql -U healthy -d healthy_db
```

---

## Arquitectura AWS

```
Internet
   │
   ▼
Application Load Balancer (HTTPS)
   │
   ▼
ECS Fargate — healthy-backend (Node.js)
   ├── RDS PostgreSQL 16 (Multi-AZ en producción)
   └── ElastiCache Redis 7

App móvil
   └── CloudFront CDN
          ├── S3 — assets estáticos (público)
          └── S3 — fotos de progreso (privado, pre-signed URLs)
```

### Servicios AWS utilizados

| Servicio        | Uso                                          |
|-----------------|----------------------------------------------|
| ECS Fargate     | Contenedor backend sin gestión de servidores |
| ECR             | Registro privado de imágenes Docker          |
| RDS PostgreSQL  | Base de datos principal                      |
| ElastiCache     | Caché Redis y sesiones                       |
| S3              | Assets y fotos de progreso                   |
| CloudFront      | CDN para assets estáticos                    |
| ALB             | Load balancer con terminación TLS            |
| Secrets Manager | Credenciales y claves API en producción      |

---

## CI/CD — GitHub Actions

### Pipeline CI (`ci.yml`)

Se ejecuta en cada Pull Request hacia `main` o `develop`.

```
PR abierto
  ├── backend: lint + tests + cobertura (con Postgres y Redis reales)
  ├── docker-build: verifica que la imagen construye correctamente
  └── ai: lint + tests del módulo IA
```

El PR no puede mergearse si algún job falla.

### Pipeline Deploy (`deploy.yml`)

Se ejecuta al hacer push a `main` o `develop`.

```
Push a develop
  └── build-push (ECR) → deploy-staging (ECS staging, automático)

Push a main
  └── build-push (ECR) → deploy-production (ECS production, requiere aprobación)
```

El deploy a producción usa un **GitHub Environment** con protección de rama:
un revisor debe aprobar manualmente antes de que el job ejecute.

---

## Secrets de GitHub requeridos

Configurar en **Settings → Secrets and variables → Actions**:

| Secret                    | Descripción                              |
|---------------------------|------------------------------------------|
| `AWS_ACCESS_KEY_ID`       | Credencial IAM con permisos ECS + ECR    |
| `AWS_SECRET_ACCESS_KEY`   | Secreto de la credencial IAM             |

Los secretos de aplicación (Supabase, Anthropic, etc.) se gestionan en
**AWS Secrets Manager** y se inyectan en ECS Task Definition, nunca en
variables de entorno del repositorio.

---

## Dockerfiles

### `backend/Dockerfile`
- Build multi-stage: instala dependencias en una etapa separada
- Imagen final basada en `node:20-alpine` (~180 MB)
- Ejecuta como usuario sin privilegios (`appuser`)
- `dumb-init` como PID 1 para manejo correcto de señales
- Health check integrado vía `/health`

### `database/Dockerfile`
- Extiende `postgres:16-alpine`
- Copia scripts de `database/init/` para inicialización automática
- Solo usado en desarrollo local; en AWS se usa RDS directamente

---

## Variables de entorno

Ver `.env.example` en la raíz del proyecto para la lista completa.  
En producción todas las variables sensibles residen en AWS Secrets Manager.
