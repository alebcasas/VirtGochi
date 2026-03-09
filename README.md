# VirtGochi

Proyecto de mascota virtual para Telegram (**Bot + Web App**), con estilo retro de consola portátil.

## Estado actual del proyecto

Este repositorio contiene un MVP funcional con:

- Selección de 1 mascota entre 10 especies ovíparas.
- Nombre con máximo de 6 caracteres.
- Inicio en estado huevo con animación en canvas.
- Eclosión aleatoria entre 1 y 2 minutos.
- Rajaduras progresivas del huevo durante los últimos 5 minutos antes de eclosionar.
- Ruptura total del cascarón al momento de la eclosión.
- Sistema de necesidades clásico: hambre, sed, felicidad, energía, higiene, disciplina y salud.
- Riesgo de enfermedad por descuido (suciedad, baja higiene, hambre/sed críticos, etc.).
- Acciones de cuidado: alimentar, dar agua, jugar, limpiar, medicina, dormir/despertar, disciplinar y elogiar.
- Apariencia visual distinta por especie tras eclosionar, con pixel art más detallado (diseño original).
- Sistema de emociones dinámico (feliz, juguetón, calma, tenso, triste, enojado) con indicador visual por color/emoji.
- Animaciones post-acción (gratitud, entusiasmo, alivio, recuperación, incomodidad, etc.).
- Regla de interfaz: botones de acciones solo después de eclosionar; botón reiniciar solo cuando la mascota muere.
- Bot de Telegram con comandos `/start`, `/play`, `/status`, `/users`, `/ban` y `/unban`.

Estructura principal:

- `apps/web`: frontend simple para la creación/visualización de la mascota.
- `apps/bot`: bot de Telegram en Python (`python-telegram-bot`).
- `docs`: notas de arquitectura, reglas y catálogo de mascotas.
- `server`: documentación inicial del motor de juego.

## Requisitos

- Python 3.10+
- Bot de Telegram creado con `@BotFather`
- URL pública para `WEB_APP_URL` (si se usa la Web App desde Telegram)

## Web pública (GitHub Pages)

La Web App de VirtGochi está publicada en:

- `https://alebcasas.github.io/VirtGochi/`

Para el bot de Telegram, usar:

- `WEB_APP_URL=https://alebcasas.github.io/VirtGochi/index.html`

## Inspiración de diseño clásico

Para modelar estas mecánicas se tomó como referencia documentación pública sobre juegos de mascota virtual:

- Medidores de hambre/felicidad/entrenamiento.
- Ciclo de vida con evolución según cuidados.
- Enfermedad por mala higiene y descuido.
- Necesidad de limpieza, descanso y disciplina.

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

## Próximos pasos sugeridos

- Conectar Web App y bot con un backend real (estado persistente).
- Implementar tick de degradación y acciones de cuidado.
- Añadir tests básicos y pipeline CI.
