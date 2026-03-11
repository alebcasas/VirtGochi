# Web App Telegram

Interfaz visual retro con sprites y animaciones.

## Audio de fondo (retro)

- La Web App intenta reproducir música al abrir el juego.
- Fuente principal: `assets/audio/virtgochi_theme_long.mp3` (tema largo).
- Fallbacks: `assets/audio/virtgochi_theme.wav` y `assets/audio/virtgochi_theme.mid`.
- Incluye botón en pantalla para alternar manualmente:
  - `🔊 Activar música`
  - `🔇 Silenciar música`
- El botón de silenciar pausa la música y evita reanudación automática hasta que el usuario la reactive.

## Compatibilidad Telegram Web App

- Se prioriza MP3 por compatibilidad general (móvil/web), con WAV/MIDI de respaldo.
- Por políticas de autoplay del navegador/WebView, el audio puede requerir interacción inicial del usuario en algunos dispositivos.
- La app reintenta reproducción al primer toque/click/tecla y cuando vuelve a foco.

## Crédito del audio principal

- Track: **Bit Quest** — Kevin MacLeod.
- Licencia: **CC BY 3.0**.
- Fuente: `https://upload.wikimedia.org/wikipedia/commons/3/3a/Bit_Quest_%28ISRC_USUAN1500073%29.mp3`
