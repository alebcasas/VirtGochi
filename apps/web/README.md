# Web App Telegram

Interfaz visual retro con sprites y animaciones.

## Audio de fondo (retro)

- La Web App intenta reproducir música al abrir el juego.
- Fuente principal: `assets/audio/virtgochi_theme.wav`.
- Fallback: `assets/audio/virtgochi_theme.mid` si el cliente no soporta WAV.
- Incluye botón en pantalla para alternar manualmente:
  - `🔊 Activar música`
  - `🔇 Silenciar música`

## Compatibilidad Telegram Web App

- Se prioriza formato WAV por mayor compatibilidad en WebView móvil.
- Por políticas de autoplay del navegador/WebView, el audio puede requerir interacción inicial del usuario en algunos dispositivos.
- La app reintenta reproducción al primer toque/click/tecla y cuando vuelve a foco.
