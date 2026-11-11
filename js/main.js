'use strict';
/* Canvas sizing, the animation loop and start-up. Loaded last, after every feature file
   has added its steps to `scene`. */

let DPR = 1, layerBack = null, layerFront = null;

// size the machine canvas and pre-render the parts that never change
function fit(){
  DPR = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1));
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const mk = fn => {
    const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    const x = c.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); fn(x); return c;
  };
  layerBack = mk(drawBack); layerFront = mk(drawFront);
}

function render(now){
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(layerBack, 0, 0, W, H);
  for(const draw of scene.mid) draw(now);
  ctx.drawImage(layerFront, 0, 0, W, H);
  for(const draw of scene.top) draw(now);
}

// fixed small steps keep the motion smooth even at low frame rates
function advance(total, now){
  let t = now - total;
  while(total > 0){
    const s = Math.min(16.7, total); t += s;
    for(const step of scene.update) step(s, t);
    total -= s;
  }
}

/* ---------- start-up ---------- */
for(const start of scene.init) start();
fit();
addEventListener('resize', fit);

let last = performance.now();
function frame(now){
  const ms = Math.min(120, now - last); last = now;
  advance(ms, now);
  render(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// hook for automated checks: jump the animation forward by a number of milliseconds
window.__raffleAdvance = ms => { const now = performance.now(); advance(ms, now); render(now); return ph; };
