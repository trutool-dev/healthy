@echo off
cd /d "C:\Users\Antonio\Documents\ai-studio"

echo Eliminando lock si existe...
if exist .git\index.lock del .git\index.lock

echo Preparando commit de cambios pendientes...
git add -A

git commit -m "chore(healthy): limpieza backend, docs Railway y fixes devops

- Eliminados controllers/middleware/utils duplicados (camelCase)
- Routes actualizadas para usar solo archivos .controller.js / .middleware.js
- Docs: api-reference, architecture-web, deployment-guide, rgpd-compliance actualizados
- Devops: deploy-landing, deploy-production, deploy-staging, eas-submit corregidos
- Terraform AWS infra eliminado (vpc/rds/ecs/alb/elasticache)
- Frontend: pantallas auth y onboarding con manejo de errores mejorado
- tasks.md y security/VULNERABILITIES.md actualizados"

echo Subiendo a GitHub...
git push origin develop

echo.
echo Listo!
pause
