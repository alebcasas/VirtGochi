# VirtGochi

Mascota virtual inspirada en el Tamagotchi original, jugable en Telegram mediante **Bot + Web App** para lograr apariencia retro y animaciones tipo LCD.

## Objetivo MVP
- Cuidar una mascota con métricas: hambre, felicidad, energía, higiene, disciplina y salud.
- Acciones: alimentar, jugar, limpiar, medicar, apagar luz/dormir, elogiar/retar.
- Evolución por etapas y consecuencias por mal cuidado.
- Notificaciones por Telegram cuando necesite atención.

## Arquitectura recomendada
- pps/bot: Bot de Telegram (comandos, menús, notificaciones).
- pps/web: Mini juego visual (Telegram Web App) con sprites y animaciones.
- server: API + lógica de estados + scheduler de degradación temporal.
- ssets: sprites y UI pixel-art.

## Comandos iniciales del bot
- /start iniciar vínculo
- /play abrir Web App
- /status estado rápido
- /feed, /clean, /heal, /sleep, /discipline acciones rápidas

## Publicación en GitHub Desktop
1. Abre GitHub Desktop.
2. **File > Add local repository...** y selecciona C:\Users\PC\Desktop\VirtGochi.
3. Si no está inicializado: **Create a repository** (nombre: VirtGochi).
4. Commit inicial: eat: bootstrap VirtGochi MVP structure.
5. **Publish repository** y elige visibilidad pública/privada.

## Nota legal
VirtGochi es un proyecto fan inspirado en mecánicas clásicas. Evitar logos/arte oficial de Bandai; usar assets originales propios.
