# VirtGochi

Proyecto de mascota virtual para Telegram (**Bot + Web App**), con estilo retro tipo tamagotchi.

## Estado actual del proyecto

Este repositorio contiene un MVP funcional con:

- Selección de 1 mascota entre 10 especies ovíparas.
- Nombre con máximo de 6 caracteres.
- Inicio en estado huevo con animación en canvas.
- Eclosión aleatoria entre 10 y 60 minutos.
- Rajaduras progresivas del huevo durante los últimos 5 minutos antes de eclosionar.
- Ruptura total del cascarón al momento de la eclosión.
- Sistema de necesidades estilo Tamagotchi clásico: hambre, sed, felicidad, energía, higiene, disciplina y salud.
- Riesgo de enfermedad por descuido (suciedad, baja higiene, hambre/sed críticos, etc.).
- Acciones de cuidado: alimentar, dar agua, jugar, limpiar, medicina, dormir/despertar, disciplinar y elogiar.
- Apariencia visual distinta por especie tras eclosionar.
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

## Inspiración Tamagotchi original

Para modelar estas mecánicas se tomó como referencia documentación pública de Tamagotchi (Bandai y Wikipedia):

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
