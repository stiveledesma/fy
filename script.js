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

  typeScenes("typed", SCENES, 18, 650);
  startCounter();
  startFallingHearts();
  startSparkleLoop();

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

// ====== Fotos: modal (robusto + iPhone)
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");
const modalBackdrop = document.getElementById("modalBackdrop");

function closeModal(){
  modalImg.removeAttribute("src");
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

let unlocked = false;

function showFinalAfterTyping(){
  finalBtn.hidden = false;
  finalBtn.animate(
    [{ transform:"translateY(10px)", opacity:0 }, { transform:"translateY(0)", opacity:1 }],
    { duration: 420, easing: "ease-out" }
  );
}
function openFinal(){ finalModal.hidden = false; finalNote.textContent = ""; }
function closeFinal(){ finalModal.hidden = true; }

finalBtn.addEventListener("click", openFinal);
finalBackdrop.addEventListener("click", closeFinal);
finalClose.addEventListener("click", closeFinal);

keyBtn.addEventListener("click", () => {
  if(unlocked) return;
  unlocked = true;
  finalQuestion.hidden = false;
  burstSparkles();
});

finalYes.addEventListener("click", () => {
  finalNote.textContent = "¡¡Siii!! 😍 Prometo hacer de este día algo hermoso contigo.";
  burstSparkles();
  if(!musicOn) musicBtn.click();
});

finalNo.addEventListener("click", () => {
  finalNote.textContent = "No acepto ese ‘no’ 😌 Intenta otra vez con cariño.";
  finalNo.style.transform = `translate(${(Math.random()*80-40).toFixed(0)}px, ${(Math.random()*50-25).toFixed(0)}px)`;
  setTimeout(()=> finalNo.style.transform = "", 500);
});
