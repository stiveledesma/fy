// ====== PERSONALIZADO ======
const START_DATE = new Date("2019-12-28T00:00:00");

// Texto por escenas (tipo carta)
const SCENES = [
  "Silvia…\n\n",
  "Si pudiera elegir un lugar seguro,\nsería a tu lado.\n\n",
  "Eres mi calma, mi risa y mi hogar.\n",
  "Y cada día que pasa, te amo más. ❤️"
];

const PS_MESSAGE = "Gracias por estar conmigo. Te elijo hoy, mañana y siempre.";

// ====== Elementos
const intro = document.getElementById("intro");
const wrap  = document.getElementById("wrap");
const envelope = document.getElementById("envelope");
const btnStart = document.getElementById("btnStart");

const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");

const psBox = document.getElementById("psBox");
const psText = document.getElementById("psText");

let opened = false;
let musicOn = false;

// abrir sobre
envelope.addEventListener("click", () => {
  if (!opened) {
    opened = true;
    envelope.classList.add("open");
    burstSparkles();
  }
});
envelope.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") envelope.click();
});

btnStart.addEventListener("click", start);

// Música: play/pause (iPhone requiere gesto)
musicBtn.addEventListener("click", async () => {
  try{
    if(!musicOn){
      await music.play();
      musicOn = true;
      musicBtn.textContent = "❚❚";
      musicLabel.textContent = "Sonando";
    } else {
      music.pause();
      musicOn = false;
      musicBtn.textContent = "▶︎";
      musicLabel.textContent = "Música";
    }
  }catch(_){
    musicLabel.textContent = "Toca otra vez";
  }
});

function start(){
  envelope.classList.add("open");
  burstSparkles();

  intro.classList.add("hide");
  wrap.classList.add("show");
  wrap.setAttribute("aria-hidden","false");
  setTimeout(() => intro.remove(), 650);

  // escenas
  typeScenes("typed", SCENES, 18, 650);

  startCounter();
  startFallingHearts();
  startSparkleLoop();
  drawHeartRoseTree();

  // P.D. al final + mostrar cofre
  const approxMs = estimateTypingMs(SCENES, 18, 650);
  psText.textContent = "";
  psBox.hidden = true;

  setTimeout(() => {
    psText.textContent = PS_MESSAGE;
    psBox.hidden = false;
    showFinalAfterTyping();
  }, Math.max(2200, approxMs - 200));
}

// ====== Typewriter por escenas
function typeScenes(id, parts, speedMs, pauseMs){
  const el = document.getElementById(id);
  el.textContent = "";
  let pi = 0, ci = 0;

  function tick(){
    const part = parts[pi];
    el.textContent += part[ci] || "";
    ci++;

    if(ci < part.length){
      setTimeout(tick, speedMs);
    } else {
      pi++;
      ci = 0;
      if(pi < parts.length){
        setTimeout(tick, pauseMs);
      }
    }
  }
  tick();
}
function estimateTypingMs(parts, speedMs, pauseMs){
  const chars = parts.reduce((a,p)=> a + p.length, 0);
  const pauses = Math.max(0, parts.length - 1) * pauseMs;
  return chars * speedMs + pauses;
}

// ====== Counter
function startCounter(){
  const out = document.getElementById("since");
  const pad2 = n => String(n).padStart(2,"0");

  const update = () => {
    const now = new Date();
    const diff = Math.max(0, now - START_DATE);

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hrs  = Math.floor((sec % 86400) / 3600);
    const min  = Math.floor((sec % 3600) / 60);
    const s    = sec % 60;

    out.textContent = `${days} días ${pad2(hrs)} horas ${pad2(min)} minutos ${pad2(s)} segundos`;
  };

  update();
  setInterval(update, 1000);
}

// ====== Falling hearts (decoración)
function startFallingHearts(){
  const c = document.getElementById("fall");
  const ctx = c.getContext("2d");

  const resize = () => {
    c.width = window.innerWidth * devicePixelRatio;
    c.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  };
  window.addEventListener("resize", resize, { passive:true });
  resize();

  const hearts = [];
  const rand = (a,b)=> a + Math.random()*(b-a);

  function spawn(){
    const hue = (Math.random() < 0.7) ? rand(345, 360) : rand(0, 15);
    hearts.push({
      x: rand(0, window.innerWidth),
      y: rand(-55, -10),
      s: rand(9, 18),
      vx: rand(-0.35, 0.35),
      vy: rand(0.95, 2.1),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.03, 0.03),
      a: rand(0.25, 0.55),
      hue
    });
  }
  for(let i=0;i<42;i++) spawn();

  function heartPath(ctx, x, y, size){
    ctx.beginPath();
    const t = size;
    ctx.moveTo(x, y + t/4);
    ctx.bezierCurveTo(x, y, x - t/2, y, x - t/2, y + t/4);
    ctx.bezierCurveTo(x - t/2, y + t/2, x, y + t*0.75, x, y + t);
    ctx.bezierCurveTo(x, y + t*0.75, x + t/2, y + t/2, x + t/2, y + t/4);
    ctx.bezierCurveTo(x + t/2, y, x, y, x, y + t/4);
    ctx.closePath();
  }

  function loop(){
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

    if(hearts.length < 70 && Math.random() < 0.5) spawn();

    for(const h of hearts){
      h.x += h.vx;
      h.y += h.vy;
      h.rot += h.vr;

      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.globalAlpha = h.a;
      ctx.fillStyle = `hsl(${h.hue} 90% 58%)`;
      heartPath(ctx, 0, 0, h.s);
      ctx.fill();
      ctx.restore();
    }

    for(let i=hearts.length-1;i>=0;i--){
      if(hearts[i].y > window.innerHeight + 80) hearts.splice(i,1);
    }

    requestAnimationFrame(loop);
  }
  loop();
}

// ====== Sparkles
let sparkCtx, sparkCanvas, sparkles = [];

function setupSpark(){
  sparkCanvas = document.getElementById("spark");
  sparkCtx = sparkCanvas.getContext("2d");

  const resize = () => {
    sparkCanvas.width = window.innerWidth * devicePixelRatio;
    sparkCanvas.height = window.innerHeight * devicePixelRatio;
    sparkCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  };
  window.addEventListener("resize", resize, { passive:true });
  resize();
}

function burstSparkles(){
  if(!sparkCtx) setupSpark();
  const rand = (a,b)=> a + Math.random()*(b-a);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2 - 40;

  for(let i=0;i<56;i++){
    sparkles.push({
      x: cx + rand(-60, 60),
      y: cy + rand(-40, 40),
      vx: rand(-2.0, 2.0),
      vy: rand(-2.0, 2.0),
      life: rand(22, 58),
      s: rand(1.5, 3.2),
      a: rand(.25, .75)
    });
  }
}

function startSparkleLoop(){
  if(!sparkCtx) setupSpark();

  function loop(){
    sparkCtx.clearRect(0,0,window.innerWidth, window.innerHeight);

    for(const p of sparkles){
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 1;

      sparkCtx.save();
      sparkCtx.globalAlpha = Math.max(0, p.a * (p.life/60));
      sparkCtx.fillStyle = "rgba(255,255,255,1)";
      sparkCtx.beginPath();
      sparkCtx.arc(p.x, p.y, p.s, 0, Math.PI*2);
      sparkCtx.fill();
      sparkCtx.restore();
    }
    sparkles = sparkles.filter(p => p.life > 0);

    requestAnimationFrame(loop);
  }
  loop();
}

// ====== Árbol FRONDOSO con copa en CORAZÓN ======
function drawHeartRoseTree(){
  const canvas = document.getElementById("tree");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const rand = (a,b)=> a + Math.random()*(b-a);
  const lerp = (a,b,t)=> a + (b-a)*t;

  const palette = {
    trunk1: "#5a321e",
    trunk2: "#8a5635",
    shadow: "rgba(0,0,0,.10)",
    glow: "rgba(255,90,140,.10)",
    roseA: 350,
    roseB: 8
  };

  const SETTINGS = {
    trunkX: W*0.56,
    trunkBottomY: H*0.90,
    trunkTopY: H*0.46,

    heartCX: W*0.58,
    heartCY: H*0.30,
    heartScale: W*0.012,    // escala de la ecuación del corazón
    rosesMain: 220,
    rosesExtra: 110,

    roseScaleMin: 0.38,
    roseScaleMax: 0.68,

    petalRate: 0.012,
    maxPetals: 220
  };

  function drawRose(x,y,scale,phase,hueBase){
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(x,y, 22*scale, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    const layers = 4;
    for(let L=0; L<layers; L++){
      const petalsCount = 8 + L*2;
      const s = (5 + L*2.2) * scale;
      const hue = hueBase + rand(-8, 8);
      const light = 60 - L*7;

      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = `hsl(${hue} 88% ${light}%)`;

      for(let i=0;i<petalsCount;i++){
        const a = (i/petalsCount)*Math.PI*2 + phase*(0.55 + L*0.12);
        const wobble = Math.sin(phase*1.0 + i)*0.10;

        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(a+wobble);
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(s*0.9, -s*0.2, 0, s);
        ctx.quadraticCurveTo(-s*0.9, -s*0.2, 0, -s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.70;
    ctx.fillStyle = "rgba(110,25,55,.45)";
    ctx.beginPath();
    ctx.arc(x,y, 3.7*scale, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawTrunk(t){
    const x = SETTINGS.trunkX;
    const y0 = SETTINGS.trunkBottomY;
    const y1 = SETTINGS.trunkTopY;

    // sombra suelo
    ctx.save();
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(x+W*0.03, H*0.87, 170, 36, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    const grad = ctx.createLinearGradient(x, y0, x, y1);
    grad.addColorStop(0, palette.trunk1);
    grad.addColorStop(1, palette.trunk2);

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // tronco
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    const sway = Math.sin(t*0.6)*6;
    ctx.quadraticCurveTo(x-10+sway, (y0+y1)/2, x, y1);
    ctx.stroke();

    // ramas simétricas
    const branches = [
      { ax:-1, by:0.18, len: W*0.18, up: H*0.10, w:12 },
      { ax: 1, by:0.18, len: W*0.18, up: H*0.10, w:12 },
      { ax:-1, by:0.30, len: W*0.14, up: H*0.08, w:10 },
      { ax: 1, by:0.30, len: W*0.14, up: H*0.08, w:10 },
      { ax:-1, by:0.42, len: W*0.10, up: H*0.06, w:8  },
      { ax: 1, by:0.42, len: W*0.10, up: H*0.06, w:8  }
    ];

    for(const b of branches){
      const sy = lerp(y0, y1, b.by);
      const sx = x + (Math.sin(t*0.7 + b.by*8) * 1.6);
      const ex = sx + b.ax * b.len;
      const ey = sy - b.up;

      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + b.ax*(b.len*0.35), sy - b.up*0.55, ex, ey);
      ctx.stroke();

      ctx.lineWidth = Math.max(3, b.w*0.5);
      for(let k=0;k<2;k++){
        const ax = b.ax * (k===0 ? 1 : 0.8);
        const rx = lerp(sx, ex, 0.62 + k*0.10);
        const ry = lerp(sy, ey, 0.62 + k*0.10);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.quadraticCurveTo(rx + ax*(b.len*0.18), ry - b.up*0.25, rx + ax*(b.len*0.28), ry - b.up*0.35);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Corazón paramétrico clásico:
  // x = 16 sin^3(t)
  // y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
  function heartPoint(t){
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return { x, y };
  }

  // genera puntos dentro del corazón usando "rechazo" y densidad pareja
  function generateHeartPoints(count){
    const pts = [];
    const cx = SETTINGS.heartCX;
    const cy = SETTINGS.heartCY;
    const s  = SETTINGS.heartScale;

    // bounding box del corazón en coordenadas “heart”
    // aprox x in [-16,16], y in [-17,13]
    const minX=-16, maxX=16, minY=-17, maxY=13;

    // rejilla para separación mínima (evita huecos y amontonamiento)
    const cell = 16;
    const grid = new Map();
    const key = (ix,iy)=> `${ix},${iy}`;

    function okDistance(x,y){
      const gx = Math.floor(x/cell);
      const gy = Math.floor(y/cell);
      for(let dx=-1; dx<=1; dx++){
        for(let dy=-1; dy<=1; dy++){
          const arr = grid.get(key(gx+dx, gy+dy));
          if(!arr) continue;
          for(const p of arr){
            const d2 = (p.x-x)*(p.x-x) + (p.y-y)*(p.y-y);
            if(d2 < (cell*cell)*0.55) return false;
          }
        }
      }
      return true;
    }

    let tries = 0;
    while(pts.length < count && tries < count*90){
      tries++;

      // punto aleatorio en caja
      const hx = rand(minX, maxX);
      const hy = rand(minY, maxY);

      // función implícita del corazón (aprox):
      // usamos un test: si está cerca de la forma paramétrica (relleno)
      // más simple: convertir (hx,hy) a canvas y chequear con distancia a borde por muestreo
      // Aquí: método práctico:
      // Generamos un borde cercano y aceptamos si está dentro con un criterio de "poder" del corazón:
      // (x^2 + y^2 - 1)^3 - x^2*y^3 <= 0 (corazón implícito)
      // Ajustamos hy para que quede bonito.
      const X = hx / 16;                 // normaliza [-1,1]
      const Y = (hy + 2) / 18;           // normaliza aprox [-1,1]
      const inside = Math.pow((X*X + Y*Y - 1), 3) - (X*X * Math.pow(Y,3)) <= 0;
      if(!inside) continue;

      const x = cx + hx * s;
      const y = cy - hy * s;

      if(!okDistance(x,y)) continue;

      const p = { x, y, seed: Math.random() };
      pts.push(p);

      const gx = Math.floor(x/cell), gy = Math.floor(y/cell);
      const k = key(gx,gy);
      if(!grid.has(k)) grid.set(k, []);
      grid.get(k).push(p);
    }

    return pts;
  }

  // refuerzo borde (para que se vea “frondoso” en el contorno del corazón)
  function generateHeartBorder(count){
    const pts = [];
    const cx = SETTINGS.heartCX;
    const cy = SETTINGS.heartCY;
    const s  = SETTINGS.heartScale;

    for(let i=0;i<count;i++){
      const t = (i/count) * Math.PI*2;
      const p = heartPoint(t);

      // escalas para que quede balanceado
      const x = cx + p.x * s;
      const y = cy - p.y * s;

      pts.push({
        x: x + rand(-10,10),
        y: y + rand(-10,10),
        seed: Math.random(),
        border: true
      });
    }
    return pts;
  }

  const petals = [];
  function emitPetal(x,y){
    if(petals.length > SETTINGS.maxPetals) return;
    const hue = (Math.random() < 0.75) ? rand(palette.roseA, 360) : rand(0, palette.roseB);
    petals.push({
      x, y,
      vx: rand(-0.55, 0.55),
      vy: rand(0.75, 1.7),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.06, 0.06),
      s: rand(3.0, 5.8),
      a: rand(0.30, 0.85),
      hue
    });
  }

  const insidePts = generateHeartPoints(SETTINGS.rosesMain);
  const borderPts = generateHeartBorder(SETTINGS.rosesExtra);
  const crownPts = insidePts.concat(borderPts);

  let tick = 0;
  function loop(){
    tick++;
    const t = tick/60;

    ctx.clearRect(0,0,W,H);

    drawTrunk(t);

    // profundidad: pinta de arriba a abajo
    const ordered = crownPts.slice().sort((a,b)=> a.y - b.y);

    for(let i=0;i<ordered.length;i++){
      const p = ordered[i];
      const sway = Math.sin(t*0.8 + p.seed*10) * 1.2;

      const scale =
        SETTINGS.roseScaleMin +
        (SETTINGS.roseScaleMax-SETTINGS.roseScaleMin) *
        (0.35 + 0.65*Math.sin(p.seed*9999)*0.5 + 0.5);

      const hue = (i % 2 === 0) ? palette.roseA : palette.roseB;

      drawRose(p.x + sway, p.y, p.border ? scale*1.06 : scale, t*1.35 + p.seed*2.0, hue);

      if(Math.random() < SETTINGS.petalRate) emitPetal(p.x, p.y);
    }

    // pétalos
    const wind = Math.sin(t*0.75)*0.25;
    for(const pet of petals){
      pet.vx += wind*0.014;
      pet.x += pet.vx;
      pet.y += pet.vy;
      pet.rot += pet.vr;
      pet.a *= 0.994;

      ctx.save();
      ctx.globalAlpha = pet.a;
      ctx.fillStyle = `hsl(${pet.hue} 88% 60%)`;
      ctx.translate(pet.x, pet.y);
      ctx.rotate(pet.rot);
      ctx.beginPath();
      ctx.moveTo(0, -pet.s);
      ctx.quadraticCurveTo(pet.s*0.9, -pet.s*0.2, 0, pet.s);
      ctx.quadraticCurveTo(-pet.s*0.9, -pet.s*0.2, 0, -pet.s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for(let i=petals.length-1;i>=0;i--){
      if(petals[i].y > H+60 || petals[i].a < 0.05) petals.splice(i,1);
    }

    requestAnimationFrame(loop);
  }

  loop();
}

// ====== Fotos: modal (robusto + iPhone)
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");
const modalBackdrop = document.getElementById("modalBackdrop");

function closeModal(){
  modalImg.removeAttribute("src"); // evita ícono roto
  modal.hidden = true;
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
modalImg.addEventListener("error", closeModal);

document.querySelectorAll(".mini").forEach(img => {
  img.addEventListener("error", () => {
    img.dataset.missing = "1";
    img.style.display = "none";
  });

  // iPhone: mejor respuesta usando pointerup
  img.addEventListener("pointerup", () => {
    if (img.dataset.missing === "1") return;
    modalImg.src = img.src;
    modal.hidden = false;
  });
});

// ====== SORPRESA FINAL: cofre + llave + pregunta
const finalBtn = document.getElementById("finalBtn");
const finalModal = document.getElementById("finalModal");
const finalBackdrop = document.getElementById("finalBackdrop");
const finalClose = document.getElementById("finalClose");
const keyBtn = document.getElementById("keyBtn");
const finalQuestion = document.getElementById("finalQuestion");
const finalYes = document.getElementById("finalYes");
const finalNo = document.getElementById("finalNo");
const finalNote = document.getElementById("finalNote");
const chestBody = document.getElementById("chestBody");

let unlocked = false;

function showFinalAfterTyping(){
  finalBtn.hidden = false;
  finalBtn.animate(
    [{ transform:"translateY(10px)", opacity:0 }, { transform:"translateY(0)", opacity:1 }],
    { duration: 420, easing: "ease-out" }
  );
}
function openFinal(){
  finalModal.hidden = false;
  finalNote.textContent = "";
}
function closeFinal(){
  finalModal.hidden = true;
}

finalBtn.addEventListener("click", openFinal);
finalBackdrop.addEventListener("click", closeFinal);
finalClose.addEventListener("click", closeFinal);

keyBtn.addEventListener("click", () => {
  if(unlocked) return;
  unlocked = true;

  const card = finalModal.querySelector(".final-card");
  card.classList.add("unlock");
  chestBody.textContent = "🎁";

  setTimeout(() => {
    finalQuestion.hidden = false;
  }, 350);
});

finalYes.addEventListener("click", () => {
  finalNote.textContent = "¡¡Siii!! 😍 Prometo hacer de este día algo hermoso contigo.";
  burstSparkles();

  // enciende música si no está sonando (click real → iPhone OK)
  if(!musicOn) musicBtn.click();
});

finalNo.addEventListener("click", () => {
  finalNote.textContent = "No acepto ese ‘no’ 😌 Intenta otra vez con cariño.";
  finalNo.style.transform = `translate(${(Math.random()*80-40).toFixed(0)}px, ${(Math.random()*50-25).toFixed(0)}px)`;
  setTimeout(()=> finalNo.style.transform = "", 500);
});
