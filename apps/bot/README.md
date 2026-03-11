# Bot VirtGochi

Comandos:
- /start
- /play
- /status
- /info
- /users (admin)
- /ban <telegram_user_id> (admin)
- /unban <telegram_user_id> (admin)

## Registro abierto para todos los usuarios

- Cualquier usuario de Telegram puede usar el bot.
- Al usar `/start`, su cuenta se registra automáticamente en `apps/bot/data/users.json`.
- Si el usuario está baneado, no podrá usar comandos del bot.

## Variables de entorno

- `TELEGRAM_BOT_TOKEN`: token del bot (obligatorio).
- `WEB_APP_URL`: URL pública **https** de la web app (requerida para `/play` en Telegram).
- `TELEGRAM_ADMIN_USER_IDS`: lista separada por coma de user IDs admin para comandos de moderación.

Ejemplo:

```env
TELEGRAM_BOT_TOKEN=<TOKEN>
WEB_APP_URL=https://tu-dominio/apps/web/index.html
TELEGRAM_ADMIN_USER_IDS=7356695369,123456789
```

## Configuración para Web App en Telegram (paso a paso)

Telegram no permite abrir Web Apps con `http://localhost`. Necesitas una URL pública `https`.

1. Levanta la web local:

   ```powershell
   python -m http.server 8080 --bind 127.0.0.1 --directory "c:\Users\Admin\Desktop\CopiasDeSeguridad\Programacion\Mis Proyectos\VirtGochi\apps\web"
   ```

2. Publica ese puerto con un túnel HTTPS (elige uno):

   - Cloudflare Tunnel:

     ```powershell
     cloudflared tunnel --url http://127.0.0.1:8080
     ```

   - ngrok:

     ```powershell
     ngrok http 8080
     ```

3. Copia la URL `https` generada por el túnel y configúrala en `apps/bot/.env` como `WEB_APP_URL`.

4. Inicia el bot:

   ```powershell
   cd apps/bot
   python bot.py
   ```

5. En Telegram, abre el bot y ejecuta `/play`.

Notas:
- Si `WEB_APP_URL` no es `https`, el bot avisará que la URL no es válida.
- Al iniciar, el bot también intentará configurar el botón de menú "Jugar VirtGochi" con esa URL.

## Mejoras aplicadas para estabilidad en Telegram

- Registro automático de comandos en Telegram al iniciar (`/start`, `/play`, `/status`, `/info`, `/users`, `/ban`, `/unban`).
- Validación de `WEB_APP_URL` con chequeo de `https`, dominio válido y resolución DNS.
- Si `WEB_APP_URL` viene sin ruta (por ejemplo `https://host`), el bot completa automáticamente a `https://host/index.html`.
- Mensaje de diagnóstico más claro cuando `/play` no puede abrir la Web App.

## Comando /info

Devuelve información general del proyecto:

- descripción de VirtGochi,
- autor,
- stack principal,
- enlace del repositorio,
- enlace público de la Telegram Web App.
