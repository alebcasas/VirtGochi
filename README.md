# VirtGochi

Proyecto de mascota virtual para Telegram (**Bot + Web App**), con estilo retro tipo tamagotchi.

## Estado actual del proyecto

Este repositorio contiene un MVP funcional con:

- Selección de 1 mascota entre 10 especies ovíparas.
- Nombre con máximo de 6 caracteres.
- Inicio en estado huevo con animación en canvas.
- Eclosión aleatoria entre 40 y 90 minutos.
- Bot de Telegram con comandos `/start`, `/play` y `/status`.

Estructura principal:

- `apps/web`: frontend simple para la creación/visualización de la mascota.
- `apps/bot`: bot de Telegram en Python (`python-telegram-bot`).
- `docs`: notas de arquitectura, reglas y catálogo de mascotas.
- `server`: documentación inicial del motor de juego.

## Requisitos

- Python 3.10+
- Bot de Telegram creado con `@BotFather`
- URL pública para `WEB_APP_URL` (si se usa la Web App desde Telegram)

## Ejecución rápida del bot

1. Ir a la carpeta del bot:

   ```bash
   cd apps/bot
   ```

2. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

3. Configurar variables de entorno:

   - `TELEGRAM_BOT_TOKEN`
   - `WEB_APP_URL` (opcional pero recomendado)

4. Ejecutar:

   ```bash
   python bot.py
   ```

## Subida a GitHub (paso a paso)

1. Inicializar Git (si aún no está inicializado):

   ```bash
   git init
   ```

2. Agregar cambios y crear commit:

   ```bash
   git add .
   git commit -m "feat: base inicial de VirtGochi (bot + web + docs)"
   ```

3. Crear repositorio vacío en GitHub con nombre `VirtGochi`.

4. Vincular remoto y subir:

   ```bash
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/VirtGochi.git
   git push -u origin main
   ```

## Próximos pasos sugeridos

- Conectar Web App y bot con un backend real (estado persistente).
- Implementar tick de degradación y acciones de cuidado.
- Añadir tests básicos y pipeline CI.
