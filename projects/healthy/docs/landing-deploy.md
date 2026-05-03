# Landing Deploy — Healthy

Guía para actualizar y desplegar la landing page de Healthy (`healthy.app`). La landing es un fichero HTML único autocontenido, sin proceso de build, alojado en S3 y servido por CloudFront.

---

## Estructura de `landing/index.html`

El fichero está organizado en secciones delimitadas por comentarios:

```
landing/
└── index.html          ← único fichero, autocontenido (HTML + CSS + JS inline)
```

### Secciones del documento

| Comentario en HTML | Clase/elemento raíz | Descripción |
|---|---|---|
| `<!-- ── NAVEGACIÓN ──` | `<nav class="nav">` | Barra fija con logo, links y CTA de descarga |
| `<!-- ── HERO ──` | `<section class="hero">` | Pantalla completa de entrada con headline, subtítulo y mockups |
| `<!-- ── ESTADÍSTICAS ──` | `<section class="stats-section">` | Grid de 4 métricas clave |
| `<!-- ── FEATURE: ENTRENAMIENTO ──` | `<section class="feature-section" id="entrenamiento">` | Sección de feature con visual izquierda/derecha |
| `<!-- ── FEATURE: NUTRICIÓN ──` | `<section class="feature-section" id="nutricion">` | Sección de feature con visual derecha/izquierda |
| `<!-- ── FEATURE: PROGRESO ──` | `<section class="feature-section" id="progreso">` | Sección de feature con visual izquierda/derecha |
| `<!-- ── MANIFESTÓ ──` | `<section class="manifesto-section">` | Cita destacada centrada |
| `<!-- ── DESCARGA ──` | `<section class="download-section" id="download">` | CTA final con botones de tiendas |
| `<!-- ── FOOTER ──` | `<footer class="footer">` | Links, tagline y legal |
| `<!-- ── SCRIPTS ──` | `<script>` | JS inline: nav scroll y animaciones IntersectionObserver |

---

## Tokens de diseño (variables CSS en `:root`)

```css
/* Colores de fondo */
--bg:           #080808;   /* fondo principal */
--bg-surface:   #111111;   /* tarjetas y paneles */
--bg-elevated:  #161616;   /* elementos elevados sobre surface */

/* Texto */
--text:         #FFFFFF;
--text-subtle:  rgba(255,255,255,0.68);
--text-muted:   rgba(255,255,255,0.38);

/* Bordes */
--border:       rgba(255,255,255,0.07);
--border-mid:   rgba(255,255,255,0.14);

/* Marca */
--green:        #22C55E;
--green-dark:   #16A34A;
--green-glow:   rgba(34,197,94,0.22);
--green-muted:  rgba(34,197,94,0.10);

/* Tipografía */
--font:      'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
--font-mono: 'SF Mono', 'JetBrains Mono', monospace;

/* Radios */
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-xl: 28px;

/* Layout */
--nav-h: 72px;   /* altura de la barra de navegación fija */

/* Easings de animación */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Cómo añadir una nueva sección

1. Localiza en `index.html` la posición donde encaja la sección (por ejemplo, entre `<!-- ── MANIFESTÓ ──` y `<!-- ── DESCARGA ──`).

2. Inserta el bloque HTML con el comentario delimitador:

```html
<!-- ── NUEVA SECCIÓN ────────────────────────────────────────────────────── -->
<section class="feature-section" id="nueva-seccion">
  <div class="container">
    <div class="feature-inner">

      <div class="feature-content">
        <p class="label-tag reveal">Etiqueta</p>
        <h2 class="feature-headline reveal reveal-delay-1">
          Título de la sección.
        </h2>
        <p class="feature-body reveal reveal-delay-2">
          Descripción de la funcionalidad.
        </p>
        <ul class="feature-list reveal reveal-delay-3">
          <li>Punto clave 1</li>
          <li>Punto clave 2</li>
        </ul>
      </div>

      <div class="feature-visual reveal reveal-delay-2">
        <!-- Aquí va el visual: feature-screen, imagen, etc. -->
      </div>

    </div>
  </div>
</section>
```

3. Añade el link en la nav si quieres que sea navegable:

```html
<li><a href="#nueva-seccion">Nombre</a></li>
```

4. Las clases `reveal` y `reveal-delay-*` ya están conectadas al `IntersectionObserver` en el bloque `<script>` — la animación de entrada funciona automáticamente.

5. El CSS de layout (`feature-section`, `feature-inner`, `feature-content`, `feature-visual`) ya está definido y aplica el patrón alternado: las secciones pares invierten el orden del visual automáticamente vía `:nth-child(even)`.

---

## Despliegue manual

### Prerrequisitos

- AWS CLI instalado y configurado con perfil `healthy-prod`
- Permisos: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`, `cloudfront:CreateInvalidation`

### Configurar credenciales

```bash
aws configure --profile healthy-prod
```

Introduce `AWS Access Key ID`, `AWS Secret Access Key` y región `eu-west-1`.

### Sincronizar ficheros

```bash
aws s3 sync projects/healthy/landing/ s3://healthy-landing-prod \
  --delete \
  --cache-control "public,max-age=86400" \
  --profile healthy-prod
```

El flag `--delete` elimina del bucket los ficheros que ya no existen en local.

### Forzar refresco del index.html sin caché

```bash
aws s3 cp projects/healthy/landing/index.html s3://healthy-landing-prod/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --profile healthy-prod
```

Esto sobreescribe el objeto `index.html` con un header `Cache-Control` que indica a los navegadores y a CloudFront que no lo cacheen.

### Invalidar CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id XXXXXXXXXXXXXX \
  --paths "/*" \
  --profile healthy-prod
```

Reemplaza `XXXXXXXXXXXXXX` con el ID real de la distribución (visible en AWS Console → CloudFront → Distributions). La invalidación tarda habitualmente menos de 60 segundos.

---

## Despliegue automático (CI)

### Workflow `deploy-landing.yml`

El fichero vive en `.github/workflows/deploy-landing.yml`. Se dispara cuando se hace push a `main` **y** hay cambios en la carpeta `landing/`:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'projects/healthy/landing/**'
```

El job `deploy-landing` realiza estos pasos en orden:

1. `actions/checkout@v4` — clona el repositorio
2. `aws-actions/configure-aws-credentials@v4` — autentica con los secretos del repositorio
3. `aws s3 sync` con `--delete` y `--cache-control "public,max-age=86400"`
4. `aws s3 cp index.html` con `--cache-control "no-cache,no-store,must-revalidate"` (sobreescribe solo el index para romper caché)
5. `aws cloudfront create-invalidation --paths "/*"` — invalida toda la distribución

### Secretos a configurar en GitHub

Navega a **Settings → Secrets and variables → Actions** del repositorio y añade:

| Secret | Valor |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key del usuario IAM de CI (solo permisos S3 + CloudFront) |
| `AWS_SECRET_ACCESS_KEY` | Secret key del usuario IAM de CI |
| `AWS_REGION` | `eu-west-1` |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución CloudFront (ej. `E1A2B3C4D5E6F7`) |

El usuario IAM de CI debe tener únicamente estas políticas (principio de mínimo privilegio):

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket",
    "s3:GetObject"
  ],
  "Resource": [
    "arn:aws:s3:::healthy-landing-prod",
    "arn:aws:s3:::healthy-landing-prod/*"
  ]
},
{
  "Effect": "Allow",
  "Action": "cloudfront:CreateInvalidation",
  "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
}
```

---

## Verificar que el deploy funcionó

### Con curl

```bash
curl -I https://healthy.app
```

Comprueba que el header `x-cache` devuelve `Hit from cloudfront` (caché) o `Miss from cloudfront` (primer acceso tras invalidación). El status debe ser `200 OK`.

```bash
curl -s https://healthy.app | grep '<title>'
```

Verifica que el contenido devuelto incluye el título actualizado.

### Con browser DevTools

1. Abre DevTools → pestaña **Network**.
2. Recarga con `Ctrl+Shift+R` (hard reload, sin caché local).
3. Selecciona el documento HTML raíz.
4. Cabeceras de respuesta relevantes:
   - `x-amz-cf-id` — confirma que la respuesta viene de CloudFront
   - `age` — segundos que lleva el objeto en caché (0 justo después de invalidar)
   - `cache-control` — debe ser `no-cache,no-store,must-revalidate` para `index.html`

### En AWS Console

1. CloudFront → Distributions → selecciona la distribución.
2. Pestaña **Invalidations** — verifica que la última invalidación tiene estado `Completed`.
3. Pestaña **Monitoring** → `Requests` — observa el pico de tráfico post-deploy.

---

## Rollback

El bucket S3 `healthy-landing-prod` tiene **versioning activado**. Para restaurar una versión anterior:

### Via AWS Console

1. S3 → `healthy-landing-prod` → `index.html`.
2. Pestaña **Versions** → selecciona la versión anterior.
3. Acción → **Restore** (copia esa versión como la versión actual).
4. Invalida CloudFront manualmente:

```bash
aws cloudfront create-invalidation \
  --distribution-id XXXXXXXXXXXXXX \
  --paths "/*" \
  --profile healthy-prod
```

### Via AWS CLI

```bash
# Listar versiones disponibles
aws s3api list-object-versions \
  --bucket healthy-landing-prod \
  --prefix index.html \
  --profile healthy-prod

# Restaurar una versión específica (reemplaza VERSION_ID)
aws s3api copy-object \
  --bucket healthy-landing-prod \
  --copy-source "healthy-landing-prod/index.html?versionId=VERSION_ID" \
  --key index.html \
  --metadata-directive REPLACE \
  --cache-control "no-cache,no-store,must-revalidate" \
  --profile healthy-prod

# Invalidar
aws cloudfront create-invalidation \
  --distribution-id XXXXXXXXXXXXXX \
  --paths "/*" \
  --profile healthy-prod
```
