// ====== PERSONALIZADO ======
const START_DATE = new Date("2019-12-28T00:00:00"); // 28/12/2019
const MESSAGE = [
  "Silvia…\n\n",
  "Si pudiera elegir un lugar seguro,\nsería a tu lado.\n\n",
  "Eres mi calma, mi risa y mi hogar.\n",
  "Y cada día que pasa, te elijo otra vez. ❤️"
].join("");

const intro = document.getElementById("intro");
const wrap  = document.getElementById("wrap");
const envelope = document.getElementById("envelope");
const btnStart = document.getElementById("btnStart");

let opened = false;

// abrir sobre al tocarlo
envelope.addEventListener("click", () => {
  if (!opened) {
    opened = true;
    envelope.classList.add("open");
    burstSparkles(); // mini "magia"
  }
});
envelope.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") envelope.click();
});

// botón abrir
btnStart.addEventListener("click", start);

function start(){
  // si no lo abrió, lo abrimos igual
  envelope.classList.add("open");
  burstSparkles();

  intro.classList.add("hide");
  wrap.classList.add("show");
  wrap.setAttribute("aria-hidden","false");

  setTimeout(() => intro.remove(), 650);

  typeWriter("typed", MESSAGE, 20);
  startCounter();
  startFallingHearts();
  startSparkleLoop();
  drawHeartTree();
}

// ====== Typewriter ======
function typeWriter(id, text, speedMs){
  const el = document.getElementById(id);
  el.textContent = "";
  let i = 0;
  const tick = () => {
    el.textContent += text[i] || "";
    i++;
    if(i < text.length) setTimeout(tick, speedMs);
  };
  tick();
}

// ====== Counter ======
function startCounter(){
  const out = document.getElementById("since");
  const pad2 = n => String(n).padStart(2,"0");

  const update = () => {
    const now = new Date();
    let diff = Math.max(0, now - START_DATE);

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

// ====== Falling hearts (Canvas) ======
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
    hearts.push({
      x: rand(0, window.innerWidth),
      y: rand(-55, -10),
      s: rand(9, 20),
      vx: rand(-0.45, 0.45),
      vy: rand(1.0, 2.5),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.035, 0.035),
      a: rand(0.45, 0.92),
      hue: rand(345, 10)
    });
  }
  for(let i=0;i<55;i++) spawn();

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

    if(hearts.length < 85 && Math.random() < 0.7) spawn();

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

// ====== Sparkles (Canvas) ======
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

// ====== Heart Tree (Canvas) ======
function drawHeartTree(){
  const canvas = document.getElementById("tree");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  function drawTrunk(){
    ctx.save();
    ctx.translate(W/2, H*0.79);
    ctx.fillStyle = "#7b4b2a";
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.lineTo(34, -175);
    ctx.lineTo(-34, -175);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function heartPoints(n){
    const pts = [];
    for(let i=0;i<n;i++){
      const t = Math.random() * Math.PI * 2;
      const x = 16*Math.pow(Math.sin(t),3);
      const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
      const r = Math.random()*1.18;
      pts.push({ x: x*r, y: -y*r });
    }
    return pts;
  }

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

  const pts = heartPoints(260);
  const particles = pts.map(p => ({
    tx: W/2 + p.x*9.2,
    ty: H*0.30 + p.y*9.2,
    x: W/2,
    y: H*0.62,
    s: 4 + Math.random()*7,
    hue: 345 + Math.random()*35,
    a: 0.35 + Math.random()*0.62,
    sp: 0.02 + Math.random()*0.035
  }));

  let t = 0;
  function animate(){
    ctx.clearRect(0,0,W,H);

    ctx.fillStyle = "rgba(0,0,0,.08)";
    ctx.beginPath();
    ctx.ellipse(W/2, H*0.67, 120, 30, 0, 0, Math.PI*2);
    ctx.fill();

    drawTrunk();

    t += 1;
    for(const p of particles){
      p.x += (p.tx - p.x) * p.sp;
      p.y += (p.ty - p.y) * p.sp;

      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = `hsl(${p.hue} 92% 58%)`;
      heartPath(ctx, p.x, p.y, p.s);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }
  animate();
}
