# Healthy App

## Descripción
Healthy es una aplicación móvil de salud y bienestar personalizada mediante
IA. A diferencia de apps genéricas como MyFitnessPal o Hevy, Healthy adapta
cada plan al usuario desde el primer momento a través de un onboarding
inteligente que recoge su complexión física, nivel de actividad, hábitos
y objetivo principal.

Con esa información, la IA genera un plan completamente personalizado que
combina nutrición y entrenamiento, se ajusta visualmente para ser fácil
de seguir y evoluciona en tiempo real según el progreso del usuario.

## Usuarios objetivo
Healthy da servicio a 4 perfiles mediante onboarding adaptativo:
- Personas con sobrepeso que quieren perder peso de forma sostenible
- Jóvenes que buscan ganar músculo y mejorar su rendimiento físico
- Personas mayores que quieren mantenerse activas y saludables
- Cualquier persona que quiera mejorar sus hábitos de salud generales

## Diferenciadores clave
- IA que personaliza según complexión, edad, peso, altura y objetivos
- Combina nutrición y entrenamiento en un único plan coherente
- Interfaz simple y visual, sin abrumar al usuario con datos
- El plan evoluciona automáticamente según el progreso registrado
- Onboarding inteligente que determina el perfil exacto de cada usuario

## Stack tecnológico
- Frontend: React Native + Expo
- Backend: Node.js + Express
- Base de datos: PostgreSQL + Redis
- IA: Claude API
- Auth: Supabase
- Cloud: AWS
- CI/CD: GitHub Actions

## Estructura del proyecto
- /frontend   ? App móvil React Native
- /backend    ? API REST Node.js
- /database   ? Esquema, migraciones y seeds
- /ai         ? Integración Claude API y lógica de personalización
- /tests      ? Tests unitarios y e2e
- /devops     ? Docker, CI/CD y despliegue
- /security   ? Auditoría, validaciones y cumplimiento RGPD

## Reglas generales para todos los agentes
- Código en inglés, comentarios en español
- Commits en formato conventional commits (feat:, fix:, docs:, etc.)
- Nunca modificar archivos fuera de tu carpeta asignada
- Antes de implementar, revisar si existe algo similar ya creado
- Toda funcionalidad nueva necesita su test correspondiente
- Los datos de salud del usuario son sensibles, tratar con RGPD en mente

## Flujo de ramas
- main        ? producción
- develop     ? integración
- feature/frontend   ? agente frontend
- feature/backend    ? agente backend
- feature/database   ? agente base de datos
- feature/ai         ? agente IA
- feature/tests      ? agente tester
- feature/devops     ? agente devops
- feature/security   ? agente seguridad
