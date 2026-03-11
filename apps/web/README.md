# Web App Telegram

Interfaz visual retro con sprites y animaciones.

## Audio de fondo (retro)

- La Web App intenta reproducir música al abrir el juego.
- Playlist secuencial de 9 pistas (al terminar una, inicia la siguiente).
- Incluye 6 pistas extra estilo retro/chiptune de Kevin MacLeod:
  - `km_bit_quest.mp3`
  - `km_adventure_meme.mp3`
  - `km_video_dungeon_crawl.mp3`
  - `km_8bit_dungeon_boss.mp3`
  - `km_8bit_dungeon_level.mp3`
  - `km_blip_stream.mp3`
- Se mantienen además `virtgochi_theme_long.mp3`, `virtgochi_theme.wav` y `virtgochi_theme.mid`.
- Incluye botón en pantalla para alternar manualmente:
  - `🔊 Activar música`
  - `🔇 Silenciar música`
- El botón de silenciar pausa la música y evita reanudación automática hasta que el usuario la reactive.

## Compatibilidad Telegram Web App

- Se prioriza MP3 por compatibilidad general (móvil/web), con WAV/MIDI de respaldo.
- Por políticas de autoplay del navegador/WebView, el audio puede requerir interacción inicial del usuario en algunos dispositivos.
- La app reintenta reproducción al primer toque/click/tecla y cuando vuelve a foco.

## Crédito del audio principal

- Artista principal: **Kevin MacLeod**.
- Licencia: **CC BY 3.0**.
- Fuente de referencia: `https://upload.wikimedia.org/wikipedia/commons/3/3a/Bit_Quest_%28ISRC_USUAN1500073%29.mp3`
