import asyncio
import json
import logging
import os
import socket
from urllib.parse import urlparse
from datetime import datetime, timezone
from json import JSONDecodeError
from pathlib import Path
from typing import Any

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    BotCommand,
    KeyboardButton,
    MenuButtonWebApp,
    ReplyKeyboardMarkup,
    Update,
    WebAppInfo,
)
from telegram.error import Conflict
from telegram.ext import Application, CommandHandler, ContextTypes

UTC = timezone.utc

DATA_DIR = Path(__file__).parent / "data"
ENV_FILE = Path(__file__).parent / ".env"
PETS_FILE = DATA_DIR / "pets.json"
USERS_FILE = DATA_DIR / "users.json"

LOGGER = logging.getLogger(__name__)

DATA_DIR.mkdir(parents=True, exist_ok=True)
if not PETS_FILE.exists():
    PETS_FILE.write_text("{}", encoding="utf-8")
if not USERS_FILE.exists():
    USERS_FILE.write_text("{}", encoding="utf-8")


def _default_pet_record() -> dict[str, Any]:
    return {
        "created_at": _utc_now_iso(),
        "pet_type": None,
        "name": None,
        "stage": "unselected",
        "hatch_at": None,
    }


def _load_local_env() -> None:
    if not ENV_FILE.exists():
        return
    for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_local_env()


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _parse_iso_to_utc(value: str) -> datetime:
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _load_json(path: Path) -> dict[str, Any]:
    try:
        raw = path.read_text(encoding="utf-8")
        data = json.loads(raw or "{}")
        if isinstance(data, dict):
            return data
        LOGGER.warning("El archivo %s no contiene un objeto JSON. Se usará {}.", path)
    except FileNotFoundError:
        LOGGER.warning("No se encontró %s. Se recreará con {}.", path)
    except JSONDecodeError:
        LOGGER.exception("JSON inválido en %s. Se reiniciará el archivo con {}.", path)
    except OSError:
        LOGGER.exception("No se pudo leer %s. Se usará {} en memoria.", path)

    _save_json(path, {})
    return {}


def _save_json(path: Path, data: dict[str, Any]) -> None:
    try:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(f"No se pudo escribir el archivo de datos: {path}") from exc


def _ensure_pet(user_id: int) -> dict[str, Any]:
    data = _load_json(PETS_FILE)
    k = str(user_id)
    if k not in data:
        data[k] = _default_pet_record()
        _save_json(PETS_FILE, data)
    return data[k]


def _is_admin(user_id: int) -> bool:
    raw = os.environ.get("TELEGRAM_ADMIN_USER_IDS", "").strip()
    if not raw:
        return False
    ids = {x.strip() for x in raw.split(",") if x.strip()}
    return str(user_id) in ids


def _register_or_touch_user(update: Update) -> tuple[dict[str, Any], bool]:
    t_user = update.effective_user
    if t_user is None:
        raise RuntimeError("No se pudo identificar el usuario de Telegram.")

    users = _load_json(USERS_FILE)
    k = str(t_user.id)
    was_created = k not in users

    if was_created:
        users[k] = {
            "user_id": t_user.id,
            "username": t_user.username,
            "first_name": t_user.first_name,
            "registered_at": _utc_now_iso(),
            "last_seen_at": _utc_now_iso(),
            "is_banned": False,
        }
    else:
        users[k]["username"] = t_user.username
        users[k]["first_name"] = t_user.first_name
        users[k]["last_seen_at"] = _utc_now_iso()

    _save_json(USERS_FILE, users)
    return users[k], was_created


def _set_ban_state(user_id: int, value: bool) -> bool:
    users = _load_json(USERS_FILE)
    k = str(user_id)
    if k not in users:
        return False
    users[k]["is_banned"] = value
    users[k]["last_seen_at"] = _utc_now_iso()
    _save_json(USERS_FILE, users)
    return True


async def _ensure_access(update: Update) -> bool:
    if not update.effective_user or not update.message:
        return False

    try:
        user, _ = _register_or_touch_user(update)
    except RuntimeError:
        LOGGER.exception("No se pudo registrar/actualizar al usuario.")
        await update.message.reply_text("No se pudo validar tu cuenta en este momento.")
        return False

    if user.get("is_banned"):
        await update.message.reply_text("Tu cuenta está bloqueada para usar este bot.")
        return False
    return True

def _status_text(p: dict[str, Any]) -> str:
    if p.get("stage") == "unselected":
        return "No tienes mascota aun. Usa /play para crearla."
    if p.get("stage") == "egg" and p.get("hatch_at"):
        rem = _parse_iso_to_utc(p["hatch_at"]) - datetime.now(UTC)
        m = int(rem.total_seconds() // 60)
        if m <= 0:
            return f"🥚 {p['name']} ({p['pet_type']}) ya deberia eclosionar."
        return f"🥚 {p['name']} ({p['pet_type']}) eclosiona en ~{m} min."
    return f"🐣 {p.get('name')} ({p.get('pet_type')}) etapa: {p.get('stage')}"


def _parse_target_user_id(raw_value: str) -> int | None:
    candidate = raw_value.strip()
    if not candidate.isdigit():
        return None
    return int(candidate)


def _get_web_app_url() -> str | None:
    """Return WEB_APP_URL if valid and publicly resolvable for Telegram."""
    raw = os.environ.get("WEB_APP_URL", "").strip()
    if not raw:
        return None

    parsed = urlparse(raw)
    if parsed.scheme != "https" or not parsed.netloc:
        LOGGER.warning(
            "WEB_APP_URL inválida para Telegram Web App (requiere https y dominio): %s",
            raw,
        )
        return None

    if parsed.path in {"", "/"}:
        raw = f"{raw.rstrip('/')}/index.html"
        parsed = urlparse(raw)

    host = (parsed.hostname or "").strip().lower()
    blocked_hosts = {"localhost", "127.0.0.1", "0.0.0.0", "tu-dominio", "example.com"}
    if host in blocked_hosts:
        LOGGER.warning("WEB_APP_URL usa un host no válido para Telegram: %s", host)
        return None

    try:
        socket.getaddrinfo(host, 443)
    except OSError:
        LOGGER.warning("WEB_APP_URL con host no resolvible por DNS: %s", host)
        return None
    return raw


def _web_app_config_hint() -> str:
    return (
        "WEB_APP_URL inválida o no resolvible. "
        "Configura una URL pública https activa (Cloudflare Tunnel o ngrok), "
        "por ejemplo https://tu-host/index.html, y vuelve a intentar /play."
    )

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.effective_user or not update.message:
        return

    try:
        user, was_created = _register_or_touch_user(update)
    except RuntimeError:
        LOGGER.exception("No se pudo registrar/actualizar al usuario en /start.")
        await update.message.reply_text("No se pudo iniciar tu cuenta ahora. Intenta más tarde.")
        return

    if user.get("is_banned"):
        await update.message.reply_text("Tu cuenta está bloqueada para usar este bot.")
        return

    try:
        _ensure_pet(update.effective_user.id)
    except RuntimeError:
        LOGGER.exception("No se pudo crear/cargar la mascota inicial de %s.", update.effective_user.id)
        await update.message.reply_text("No se pudo preparar tu mascota en este momento.")
        return

    if was_created:
        await update.message.reply_text("¡Bienvenido a VirtGochi! Tu cuenta fue registrada ✅ Usa /play")
        return
    await update.message.reply_text("Bienvenido de nuevo a VirtGochi. Usa /play")

async def play(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _ensure_access(update):
        return
    web = _get_web_app_url()
    if not web:
        await update.message.reply_text(_web_app_config_hint())
        return
    inline_kb = InlineKeyboardMarkup(
        [[InlineKeyboardButton("▶️ Jugar ahora", web_app=WebAppInfo(web))]]
    )
    reply_kb = ReplyKeyboardMarkup(
        [[KeyboardButton("🎮 Abrir VirtGochi", web_app=WebAppInfo(web))]],
        resize_keyboard=True,
    )
    await update.message.reply_text(
        "VirtGochi listo. Pulsa '▶️ Jugar ahora' para iniciar.",
        reply_markup=inline_kb,
    )
    await update.message.reply_text(
        "También dejé un botón fijo de teclado para reabrir el juego rápido.",
        reply_markup=reply_kb,
    )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _ensure_access(update):
        return

    try:
        p = _ensure_pet(update.effective_user.id)
    except RuntimeError:
        LOGGER.exception("No se pudo cargar/crear la mascota del usuario %s.", update.effective_user.id)
        await update.message.reply_text("No se pudo consultar tu mascota en este momento.")
        return

    await update.message.reply_text(_status_text(p))


async def users(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.effective_user or not update.message:
        return
    if not _is_admin(update.effective_user.id):
        await update.message.reply_text("Comando solo para admin.")
        return

    try:
        all_users = _load_json(USERS_FILE)
    except RuntimeError:
        LOGGER.exception("No se pudo leer el listado de usuarios para /users.")
        await update.message.reply_text("No se pudo consultar el listado de usuarios ahora.")
        return

    total = len(all_users)
    banned = sum(1 for u in all_users.values() if u.get("is_banned"))
    active = total - banned
    await update.message.reply_text(
        f"Usuarios registrados: {total}\nActivos: {active}\nBaneados: {banned}"
    )


async def ban(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.effective_user or not update.message:
        return
    if not _is_admin(update.effective_user.id):
        await update.message.reply_text("Comando solo para admin.")
        return
    if not context.args:
        await update.message.reply_text("Uso: /ban <telegram_user_id>")
        return

    parsed_target = _parse_target_user_id(context.args[0])
    if parsed_target is None:
        await update.message.reply_text("El user_id debe ser numérico.")
        return

    try:
        ok = _set_ban_state(parsed_target, True)
    except RuntimeError:
        LOGGER.exception("No se pudo banear al usuario %s.", parsed_target)
        await update.message.reply_text("No se pudo actualizar el estado de baneo. Intenta nuevamente.")
        return

    if not ok:
        await update.message.reply_text("Ese usuario no está registrado todavía.")
        return
    await update.message.reply_text(f"Usuario {parsed_target} baneado.")


async def unban(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.effective_user or not update.message:
        return
    if not _is_admin(update.effective_user.id):
        await update.message.reply_text("Comando solo para admin.")
        return
    if not context.args:
        await update.message.reply_text("Uso: /unban <telegram_user_id>")
        return

    parsed_target = _parse_target_user_id(context.args[0])
    if parsed_target is None:
        await update.message.reply_text("El user_id debe ser numérico.")
        return

    try:
        ok = _set_ban_state(parsed_target, False)
    except RuntimeError:
        LOGGER.exception("No se pudo desbanear al usuario %s.", parsed_target)
        await update.message.reply_text("No se pudo actualizar el estado de baneo. Intenta nuevamente.")
        return

    if not ok:
        await update.message.reply_text("Ese usuario no está registrado todavía.")
        return
    await update.message.reply_text(f"Usuario {parsed_target} desbaneado.")

async def post_init(app: Application):
    await app.bot.set_my_commands(
        [
            BotCommand("start", "Registrar o reactivar tu cuenta"),
            BotCommand("play", "Abrir la Web App de VirtGochi"),
            BotCommand("status", "Ver estado de tu mascota"),
            BotCommand("users", "Ver usuarios (admin)"),
            BotCommand("ban", "Banear usuario (admin)"),
            BotCommand("unban", "Desbanear usuario (admin)"),
        ]
    )

    web = _get_web_app_url()
    if web:
        await app.bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp("Jugar VirtGochi", web_app=WebAppInfo(web))
        )
    else:
        LOGGER.warning(
            "No se configuró un menú Web App porque WEB_APP_URL no está presente o no es válida. %s",
            _web_app_config_hint(),
        )


async def on_error(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    if context.error is not None:
        LOGGER.error(
            "Error no controlado en el bot",
            exc_info=(type(context.error), context.error, context.error.__traceback__),
        )
    else:
        LOGGER.error("Error no controlado en el bot sin excepción asociada.")

    if isinstance(update, Update) and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "Ocurrió un error inesperado. Intenta nuevamente en unos segundos."
            )
        except Exception:
            LOGGER.exception("No se pudo notificar el error al usuario.")


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )

def main():
    _configure_logging()

    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError("Falta TELEGRAM_BOT_TOKEN")
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        asyncio.set_event_loop(asyncio.new_event_loop())
    app = Application.builder().token(token).post_init(post_init).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("play", play))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("users", users))
    app.add_handler(CommandHandler("ban", ban))
    app.add_handler(CommandHandler("unban", unban))
    app.add_error_handler(on_error)
    try:
        app.run_polling(allowed_updates=Update.ALL_TYPES)
    except Conflict:
        raise RuntimeError(
            "El bot ya se está ejecutando en otra instancia (getUpdates conflict). "
            "Detén la otra instancia antes de iniciar esta."
        )

if __name__ == "__main__":
    main()
