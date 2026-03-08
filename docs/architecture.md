# Arquitectura técnica propuesta (MVP)

## Componentes
1. **Telegram Bot**
   - Comandos y menú principal
   - Autenticación por 	elegram_user_id
   - Push de notificaciones

2. **Telegram Web App (frontend)**
   - Canvas 2D (Phaser/Pixi o vanilla Canvas)
   - Sprites pixel-art + animaciones por estado
   - HUD con barras de stats

3. **Servidor de juego**
   - Modelo de mascota por usuario
   - Motor temporal (tick cada N minutos)
   - Reglas de evolución y salud

4. **Persistencia**
   - MVP: SQLite
   - Escalable: PostgreSQL

## Modelo de estado mínimo
- stage: egg|baby|child|teen|adult
- hunger, happiness, energy, hygiene, discipline, health (0-100)
- is_sick, is_sleeping, poop_count
- orn_at, last_tick_at, last_interaction_at, care_mistakes

## Motor de degradación
Cada tick:
- hambre +8
- felicidad -6
- energía -5 (si despierto)
- higiene -7 (si poop_count > 0)
- probabilidad de enfermedad según umbrales críticos

## API sugerida
- POST /api/session/telegram
- GET /api/pet
- POST /api/action/feed|play|clean|heal|sleep|discipline
- POST /api/tick (interno/scheduler)

## Despliegue
- Bot webhook o long polling (MVP: polling)
- Web App estática + API backend
