const PETS = ["Tortuga", "Canario", "Periquito", "Cacatua", "Agapornis", "Iguana", "Geco", "Serpiente", "Gallina", "Pato"];
const KEY = "virtgochi_state_v2";

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
const statsEl = document.getElementById("stats");
const actionsEl = document.getElementById("actions");
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

PETS.forEach((p) => {
  const o = document.createElement("option");
  o.value = p;
  o.textContent = p;
  petType.appendChild(o);
});

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
    lastActionAt: Date.now()
  };
}

function createPet() {
  const name = (petName.value || "").trim();
  if (!name) return alert("Debes elegir nombre");
  if (name.length > 6) return alert("Máximo 6 caracteres");

  const now = Date.now();
  const minutes = rnd(40, 90);
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
      break;
    case "water":
      n.thirst = clamp(n.thirst + 20);
      n.health = clamp(n.health + 1);
      break;
    case "play":
      n.happiness = clamp(n.happiness + 20);
      n.energy = clamp(n.energy - 6);
      n.thirst = clamp(n.thirst - 4);
      break;
    case "clean":
      n.hygiene = clamp(n.hygiene + 24);
      n.poop = 0;
      break;
    case "medicine":
      if (n.sick) {
        n.sick = false;
        n.health = clamp(n.health + 18);
      } else {
        n.health = clamp(n.health - 2);
      }
      break;
    case "sleep":
      n.sleeping = !n.sleeping;
      if (!n.sleeping) n.energy = clamp(n.energy + 4);
      break;
    case "discipline":
      n.discipline = clamp(n.discipline + 14);
      n.happiness = clamp(n.happiness - 5);
      break;
    case "praise":
      n.happiness = clamp(n.happiness + 8);
      n.discipline = clamp(n.discipline + 4);
      break;
  }

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
  ctx.fillStyle = style.color;

  if (style.shape === "snake") {
    ctx.fillRect(x - 18, yy - 9, 36, 18);
    ctx.fillRect(x + 16, yy - 5, 8, 8);
  } else if (style.shape === "shell") {
    ctx.fillRect(x - 15, yy - 11, 30, 22);
    ctx.fillStyle = "#2f5f2f";
    ctx.fillRect(x - 10, yy - 7, 20, 14);
    ctx.fillStyle = style.color;
  } else if (style.shape === "duck") {
    ctx.fillRect(x - 13, yy - 11, 26, 22);
    ctx.fillStyle = "#f1a024";
    ctx.fillRect(x + 12, yy - 4, 8, 5);
    ctx.fillStyle = style.color;
  } else {
    ctx.fillRect(x - 12, yy - 12, 24, 24);
    if (style.shape === "crest") {
      ctx.fillRect(x - 2, yy - 18, 4, 6);
    } else if (style.shape === "lizard") {
      ctx.fillRect(x - 16, yy + 7, 6, 3);
      ctx.fillRect(x + 10, yy + 7, 6, 3);
    }
  }

  ctx.fillStyle = style.eye;
  ctx.fillRect(x - 6, yy - 4, 3, 3);
  ctx.fillRect(x + 3, yy - 4, 3, 3);
}

function drawBaby(t, s) {
  ctx.clearRect(0, 0, 240, 160);
  ctx.fillStyle = "#1f2a1f";
  ctx.fillRect(0, 150, 240, 4);
  const style = PET_STYLES[s.petType] || { color: "#000", eye: "#fff", shape: "bird" };
  drawPetBody(120, 95, style, t);
  ctx.fillStyle = "#1f2a1f";
  ctx.fillText(s.name, 8, 14);
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

  const now = Date.now();
  const remain = (s.hatchAt || now) - now;

  if (s.stage === "egg") {
    title.textContent = `🥚 ${s.name} (${s.petType})`;
    statusEl.textContent = `Eclosiona en: ${left(remain)}`;
    alertsEl.textContent = remain <= 5 * 60000 ? "⚡ El huevo comenzó a rajarse..." : "";
    statsEl.classList.add("hidden");
    actionsEl.classList.add("hidden");
  } else if (s.stage === "hatching") {
    title.textContent = `🐣 ${s.name} (${s.petType})`;
    statusEl.textContent = "¡Eclosionando!";
    alertsEl.textContent = "🥚💥 El cascarón se está rompiendo.";
    statsEl.classList.add("hidden");
    actionsEl.classList.add("hidden");
  } else {
    const n = s.needs;
    title.textContent = `${n.dead ? "💀" : "🐾"} ${s.name} (${s.petType})`;
    statusEl.textContent = n.sleeping ? "Durmiendo" : "Despierto";
    alertsEl.textContent = getAlerts(s);
    statsEl.classList.remove("hidden");
    actionsEl.classList.remove("hidden");
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
setInterval(render, 5000);
loop();
