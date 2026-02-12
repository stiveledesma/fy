// ====== PERSONALIZADO ======
const START_DATE = new Date("2019-12-28T00:00:00");
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
  }catch(err){
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
  drawRoseTree();

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

// ====== Escenas (typewriter)
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

// ====== Falling hearts (solo rojos/rosas)
function startFallingHearts(){
  const c = document.getElementById("fall");
  const ctx = c.getContext("2d");

  const resize = () => {
    c.width = window.innerWidth * devicePixelRatio;
    c.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  };
  window.addEventListener("resize", resize);
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
      a: rand(0.35, 0.75),
      hue
    });
  }
  for(let i=0;i<48;i++) spawn();

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

    if(hearts.length < 75 && Math.random() < 0.6) spawn();

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
  window.addEventListener("resize", resize);
  resize();
}

function burstSparkles(){
  if(!sparkCtx) setupSpark();
  const rand = (a,b)=> a + Math.random()*(b-a);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2 - 40;

  for(let i=0;i<70;i++){
    sparkles.push({
      x: cx + rand(-60, 60),
      y: cy + rand(-40, 40),
      vx: rand(-2.2, 2.2),
      vy: rand(-2.2, 2.2),
      life: rand(24, 60),
      s: rand(1.5, 3.5),
      a: rand(.35, .9)
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

// ====== Rose Tree (pro)
function drawRoseTree(){
  const canvas = document.getElementById("tree");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const rand = (a,b)=> a + Math.random()*(b-a);
  const lerp = (a,b,t)=> a + (b-a)*t;

  const palette = {
    trunk1: "#5b341f",
    trunk2: "#8a5635",
    shadow: "rgba(0,0,0,.10)",
    glow: "rgba(255,90,140,.10)",
    roseA: 350,
    roseB: 10
  };

  const petals = [];
  const floaters = [];

  // árbol base con copa más amplia
  function makeBranch(x1,y1,x2,y2,w,depth){
    const b = { x1,y1,x2,y2,w, children: [] };
    if(depth <= 0) return b;

    // más ramitas arriba
    const n = depth >= 4 ? 3 : depth >= 2 ? 2 : 1;

    for(let i=0;i<n;i++){
      const t = rand(0.35, 0.82);
      const bx = lerp(x1,x2,t);
      const by = lerp(y1,y2,t);

      const baseAng = Math.atan2(y2-y1, x2-x1);
      const spread = depth >= 4 ? 1.15 : 0.95;
      const ang = baseAng + rand(-spread, spread);

      const len = rand(85, 150) * (depth/5);

      // limita para no irse fuera del canvas
      const ex = Math.max(W*0.18, Math.min(W*0.92, bx + Math.cos(ang)*len));
      const ey = Math.max(H*0.08, Math.min(H*0.90, by + Math.sin(ang)*len));

      b.children.push(makeBranch(bx,by, ex,ey, w*rand(0.58,0.78), depth-1));
    }
    return b;
  }

  // tronco más centrado y alto
  const trunk = makeBranch(
    W*0.55, H*0.90,
    W*0.53, H*0.32,
    26,
    6
  );

  function drawBranch(b){
    const grad = ctx.createLinearGradient(b.x1,b.y1,b.x2,b.y2);
    grad.addColorStop(0, palette.trunk1);
    grad.addColorStop(1, palette.trunk2);

    ctx.strokeStyle = grad;
    ctx.lineWidth = b.w;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(b.x1,b.y1);
    ctx.lineTo(b.x2,b.y2);
    ctx.stroke();

    for(const c of b.children) drawBranch(c);
  }

  const tips = [];
  function collectTips(b){
    if(!b.children.length) tips.push({x:b.x2,y:b.y2, w:b.w});
    for(const c of b.children) collectTips(c);
  }
  collectTips(trunk);

  // duplicamos tips para “llenar” la copa
  const richTips = [];
  tips.forEach(t => {
    richTips.push(t);
    richTips.push({ x: t.x + rand(-28,28), y: t.y + rand(-18,18), w: t.w*rand(0.7,1.0) });
  });

  function drawRose(x,y,scale,phase,hueBase){
    // glow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(x,y, 20*scale, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    const layers = 4; // + capas
    for(let L=0; L<layers; L++){
      const petalsCount = 8 + L*2;
      const s = (5 + L*2.1) * scale;
      const hue = hueBase + rand(-8, 8);
      const light = 60 - L*7;

      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = `hsl(${hue} 88% ${light}%)`;

      for(let i=0;i<petalsCount;i++){
        const a = (i/petalsCount)*Math.PI*2 + phase*(0.55 + L*0.12);
        const wobble = Math.sin(phase*1.1 + i)*0.10;

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

    // centro
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "rgba(110,25,55,.45)";
    ctx.beginPath();
    ctx.arc(x,y, 3.6*scale, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function emitPetal(x,y){
    const hue = (Math.random() < 0.75) ? rand(palette.roseA, 360) : rand(0, palette.roseB);
    petals.push({
      x, y,
      vx: rand(-0.65, 0.65),
      vy: rand(0.75, 1.8),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.06, 0.06),
      s: rand(3.0, 5.8),
      a: rand(0.35, 0.90),
      hue
    });
  }

  function emitFloater(){
    floaters.push({
      x: rand(W*0.25, W*0.86),
      y: rand(H*0.10, H*0.50),
      vx: rand(-0.22, 0.22),
      vy: rand(-0.08, 0.22),
      life: rand(90, 180),
      s: rand(1.2, 2.4),
      a: rand(0.08, 0.22)
    });
  }

  let tick = 0;
  function loop(){
    tick++;
    const time = tick/60;

    ctx.clearRect(0,0,W,H);

    // sombra suelo
    ctx.save();
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(W*0.58, H*0.87, 170, 36, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // tronco/ramas
    drawBranch(trunk);

    // flores (más densas)
    for(let i=0;i<richTips.length;i++){
      const tip = richTips[i];
      const bloom = Math.min(1, (time - i*0.02));
      if(bloom <= 0) continue;

      const scale = 0.45 + bloom*0.62 + Math.sin(time*1.2 + i)*0.03;
      const hue = (i % 2 === 0) ? palette.roseA : palette.roseB;

      drawRose(tip.x, tip.y, scale, time*1.6 + i*0.18, hue);

      // más pétalos (sin exagerar)
      if(Math.random() < 0.05) emitPetal(tip.x, tip.y);
    }

    // viento suave
    const wind = Math.sin(time*0.75)*0.28;

    // pétalos flotando
    for(const p of petals){
      p.vx += wind*0.016;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.a *= 0.994;

      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = `hsl(${p.hue} 88% 60%)`;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.quadraticCurveTo(p.s*0.9, -p.s*0.2, 0, p.s);
      ctx.quadraticCurveTo(-p.s*0.9, -p.s*0.2, 0, -p.s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for(let i=petals.length-1;i>=0;i--){
      if(petals[i].y > H+50 || petals[i].a < 0.05) petals.splice(i,1);
    }

    // sparkles sutiles
    if(floaters.length < 46 && Math.random() < 0.75) emitFloater();
    for(const f of floaters){
      f.x += f.vx;
      f.y += f.vy;
      f.life -= 1;

      ctx.save();
      ctx.globalAlpha = f.a * Math.max(0, f.life/180);
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.s, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    for(let i=floaters.length-1;i>=0;i--){
      if(floaters[i].life <= 0) floaters.splice(i,1);
    }

    requestAnimationFrame(loop);
  }

  loop();
}

// ====== Fotos: modal (robusto)
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
// Si el modal intenta cargar algo roto, cerramos
modalImg.addEventListener("error", closeModal);

document.querySelectorAll(".mini").forEach(img => {
  img.addEventListener("error", () => {
    img.dataset.missing = "1";
    img.style.display = "none";
  });

  img.addEventListener("click", () => {
    // Evita abrir si aún no está cargada
    if (img.dataset.missing === "1") return;

    // Fuerza carga correcta
    modalImg.src = img.src;
    modal.hidden = false;

    // si por cache tarda, igual se verá cuando termine de cargar
  });
});

modalBackdrop.addEventListener("click", closeModal);

// ====== SORPRESA FINAL: COFRE + LLAVE + PREGUNTA
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

  // "abrimos" el cofre visualmente
  chestBody.textContent = "🎁";

  setTimeout(() => {
    finalQuestion.hidden = false;
  }, 350);
});

finalYes.addEventListener("click", () => {
  finalNote.textContent = "¡¡Siii!! 😍 Prometo hacer de este día algo hermoso contigo.";
  burstSparkles();

  // intenta encender música al decir Sí (funciona porque es un click real)
  if(!musicOn){
    musicBtn.click();
  }
});

finalNo.addEventListener("click", () => {
  finalNote.textContent = "No acepto ese ‘no’ 😌 Intenta otra vez con cariño.";
  finalNo.style.transform = `translate(${(Math.random()*80-40).toFixed(0)}px, ${(Math.random()*50-25).toFixed(0)}px)`;
  setTimeout(()=> finalNo.style.transform = "", 500);
});
