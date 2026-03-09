import json
import os
from pathlib import Path
from datetime import datetime
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, MenuButtonWebApp, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = DATA_DIR / "pets.json"
DATA_DIR.mkdir(parents=True, exist_ok=True)
if not DATA_FILE.exists():
    DATA_FILE.write_text("{}", encoding="utf-8")

def _load():
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))

def _save(data):
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def _ensure_user(user_id: int):
    data = _load()
    k = str(user_id)
    if k not in data:
        data[k] = {"created_at": datetime.utcnow().isoformat(), "pet_type": None, "name": None, "stage": "unselected", "hatch_at": None}
        _save(data)
    return data[k]

def _status_text(p: dict) -> str:
    if p.get("stage") == "unselected":
        return "No tienes mascota aun. Usa /play para crearla."
    if p.get("stage") == "egg" and p.get("hatch_at"):
        rem = datetime.fromisoformat(p["hatch_at"]) - datetime.utcnow()
        m = int(rem.total_seconds() // 60)
        if m <= 0:
            return f"🥚 {p['name']} ({p['pet_type']}) ya deberia eclosionar."
        return f"🥚 {p['name']} ({p['pet_type']}) eclosiona en ~{m} min."
    return f"🐣 {p.get('name')} ({p.get('pet_type')}) etapa: {p.get('stage')}"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    _ensure_user(update.effective_user.id)
    await update.message.reply_text("Bienvenido a VirtGochi. Usa /play")

async def play(update: Update, context: ContextTypes.DEFAULT_TYPE):
    web = os.environ.get("WEB_APP_URL", "").strip()
    if not web:
        await update.message.reply_text("Falta WEB_APP_URL")
        return
    kb = InlineKeyboardMarkup([[InlineKeyboardButton("Abrir VirtGochi", web_app=WebAppInfo(web))]])
    await update.message.reply_text("Toca para jugar", reply_markup=kb)

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    p = _ensure_user(update.effective_user.id)
    await update.message.reply_text(_status_text(p))

async def post_init(app: Application):
    web = os.environ.get("WEB_APP_URL", "").strip()
    if web:
        await app.bot.set_chat_menu_button(menu_button=MenuButtonWebApp("Jugar VirtGochi", web_app=WebAppInfo(web)))

def main():
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError("Falta TELEGRAM_BOT_TOKEN")
    app = Application.builder().token(token).post_init(post_init).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("play", play))
    app.add_handler(CommandHandler("status", status))
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
