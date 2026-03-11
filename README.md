# VirtGochi

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-26A5E4)
![Web App](https://img.shields.io/badge/WebApp-Canvas%202D-6f42c1)
![Status](https://img.shields.io/badge/Status-MVP-success)

Mascota virtual estilo retro para Telegram (**Bot + Web App**).  
El usuario crea una mascota ovípara, la cuida con acciones diarias y consulta su estado desde el bot.

## Características principales

- Selección de 10 especies ovíparas.
- Nombre de mascota con máximo 6 caracteres.
- Ciclo inicial huevo -> eclosión -> mascota bebé.
- Eclosión aleatoria entre 1 y 2 minutos (MVP actual).
- Sistema de necesidades: hambre, sed, felicidad, energía, higiene, disciplina, salud.
- Riesgo de enfermedad por descuido.
- Acciones de cuidado: alimentar, agua, jugar, limpiar, medicina, dormir, disciplinar, elogiar.
- Música retro de fondo al abrir el juego (prioriza WAV para compatibilidad móvil/WebView, con fallback MIDI).
- Botón en juego para activar/silenciar música manualmente.
- Sincronización Web App -> bot para comando `/status`.
- Comandos de moderación: `/users`, `/ban`, `/unban` (solo admins).

## Arquitectura del repositorio

```text
VirtGochi/
├─ apps/
│  ├─ bot/          # Bot Telegram en Python
│  └─ web/          # Frontend Web App (HTML/CSS/JS)
├─ assets/          # Audio, sprites y recursos visuales
├─ docs/            # Documentación técnica y funcional
└─ server/          # Base documental para backend/motor de juego
```

## Tecnologías usadas

- **Python 3.10+**
- **python-telegram-bot 21.6**
- **HTML5 + CSS3 + JavaScript (Canvas 2D)**
- **Telegram Web Apps SDK**

## Instalación

### 1) Bot (Python)

```bash
cd apps/bot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2) Variables de entorno

Crear `apps/bot/.env`:

```env
TELEGRAM_BOT_TOKEN=<TOKEN>
WEB_APP_URL=https://tu-dominio/index.html
TELEGRAM_ADMIN_USER_IDS=123456789
```

> Nunca subas tokens reales a GitHub.

### 3) Ejecutar bot

```bash
cd apps/bot
python bot.py
```

### 4) Ejecutar Web App local (desarrollo)

```bash
python -m http.server 8080 --bind 127.0.0.1 --directory apps/web
```

## Uso rápido

1. En Telegram: `/start`
2. Abrir juego con `/play`
3. Crear mascota en la Web App
4. Sincronizar con botón **📡 Sincronizar con /status**
5. Consultar estado con `/status`

## Web publicada

- `https://alebcasas.github.io/VirtGochi/`

Para Telegram Web App:

- `WEB_APP_URL=https://alebcasas.github.io/VirtGochi/index.html`

## Roadmap sugerido

- Persistencia centralizada en backend (SQLite/PostgreSQL).
- Motor de ticks en servidor con scheduler.
- Cobertura de pruebas unitarias e integración.
- CI/CD con lint + tests + build checks.
- Panel de administración y métricas de uso.

## Contribuciones

1. Haz fork del repositorio.
2. Crea una rama de feature/fix.
3. Abre un Pull Request con descripción clara y evidencias de pruebas.

## Licencia

Este proyecto está bajo la licencia **MIT**.  
Consulta el archivo [LICENSE](LICENSE) para más detalles.
