# Arquitectura técnica propuesta (MVP)

## Componentes

1. **Telegram Bot (`apps/bot`)**
   - Registro de usuarios, control de acceso y moderación básica.
   - Comandos `/start`, `/play`, `/status`, `/users`, `/ban`, `/unban`.
   - Sincronización de estado recibida desde Web App (`WEB_APP_DATA`).

2. **Telegram Web App (`apps/web`)**
   - UI retro en Canvas 2D.
   - Gestión local de estado (localStorage).
   - Acciones de cuidado, alertas visuales/sonoras y envío de estado al bot.

3. **Persistencia local del bot (`apps/bot/data`)**
   - `users.json`: registro de usuarios y estado de baneo.
   - `pets.json`: estado sincronizado de mascota por usuario.

4. **Activos y documentación**
   - `assets/`: recursos visuales y audio.
   - `docs/`: decisiones funcionales, arquitectura y referencias.

## Flujo funcional actual

1. Usuario ejecuta `/start` en Telegram.
2. Bot registra o actualiza usuario.
3. Usuario abre Web App con `/play`.
4. Web App crea mascota y mantiene estado local.
5. Web App sincroniza datos al bot (`type: "pet_sync"`).
6. Bot guarda estado y lo expone mediante `/status`.

## Modelo de estado mínimo

- `stage`: `unselected | egg | hatching | baby | dead`
- `pet_type`, `name`, `hatch_at`
- Needs en Web App: `hunger`, `thirst`, `happiness`, `energy`, `hygiene`, `discipline`, `health`, `sick`, `poop`, `sleeping`, `dead`

## Riesgos técnicos detectados

- Persistencia dividida (Web App local + bot JSON) sin backend único.
- Sin tests automáticos ni pipeline CI.
- Falta de módulo de dominio compartido entre UI y bot.

## Evolución recomendada

- Backend dedicado para estado único de mascota.
- Scheduler/tick en servidor para degradación temporal real.
- API versionada para desacoplar bot y Web App.
- Pruebas unitarias + integración + lint en CI.
