# GITHUB_SECRETS — Secretos de GitHub Actions

Guía completa para configurar los secretos necesarios en los pipelines CI/CD del proyecto Healthy.
Stack de despliegue: **Railway** (staging y producción: backend + PostgreSQL + Redis) + **AWS S3/CloudFront** (landing page únicamente).

## Cómo añadir un secreto en GitHub

1. Ir al repositorio en GitHub
2. Clic en **Settings** (pestaña superior)
3. En el menú izquierdo: **Secrets and variables** → **Actions**
4. Clic en **New repository secret**
5. Introducir el nombre exacto (mayúsculas con guiones bajos) y el valor
6. Clic en **Add secret**

---

## Secretos de repositorio (compartidos por todos los entornos)

Añadir en **Settings → Secrets and variables → Actions → Repository secrets**.

| Secreto | Descripción | Cómo obtener el valor |
|---------|-------------|----------------------|
| `RAILWAY_TOKEN` | Token de autenticación para Railway CLI (staging y producción) | railway.app → Dashboard → Account Settings → Tokens → Create Token |
| `RAILWAY_PRODUCTION_SERVICE_ID` | ID del servicio Railway de producción | Railway Dashboard → Proyecto producción → Settings → Service ID |
| `ANTHROPIC_API_KEY` | API key de Claude para generación de planes IA | console.anthropic.com → API Keys → Create Key |
| `RAILWAY_STAGING_DATABASE_URL` | Connection string de la BD PostgreSQL en Railway staging | Railway Dashboard → Proyecto staging → Postgres → Variables → DATABASE_URL |
| `RAILWAY_PRODUCTION_DATABASE_URL` | Connection string de la BD PostgreSQL en Railway producción | Railway Dashboard → Proyecto producción → Postgres → Variables → DATABASE_URL |

> **Nota:** `RAILWAY_STAGING_DATABASE_URL` y `RAILWAY_PRODUCTION_DATABASE_URL` solo se usan en `db-backup.yml` para los dumps semanales con pg_dump.

> **Nota:** El `RAILWAY_SERVICE_ID` de staging (staging: `ec2720da-2f41-436c-a5e2-e39f7b7d9a6e`) está hardcodeado directamente en `deploy-staging.yml` por ser un valor no sensible.

---

## Secretos del entorno staging

Añadir en **Settings → Environments → staging → Environment secrets**.

Railway inyecta automáticamente `DATABASE_URL` y `REDIS_URL` en el servicio — no hace falta añadirlos aquí.

| Secreto | Descripción | Valor / Cómo obtener |
|---------|-------------|----------------------|
| `JWT_SECRET` | Clave de firma de access tokens (15 min) | `N3zWWgYKRdq/q8Fxpli4M0rSYToIaud12eJYb5VxNf5d3tcuFNv39KaMS4g4stJi7ZQQV5/MzQBJB3t0vzC6JA==` |
| `JWT_REFRESH_SECRET` | Clave de firma de refresh tokens (30 días) | `i6AGImeOm95+ynaW0vHDQCauG/DRJRpGYCOJnL/WU9PiCMWn3z4SHkuJQqtCb6kCvyOx7r0LX18yYM8MVkVYzQ==` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxxxxxxxxx.supabase.co` (en Supabase Dashboard → Settings → API → Project URL) |
| `SUPABASE_KEY` | Clave anon/pública de Supabase (**nombre exacto que usa el backend**: `process.env.SUPABASE_KEY`) | `eyJ...` (en Supabase Dashboard → Settings → API → anon/public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio con acceso completo — **solo backend, nunca frontend** | `eyJ...` (Supabase Dashboard → Settings → API → service_role) |
| `SMTP_HOST` | Servidor SMTP | `smtp.mailgun.org` (Mailgun) o `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` (STARTTLS recomendado) |
| `SMTP_USER` | Usuario SMTP para emails de verificación | `postmaster@mg.healthy.app` (Mailgun) o cuenta Gmail |
| `SMTP_PASS` | Contraseña SMTP | Panel del proveedor de email |
| `EMAIL_FROM` | Remitente de emails | `Healthy App <noreply@healthy.app>` |

---

## Secretos del entorno production

Añadir en **Settings → Environments → production → Environment secrets**.

Railway inyecta automáticamente `DATABASE_URL` y `REDIS_URL` en el servicio — no hace falta añadirlos aquí.

| Secreto | Descripción | Valor / Cómo obtener |
|---------|-------------|----------------------|
| `JWT_SECRET` | **Distinto del de staging** | `lkST4/zflJf+UPYjbRJRufIB7guMyoH/dtBzPFbhMFTfqukbOHoQj7YA5ALrQUD0RZ4BmiHqj9k2eYoDHgHYdQ==` |
| `JWT_REFRESH_SECRET` | **Distinto del de staging** | `nKRX3jr+FuB7gjfjBby05alYwjIRk0GLJ4BO1mFC6MJhT7V8LbnmSnktwxaauRI0/+dOGHqoFtkMHUOuRxKrlg==` |
| `SUPABASE_URL` | URL del proyecto Supabase de producción (proyecto separado recomendado) | Supabase Dashboard → Settings → API |
| `SUPABASE_KEY` | Clave anon de producción | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de producción | `eyJ...` |
| `SMTP_HOST` | Servidor SMTP producción | |
| `SMTP_PORT` | Puerto SMTP producción | `587` |
| `SMTP_USER` | SMTP producción | |
| `SMTP_PASS` | SMTP producción | |
| `EMAIL_FROM` | Remitente producción | `Healthy App <noreply@healthy.app>` |

---

## Secretos para la landing page (AWS S3 + CloudFront)

Solo necesarios para el pipeline `deploy-landing.yml`. El backend usa Railway, no AWS.

| Secreto | Descripción | Cómo obtener el valor |
|---------|-------------|----------------------|
| `AWS_ACCESS_KEY_ID` | IAM key para desplegar la landing a S3 | AWS Console → IAM → Users → ci-cd-user → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Secret de la IAM key | Se obtiene una única vez al crear la access key |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de CloudFront para invalidar cach