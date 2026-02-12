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
    trunk1: "#6b3f25",
    trunk2: "#8a5635",
    shadow: "rgba(0,0,0,.10)",
    glow: "rgba(255,90,140,.10)",
    rose1: 350,
    rose2: 10
  };

  const petals = [];
  const floaters = [];

  function makeBranch(x1,y1,x2,y2,w,depth){
    const b = { x1,y1,x2,y2,w, children: [] };
    if(depth <= 0) return b;

    const n = depth > 2 ? 2 : 1;
    for(let i=0;i<n;i++){
      const t = rand(0.45, 0.8);
      const bx = lerp(x1,x2,t);
      const by = lerp(y1,y2,t);

      const ang = Math.atan2(y2-y1, x2-x1) + rand(-0.9, 0.9);
      const len = rand(70, 120) * (depth/5);

      const ex = bx + Math.cos(ang)*len;
      const ey = by + Math.sin(ang)*len;

      b.children.push(makeBranch(bx,by, ex,ey, w*rand(0.58,0.75), depth-1));
    }
    return b;
  }

  const trunk = makeBranch(
    W*0.55, H*0.88,
    W*0.52, H*0.38,
    22,
    5
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

  function drawRose(x,y,scale,phase,hueBase){
    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(x,y, 18*scale, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    const layers = 3;
    for(let L=0; L<layers; L++){
      const petalsCount = 6 + L*2;
      const s = (5 + L*2) * scale;
      const hue = hueBase + rand(-10, 10);
      const light = 58 - L*6;

      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = `hsl(${hue} 88% ${light}%)`;

      for(let i=0;i<petalsCount;i++){
        const a = (i/petalsCount)*Math.PI*2 + phase*(0.6 + L*0.15);
        const wobble = Math.sin(phase*1.2 + i)*0.12;

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
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(120,40,60,.35)";
    ctx.beginPath();
    ctx.arc(x,y, 3.2*scale, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function emitPetal(x,y){
    const hue = (Math.random() < 0.75) ? rand(palette.rose1, 360) : rand(0, palette.rose2);
    petals.push({
      x, y,
      vx: rand(-0.55, 0.55),
      vy: rand(0.6, 1.5),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.05, 0.05),
      s: rand(2.8, 5.2),
      a: rand(0.35, 0.85),
      hue
    });
  }

  function emitFloater(){
    floaters.push({
      x: rand(W*0.30, W*0.82),
      y: rand(H*0.14, H*0.48),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.08, 0.22),
      life: rand(80, 160),
      s: rand(1.2, 2.2),
      a: rand(0.08, 0.20)
    });
  }

  let tick = 0;
  function loop(){
    tick += 1;
    const time = tick/60;

    ctx.clearRect(0,0,W,H);

    ctx.save();
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(W*0.56, H*0.86, 150, 34, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    drawBranch(trunk);

    for(let i=0;i<tips.length;i++){
      const tip = tips[i];
      const bloom = Math.min(1, (time - i*0.04));
      if(bloom <= 0) continue;

      const scale = 0.55 + bloom*0.55 + Math.sin(time*1.4 + i)*0.03;
      const hue = (i % 2 === 0) ? palette.rose1 : palette.rose2;

      drawRose(tip.x, tip.y, scale, time*1.7 + i*0.2, hue);

      if(Math.random() < 0.03) emitPetal(tip.x, tip.y);
    }

    const wind = Math.sin(time*0.8)*0.25;

    for(const p of petals){
      p.vx += wind*0.015;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.a *= 0.995;

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
      if(petals[i].y > H+40 || petals[i].a < 0.05) petals.splice(i,1);
    }

    if(floaters.length < 40 && Math.random() < 0.6) emitFloater();
    for(const f of floaters){
      f.x += f.vx;
      f.y += f.vy;
      f.life -= 1;

      ctx.save();
      ctx.globalAlpha = f.a * Math.max(0, f.life/160);
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
  modal.hidden = true;
  modalImg.removeAttribute("src");
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
