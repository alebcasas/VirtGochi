const PETS = ["Tortuga", "Canario", "Periquito", "Cacatua", "Agapornis", "Iguana", "Geco", "Serpiente", "Gallina", "Pato"];
const KEY = "virtgochi_state_v2";
const GAME_MUSIC_SOURCES = [
  "assets/audio/virtgochi_theme.wav",
  "assets/audio/virtgochi_theme.mid"
];

const PET_STYLES = {
  Tortuga: { color: "#4f8f4f", eye: "#ffffff", shape: "shell" },
  Canario: { color: "#f0c419", eye: "#1f2a1f", shape: "bird" },
  Periquito: { color: "#60c56a", eye: "#102010", shape: "bird" },
  Cacatua: { color: "#f3f3f3", eye: "#101010", shape: "crest" },
  Agapornis: { color: "#4cb8ff", eye: "#101010", shape: "bird" },
  Iguana: { color: "#53a85d", eye: "#101010", shape: "lizard" },
  Geco: { color: "#8fdc6a", eye: "#101010", shape: "lizard" },
  Serpiente: { color: "#6da04d", eye: "#ffffff", shape: "snake" },
  Gallina: { color: "#ffffff", eye: "#101010", shape: "bird" },
  Pato: { color: "#c1ef5d", eye: "#101010", shape: "duck" }
};

const setup = document.getElementById("setup");
const game = document.getElementById("game");
const petType = document.getElementById("petType");
const petName = document.getElementById("petName");
const createBtn = document.getElementById("createBtn");
const resetBtn = document.getElementById("resetBtn");
const title = document.getElementById("title");
const statusEl = document.getElementById("status");
const alertsEl = document.getElementById("alerts");
const moodEl = document.getElementById("mood");
const statsEl = document.getElementById("stats");
const actionsEl = document.getElementById("actions");
const musicBtn = document.getElementById("musicBtn");
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

let gameMusic = null;
let musicInitDone = false;
let musicSourceIndex = 0;

const CANVAS_ANIM_CLASSES = ["pet-anim-happy", "pet-anim-playful", "pet-anim-grateful", "pet-anim-sick"];
const MOOD_PRESETS = {
  happy: { emoji: "😊", label: "Feliz", className: "mood-happy" },
  playful: { emoji: "😜", label: "Juguetón", className: "mood-playful" },
  calm: { emoji: "😐", label: "Calma", className: "mood-calm" },
  tense: { emoji: "😣", label: "Tenso", className: "mood-tense" },
  sad: { emoji: "😢", label: "Triste", className: "mood-sad" },
  angry: { emoji: "😠", label: "Enojado", className: "mood-angry" }
};

PETS.forEach((p) => {
  const o = document.createElement("option");
  o.value = p;
  o.textContent = p;
  petType.appendChild(o);
});

function tryPlayMusic() {
  if (!gameMusic) return;
  const result = gameMusic.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      // El navegador o WebView puede bloquear autoplay hasta interacción.
    });
  }
}

function pickSupportedMusicSource() {
  const tester = document.createElement("audio");
  const candidates = [
    { path: GAME_MUSIC_SOURCES[0], mime: "audio/wav" },
    { path: GAME_MUSIC_SOURCES[1], mime: "audio/midi" }
  ];

  const firstSupported = candidates.findIndex((c) => {
    try {
      return !!tester.canPlayType(c.mime);
    } catch {
      return false;
    }
  });

  musicSourceIndex = firstSupported >= 0 ? firstSupported : 0;
  return candidates[musicSourceIndex].path;
}

function updateMusicButtonLabel() {
  if (!musicBtn || !gameMusic) return;
  musicBtn.textContent = gameMusic.paused ? "🔊 Activar música" : "🔇 Silenciar música";
}

function tryResumeMusic() {
  if (!gameMusic || !gameMusic.paused) return;
  tryPlayMusic();
  updateMusicButtonLabel();
  if (!gameMusic.paused) {
    document.removeEventListener("pointerdown", tryResumeMusic);
    document.removeEventListener("touchstart", tryResumeMusic);
    document.removeEventListener("keydown", tryResumeMusic);
  }
}

function initGameMusic() {
  if (musicInitDone) return;
  musicInitDone = true;

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
  }

  gameMusic = new Audio();
  gameMusic.src = pickSupportedMusicSource();
  gameMusic.loop = true;
  gameMusic.volume = 0.35;
  gameMusic.preload = "auto";
  gameMusic.playsInline = true;

  gameMusic.addEventListener("error", () => {
    if (musicSourceIndex < GAME_MUSIC_SOURCES.length - 1) {
      musicSourceIndex += 1;
      gameMusic.src = GAME_MUSIC_SOURCES[musicSourceIndex];
      tryPlayMusic();
      updateMusicButtonLabel();
    }
  });

  // Warmup: autoplay silencioso para aumentar chances en WebView móviles.
  gameMusic.muted = true;
  const warmup = gameMusic.play();
  if (warmup && typeof warmup.then === "function") {
    warmup.then(() => {
      gameMusic.muted = false;
      updateMusicButtonLabel();
    }).catch(() => {
      gameMusic.muted = false;
      tryPlayMusic();
      updateMusicButtonLabel();
    });
  } else {
    gameMusic.muted = false;
    tryPlayMusic();
  }

  updateMusicButtonLabel();
  document.addEventListener("pointerdown", tryResumeMusic);
  document.addEventListener("click", tryResumeMusic);
  document.addEventListener("touchstart", tryResumeMusic, { passive: true });
  document.addEventListener("keydown", tryResumeMusic);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      tryResumeMusic();
    }
  });
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function save(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function rnd(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function left(ms) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}

function getDefaultNeeds() {
  return {
    hunger: 65,
    thirst: 65,
    happiness: 75,
    energy: 80,
    hygiene: 80,
    discipline: 55,
    health: 85,
    sick: false,
    poop: 0,
    sleeping: false,
    dead: false,
    careMistakes: 0,
    lastActionAt: Date.now(),
    mood: "calm"
  };
}

function setCanvasAnimation(className) {
  CANVAS_ANIM_CLASSES.forEach((c) => canvas.classList.remove(c));
  if (!className) return;
  void canvas.offsetWidth;
  canvas.classList.add(className);
}

function getBaseMood(n) {
  if (n.dead) return "angry";
  if (n.sick || n.health < 35) return "sad";
  if (n.hunger < 25 || n.thirst < 25 || n.hygiene < 25 || n.energy < 20) return "tense";
  if (n.happiness > 78 && n.energy > 35) return "playful";
  if (n.happiness > 60 && n.health > 60) return "happy";
  return "calm";
}

function getCurrentMood(s) {
  const now = Date.now();
  if (s?.fx && now < s.fx.until && MOOD_PRESETS[s.fx.mood]) {
    return {
      ...MOOD_PRESETS[s.fx.mood],
      label: s.fx.label || MOOD_PRESETS[s.fx.mood].label,
      emoji: s.fx.emoji || MOOD_PRESETS[s.fx.mood].emoji,
      fxText: s.fx.text || ""
    };
  }
  const base = s?.needs?.mood || "calm";
  return { ...MOOD_PRESETS[base] };
}

function triggerActionFx(s, config) {
  s.fx = {
    mood: config.mood,
    text: config.text,
    label: config.label,
    emoji: config.emoji,
    anim: config.anim,
    until: Date.now() + 2600
  };
  setCanvasAnimation(config.anim);
}

function createPet() {
  const name = (petName.value || "").trim();
  if (!name) return alert("Debes elegir nombre");
  if (name.length > 6) return alert("Máximo 6 caracteres");

  const now = Date.now();
  const minutes = rnd(1, 2);
  save({
    petType: petType.value,
    name,
    stage: "egg",
    createdAt: now,
    hatchAt: now + minutes * 60000,
    hatchedAt: null,
    eggBrokenAt: null,
    lastTickAt: now,
    needs: getDefaultNeeds()
  });
  render();
}

function tickNeeds(s) {
  if (!s || s.stage !== "baby" || s.needs.dead) return s;
  const now = Date.now();
  const last = s.lastTickAt || now;
  const minutes = Math.max(0, Math.floor((now - last) / 60000));
  if (minutes < 1) return s;

  const n = s.needs;
  for (let i = 0; i < minutes; i++) {
    n.hunger = clamp(n.hunger - 1.0);
    n.thirst = clamp(n.thirst - 1.2);
    n.happiness = clamp(n.happiness - 0.8);
    n.energy = clamp(n.energy + (n.sleeping ? 1.6 : -0.7));
    n.hygiene = clamp(n.hygiene - (n.poop > 0 ? 1.1 : 0.35));

    if (Math.random() < 0.06) n.poop = clamp(n.poop + 1, 0, 5);

    const bad = [n.hunger, n.thirst, n.happiness, n.hygiene, n.energy].filter((x) => x < 30).length;
    if (bad >= 2) n.careMistakes++;

    const risk = (n.hygiene < 35 ? 0.06 : 0) + (n.hunger < 25 ? 0.04 : 0) + (n.thirst < 25 ? 0.05 : 0) + (n.poop >= 2 ? 0.06 : 0);
    if (!n.sick && Math.random() < risk) n.sick = true;

    if (n.sick) n.health = clamp(n.health - 1.4);
    else {
      const rec = (n.hunger > 60 && n.thirst > 60 && n.hygiene > 60 && n.energy > 55) ? 0.25 : 0;
      n.health = clamp(n.health + rec - (bad > 2 ? 0.35 : 0));
    }

    if (n.health <= 0) {
      n.dead = true;
      break;
    }
  }

  s.lastTickAt = last + minutes * 60000;
  n.mood = getBaseMood(n);
  return s;
}

function hatchIfNeeded(s) {
  const now = Date.now();
  if (s.stage === "egg" && now >= s.hatchAt) {
    s.stage = "hatching";
    s.eggBrokenAt = now;
    save(s);
  }
  if (s.stage === "hatching" && now - (s.eggBrokenAt || now) > 3500) {
    s.stage = "baby";
    s.hatchedAt = now;
    s.lastTickAt = now;
    save(s);
  }
  return s;
}

function action(kind) {
  const s = load();
  if (!s || s.stage !== "baby" || s.needs.dead) return;
  const n = s.needs;

  switch (kind) {
    case "feed":
      n.hunger = clamp(n.hunger + 18);
      n.health = clamp(n.health + 2);
      triggerActionFx(s, {
        mood: "happy",
        label: "Agradecido",
        emoji: "😋",
        text: "¡Qué rico! Se ve satisfecho y agradecido.",
        anim: "pet-anim-grateful"
      });
      break;
    case "water":
      n.thirst = clamp(n.thirst + 20);
      n.health = clamp(n.health + 1);
      triggerActionFx(s, {
        mood: "calm",
        label: "Aliviado",
        emoji: "💧",
        text: "Tomó agua y se ve más aliviado.",
        anim: "pet-anim-happy"
      });
      break;
    case "play":
      n.happiness = clamp(n.happiness + 20);
      n.energy = clamp(n.energy - 6);
      n.thirst = clamp(n.thirst - 4);
      triggerActionFx(s, {
        mood: "playful",
        label: "Entusiasmado",
        emoji: "🎉",
        text: "¡Se divirtió muchísimo jugando!",
        anim: "pet-anim-playful"
      });
      break;
    case "clean":
      n.hygiene = clamp(n.hygiene + 24);
      n.poop = 0;
      triggerActionFx(s, {
        mood: "happy",
        label: "Cómodo",
        emoji: "✨",
        text: "Está limpio y de mejor humor.",
        anim: "pet-anim-happy"
      });
      break;
    case "medicine":
      if (n.sick) {
        n.sick = false;
        n.health = clamp(n.health + 18);
        triggerActionFx(s, {
          mood: "happy",
          label: "Recuperado",
          emoji: "💊",
          text: "La medicina funcionó. Se ve recuperado.",
          anim: "pet-anim-happy"
        });
      } else {
        n.health = clamp(n.health - 2);
        triggerActionFx(s, {
          mood: "tense",
          label: "Incómodo",
          emoji: "🤢",
          text: "No necesitaba medicina y no le gustó.",
          anim: "pet-anim-sick"
        });
      }
      break;
    case "sleep":
      n.sleeping = !n.sleeping;
      if (!n.sleeping) n.energy = clamp(n.energy + 4);
      triggerActionFx(s, {
        mood: n.sleeping ? "calm" : "happy",
        label: n.sleeping ? "Somnoliento" : "Descansado",
        emoji: n.sleeping ? "😴" : "🌞",
        text: n.sleeping ? "Se acomodó para dormir." : "Se despertó con más energía.",
        anim: "pet-anim-grateful"
      });
      break;
    case "discipline":
      n.discipline = clamp(n.discipline + 14);
      n.happiness = clamp(n.happiness - 5);
      triggerActionFx(s, {
        mood: "tense",
        label: "Vacilante",
        emoji: "😬",
        text: "Entendió el límite, pero quedó algo tenso.",
        anim: "pet-anim-sick"
      });
      break;
    case "praise":
      n.happiness = clamp(n.happiness + 8);
      n.discipline = clamp(n.discipline + 4);
      triggerActionFx(s, {
        mood: "happy",
        label: "Motivado",
        emoji: "🥰",
        text: "¡Le encantó el elogio!",
        anim: "pet-anim-happy"
      });
      break;
  }

  n.mood = getBaseMood(n);
  n.lastActionAt = Date.now();
  s.lastTickAt = Date.now();
  save(s);
  render();
}

function statBar(label, value) {
  const safe = clamp(value);
  return `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${safe}%"></i></div><b>${Math.round(safe)}</b></div>`;
}

function getAlerts(s) {
  if (s.stage !== "baby") return "";
  const n = s.needs;
  if (n.dead) return "💀 La mascota ha muerto por descuido.";
  const a = [];
  if (n.hunger < 30) a.push("hambre alta");
  if (n.thirst < 30) a.push("sed alta");
  if (n.happiness < 30) a.push("aburrimiento");
  if (n.hygiene < 30 || n.poop > 0) a.push("suciedad/caca");
  if (n.sick) a.push("enfermedad");
  if (n.energy < 25) a.push("cansancio");
  return a.length ? `⚠️ Atención: ${a.join(", ")}.` : "✅ Estado estable";
}

function drawEgg(t, crackLevel = 0, broken = false) {
  ctx.clearRect(0, 0, 240, 160);
  ctx.fillStyle = "#1f2a1f";
  ctx.fillRect(0, 150, 240, 4);
  const wobble = Math.sin(t / 180) * (2 + crackLevel * 4);

  ctx.save();
  ctx.translate(120 + wobble, 92);
  ctx.scale(1.12, 1.22);

  if (!broken) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1f2a1f";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (crackLevel > 0) {
      ctx.strokeStyle = "#1f2a1f";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(-2, -8);
      ctx.lineTo(2, -2);
      ctx.lineTo(8, -10);
      ctx.stroke();
      if (crackLevel > 0.5) {
        ctx.beginPath();
        ctx.moveTo(-12, 10);
        ctx.lineTo(-5, 4);
        ctx.lineTo(1, 10);
        ctx.stroke();
      }
      if (crackLevel > 0.8) {
        ctx.beginPath();
        ctx.moveTo(6, 8);
        ctx.lineTo(11, 2);
        ctx.lineTo(14, 8);
        ctx.stroke();
      }
    }
  } else {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-9, 6, 15, Math.PI * 0.9, Math.PI * 1.9);
    ctx.arc(9, 6, 15, Math.PI * 1.1, Math.PI * 0.1, true);
    ctx.fill();
    ctx.strokeStyle = "#1f2a1f";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawPetBody(x, y, style, t) {
  const bob = Math.sin(t / 140) * 2;
  const yy = y + bob;
  const u = 3;
  const px = (gx, gy, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + gx * u, yy + gy * u, u, u);
  };

  const dark = "#1f2a1f";
  const light = "#f6fff5";

  if (style.shape === "snake") {
    // cuerpo enrollado
    for (let gy = -3; gy <= 2; gy++) {
      for (let gx = -6; gx <= 4; gx++) {
        if ((gy === -3 && (gx < -4 || gx > 2)) || (gy === 2 && (gx < -5 || gx > 1))) continue;
        px(gx, gy, style.color);
      }
    }
    // cabeza y lengua
    px(5, -1, style.color); px(6, -1, style.color); px(5, 0, style.color); px(6, 0, style.color);
    px(7, 0, "#ef4f4f");
    // patrón
    for (let gx = -5; gx <= 2; gx += 2) px(gx, -1, "#88be62");
  } else if (style.shape === "shell") {
    // caparazón
    for (let gy = -4; gy <= 2; gy++) {
      for (let gx = -5; gx <= 5; gx++) {
        if ((gy === -4 && (gx < -3 || gx > 3)) || (gy === 2 && (gx < -4 || gx > 4))) continue;
        px(gx, gy, "#2f5f2f");
      }
    }
    // patrón caparazón
    for (let gx = -3; gx <= 3; gx += 2) {
      px(gx, -2, "#4f8f4f");
      px(gx, 0, "#4f8f4f");
    }
    // cabeza y patas
    for (let gx = 4; gx <= 6; gx++) px(gx, -1, style.color);
    px(-4, 3, style.color); px(-2, 3, style.color); px(1, 3, style.color); px(3, 3, style.color);
  } else if (style.shape === "duck") {
    // cuerpo
    for (let gy = -4; gy <= 2; gy++) {
      for (let gx = -4; gx <= 4; gx++) {
        if ((gy === -4 && (gx < -2 || gx > 2)) || (gy === 2 && (gx < -3 || gx > 3))) continue;
        px(gx, gy, style.color);
      }
    }
    // pico + ala
    px(5, -1, "#f1a024"); px(6, -1, "#f1a024"); px(5, 0, "#f1a024");
    px(-1, 0, "#9ad64b"); px(0, 0, "#9ad64b"); px(-1, 1, "#9ad64b");
  } else {
    // base "chibi" para aves/reptiles
    for (let gy = -4; gy <= 3; gy++) {
      for (let gx = -4; gx <= 4; gx++) {
        if ((gy === -4 && (gx < -2 || gx > 2)) || (gy === 3 && (gx < -3 || gx > 3))) continue;
        px(gx, gy, style.color);
      }
    }

    if (style.shape === "crest") {
      px(-1, -5, "#f0c419"); px(0, -6, "#f0c419"); px(1, -5, "#f0c419");
    } else if (style.shape === "lizard") {
      px(-5, 1, style.color); px(5, 1, style.color);
      px(-4, 2, style.color); px(4, 2, style.color);
      px(0, 4, "#6aa74d");
    }
  }

  // ojos + brillo
  px(-2, -1, style.eye); px(1, -1, style.eye);
  px(-2, 0, dark); px(1, 0, dark);
  px(-2, -2, light); px(1, -2, light);
}

function drawBaby(t, s) {
  ctx.clearRect(0, 0, 240, 160);
  ctx.fillStyle = "#1f2a1f";
  ctx.fillRect(0, 150, 240, 4);
  const style = PET_STYLES[s.petType] || { color: "#000", eye: "#fff", shape: "bird" };
  const mood = getCurrentMood(s);
  drawPetBody(120, 95, style, t);
  ctx.fillStyle = "#1f2a1f";
  ctx.fillText(s.name, 8, 14);

  ctx.font = "14px monospace";
  ctx.fillText(mood.emoji || "😐", 210, 16);
  ctx.font = "10px monospace";
}

function render() {
  let s = load();
  if (!s) {
    setup.classList.remove("hidden");
    game.classList.add("hidden");
    return;
  }

  s = hatchIfNeeded(s);
  s = tickNeeds(s);
  save(s);

  setup.classList.add("hidden");
  game.classList.remove("hidden");
  musicBtn.classList.remove("hidden");
  updateMusicButtonLabel();

  const now = Date.now();
  const remain = (s.hatchAt || now) - now;

  if (s.stage === "egg") {
    title.textContent = `🥚 ${s.name} (${s.petType})`;
    statusEl.textContent = `Eclosiona en: ${left(remain)}`;
    alertsEl.textContent = remain <= 5 * 60000 ? "⚡ El huevo comenzó a rajarse..." : "";
    statsEl.classList.add("hidden");
    actionsEl.classList.add("hidden");
    resetBtn.classList.add("hidden");
    moodEl.classList.add("hidden");
    setCanvasAnimation("");
  } else if (s.stage === "hatching") {
    title.textContent = `🐣 ${s.name} (${s.petType})`;
    statusEl.textContent = "¡Eclosionando!";
    alertsEl.textContent = "🥚💥 El cascarón se está rompiendo.";
    statsEl.classList.add("hidden");
    actionsEl.classList.add("hidden");
    resetBtn.classList.add("hidden");
    moodEl.classList.add("hidden");
  } else {
    const n = s.needs;
    n.mood = getBaseMood(n);
    const mood = getCurrentMood(s);
    title.textContent = `${n.dead ? "💀" : "🐾"} ${s.name} (${s.petType})`;
    statusEl.textContent = n.sleeping ? "Durmiendo" : "Despierto";
    alertsEl.textContent = mood.fxText || getAlerts(s);
    moodEl.classList.remove("hidden", "mood-happy", "mood-playful", "mood-calm", "mood-tense", "mood-sad", "mood-angry");
    moodEl.classList.add(mood.className);
    moodEl.textContent = `${mood.emoji} ${mood.label}`;
    statsEl.classList.remove("hidden");
    statsEl.classList.remove("mood-happy", "mood-playful", "mood-calm", "mood-tense", "mood-sad", "mood-angry");
    statsEl.classList.add(mood.className);
    if (n.dead) {
      actionsEl.classList.add("hidden");
      resetBtn.classList.remove("hidden");
    } else {
      actionsEl.classList.remove("hidden");
      resetBtn.classList.add("hidden");
    }
    statsEl.innerHTML = [
      statBar("Hambre", n.hunger),
      statBar("Sed", n.thirst),
      statBar("Felicidad", n.happiness),
      statBar("Energía", n.energy),
      statBar("Higiene", n.hygiene),
      statBar("Disciplina", n.discipline),
      statBar("Salud", n.health)
    ].join("");
  }
}

createBtn.addEventListener("click", createPet);
resetBtn.addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres reiniciar la mascota?")) return;
  localStorage.removeItem(KEY);
  render();
});

actionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  action(btn.dataset.action);
});

musicBtn.addEventListener("click", () => {
  if (!gameMusic) return;
  if (gameMusic.paused) {
    tryPlayMusic();
  } else {
    gameMusic.pause();
  }
  updateMusicButtonLabel();
});

let t = 0;
function loop() {
  const s = load();
  if (s) {
    if (s.stage === "egg") {
      const remain = (s.hatchAt || Date.now()) - Date.now();
      const crackLevel = remain <= 5 * 60000 ? clamp(1 - remain / (5 * 60000), 0, 1) : 0;
      drawEgg(t, crackLevel, false);
    } else if (s.stage === "hatching") {
      drawEgg(t, 1, true);
    } else {
      drawBaby(t, s);
    }
  }
  t += 16;
  requestAnimationFrame(loop);
}

render();
initGameMusic();
setInterval(render, 5000);
loop();
