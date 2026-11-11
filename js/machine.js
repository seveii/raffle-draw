'use strict';
/* The raffle machine: glass globe, top cap, light ring, red body with a number window,
   pull lever, buttons, prize slot, delivery tube and the hanging sign.
   The parts that never change are drawn once into two layers (back and front, see js/main.js);
   the number reels, lever and lights are redrawn every frame. */

/* =====================================================================
   STATIC ARTWORK
   ===================================================================== */
function drawFloorGlow(c){
  // the tiled floor is part of the page background; here: red glow + contact shadow under the machine
  const gl = c.createRadialGradient(360, 930, 20, 360, 930, 330);
  gl.addColorStop(0, 'rgba(255,60,70,.38)'); gl.addColorStop(1, 'rgba(255,60,70,0)');
  c.save(); c.translate(0, 930); c.scale(1, .28); c.translate(0, -930); c.fillStyle = gl; circ(c, 360, 930, 330); c.fill(); c.restore();
  c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(360, 940, 265, 24, 0, 0, TAU); c.fill();
}
function drawFloorBalls(c){
  [[96, 936, 20, 0], [150, 970, 23, 4], [664, 972, 22, 2], [694, 926, 16, 3]].forEach(([x, y, r, ci]) => {
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.ellipse(x + 3, y + r - 2, r * 1.05, r * .32, 0, 0, TAU); c.fill();
    drawPlainBall(c, x, y, r, ci);
  });
}
// glass delivery tube on the right, with a valve wheel
function drawTube(c){
  const y0 = 852, hgt = 34, x0 = 486, x1 = 646;
  c.fillStyle = chromeGrad(c, 634, 0, 658, 0); rr(c, 634, y0 + hgt - 2, 24, 50, 4); c.fill();
  c.fillStyle = chromeGrad(c, 622, 0, 670, 0); rr(c, 622, y0 + hgt + 44, 48, 12, 4); c.fill();
  drawPlainBall(c, 540, y0 + hgt/2, 14, 0); drawPlainBall(c, 598, y0 + hgt/2, 14, 4);
  const g = c.createLinearGradient(0, y0, 0, y0 + hgt);
  g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(.25, 'rgba(255,255,255,.08)'); g.addColorStop(.75, 'rgba(255,255,255,.04)'); g.addColorStop(1, 'rgba(255,255,255,.3)');
  c.fillStyle = g; rr(c, x0, y0, x1 - x0, hgt, 6); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.2; c.stroke();
  [x0 - 2, x1 - 14].forEach(x => { c.fillStyle = chromeGrad(c, 0, y0 - 5, 0, y0 + hgt + 5); rr(c, x, y0 - 5, 18, hgt + 10, 5); c.fill(); });
  c.strokeStyle = '#c9c0c4'; c.lineWidth = 4; c.lineCap = 'butt'; c.beginPath(); c.moveTo(572, y0); c.lineTo(572, y0 - 14); c.stroke();
  c.strokeStyle = redGrad(c, 552, 0, 592, 0); c.lineWidth = 5; c.beginPath(); c.ellipse(572, y0 - 16, 18, 6, 0, 0, TAU); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(555, y0 - 16); c.lineTo(589, y0 - 16); c.stroke();
  sphere(c, 572, y0 - 16, 3.5, '#ffffff', '#c9c0c4', '#3a2e32');
}
function drawSign(c){
  c.lineWidth = 6; c.lineCap = 'round';
  [486, 654].forEach(x => { c.strokeStyle = chromeGrad(c, x - 3, 0, x + 3, 0); c.beginPath(); c.moveTo(x, -4); c.lineTo(x, 34); c.stroke(); });
  rr(c, 430, 26, 274, 82, 41); c.fillStyle = chromeGrad(c, 0, 26, 0, 108); c.fill();
  rr(c, 438, 34, 258, 66, 33);
  let g = c.createLinearGradient(0, 34, 0, 100); g.addColorStop(0, '#3a0d16'); g.addColorStop(1, '#0a0304');
  c.fillStyle = g; c.fill();
  c.save(); rr(c, 438, 34, 258, 66, 33); c.clip();
  g = c.createLinearGradient(0, 34, 0, 70); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(438, 34, 258, 36); c.restore();
  const label = 'TECH RAFFLE'; let fs = 31;
  c.font = `italic 900 ${fs}px "Arial Black", Impact, "Segoe UI", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const tw = c.measureText(label).width;
  if(tw > 224){ fs *= 224 / tw; c.font = `italic 900 ${fs}px "Arial Black", Impact, "Segoe UI", sans-serif`; }
  for(let i = 4; i >= 1; i--){ c.fillStyle = '#6a0c1a'; c.fillText(label, 567 + i*.7, 69 + i*.9); }
  c.save(); c.shadowColor = 'rgba(255,60,75,.95)'; c.shadowBlur = 16; c.fillStyle = '#ff4150'; c.fillText(label, 567, 69); c.restore();
  c.fillStyle = '#ffe9e4'; c.fillText(label, 567, 68);
}
function drawPlate(c){
  rr(c, 172, 906, 376, 42, 22); c.fillStyle = '#25040a'; c.fill();                  // thickness
  rr(c, 172, 890, 376, 46, 23);
  const g = c.createLinearGradient(0, 890, 0, 936); g.addColorStop(0, '#b0182a'); g.addColorStop(1, '#5d0b17');
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.5; rr(c, 173, 891, 374, 44, 22); c.stroke();
}
function drawMachine(c){
  const {x0, x1, y0, y1} = BODY;
  // left side face
  c.beginPath(); c.moveTo(205, 744); c.lineTo(x0, y0); c.lineTo(x0, y1); c.lineTo(205, 922); c.closePath();
  let g = c.createLinearGradient(205, 0, x0, 0); g.addColorStop(0, '#1f0307'); g.addColorStop(1, '#5a0a15');
  c.fillStyle = g; c.fill();
  // front face
  rr(c, x0, y0, x1 - x0, y1 - y0, 10);
  g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#c91c2d'); g.addColorStop(.5, '#8a1021'); g.addColorStop(1, '#4a0912');
  c.fillStyle = g; c.fill();
  g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.12, 'rgba(255,255,255,0)'); g.addColorStop(.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
  c.fillStyle = g; rr(c, x0, y0, x1 - x0, y1 - y0, 10); c.fill();
  c.strokeStyle = 'rgba(255,200,200,.4)'; c.lineWidth = 1.5; rr(c, x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6, 8); c.stroke();
  // number window bezel
  rr(c, 250, 733, 220, 82, 13); c.fillStyle = chromeGrad(c, 0, 733, 0, 815); c.fill();
  rr(c, 257, 739, 206, 70, 8); c.fillStyle = '#0a0405'; c.fill();
  // engraved name plate
  rr(c, 296, 821, 128, 18, 4);
  g = c.createLinearGradient(0, 821, 0, 839); g.addColorStop(0, '#fff6ea'); g.addColorStop(1, '#cfc4b6'); c.fillStyle = g; c.fill();
  c.strokeStyle = '#6f6569'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#5a0b16'; c.font = '800 10.5px "Segoe UI", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('C O N T R O L   N O .', 360, 830.5);
  // lower control panel
  rr(c, 242, 846, 236, 42, 8); c.fillStyle = '#1a0a0f'; c.fill(); c.strokeStyle = chromeGrad(c, 0, 846, 0, 888); c.lineWidth = 2.5; c.stroke();
  [[268,'#ff8a8a','#e5222f','#5e0610'], [293,'#ffffff','#f1e6d6','#9a8c78'], [318,'#7a7a84','#25242a','#050506']].forEach(([x, a, b, d]) => {
    c.fillStyle = '#2a2024'; circ(c, x, 867, 11.5); c.fill();
    sphere(c, x, 867, 9, a, b, d);
  });
  // joystick
  c.fillStyle = chromeGrad(c, 345, 0, 367, 0); circ(c, 356, 873, 9); c.fill();
  c.strokeStyle = '#c9c0c4'; c.lineWidth = 3; c.beginPath(); c.moveTo(356, 873); c.lineTo(356, 858); c.stroke();
  sphere(c, 356, 856, 6.5, '#ff9a9a', '#d71f2e', '#5e0610');
  // prize slot
  rr(c, 392, 855, 76, 24, 5); c.fillStyle = chromeGrad(c, 0, 855, 0, 879); c.fill();
  rr(c, 396, 859, 68, 16, 3); c.fillStyle = '#050203'; c.fill();
  g = c.createLinearGradient(0, 859, 0, 875); g.addColorStop(0, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(120,20,30,.4)'); c.fillStyle = g; rr(c, 396, 859, 68, 16, 3); c.fill();
  // side lever boss + rivets
  c.fillStyle = chromeGrad(c, 205, 0, 225, 0); circ(c, 214, 752, 9); c.fill();
  [[x0 + 9, y0 + 9], [x1 - 9, y0 + 9], [x0 + 9, y1 - 9], [x1 - 9, y1 - 9]].forEach(([x, y]) => sphere(c, x, y, 3.2, '#ffffff', '#b5aab0', '#3a2e32'));
}
function drawGlobeBack(c){
  const g = c.createRadialGradient(GC.x - 30, GC.y - 50, 20, GC.x, GC.y, GI);
  g.addColorStop(0, 'rgba(120,28,44,.55)'); g.addColorStop(.7, 'rgba(50,10,18,.62)'); g.addColorStop(1, 'rgba(14,3,6,.8)');
  c.fillStyle = g; circ(c, GC.x, GC.y, GI); c.fill();
}
function drawCap(c){
  const {x, y:yt, rx, ry, yb} = CAP;
  // neck between cap and globe
  c.fillStyle = chromeGrad(c, x - 70, 0, x + 70, 0); rr(c, x - 70, yb - 6, 140, 22, 6); c.fill();
  // side band
  c.beginPath(); c.moveTo(x - rx, yt); c.ellipse(x, yt, rx, ry, 0, Math.PI, 0, true);
  c.lineTo(x + rx, yb); c.ellipse(x, yb, rx, ry, 0, 0, Math.PI); c.closePath();
  let g = c.createLinearGradient(x - rx, 0, x + rx, 0);
  g.addColorStop(0, '#2a0409'); g.addColorStop(.25, '#8a1021'); g.addColorStop(.45, '#e0303f'); g.addColorStop(.6, '#a8162a'); g.addColorStop(1, '#2a0409');
  c.fillStyle = g; c.fill();
  c.strokeStyle = chromeGrad(c, x - rx, 0, x + rx, 0); c.lineWidth = 4;
  c.beginPath(); c.ellipse(x, yb, rx, ry, 0, 0, Math.PI); c.stroke();
  // lid top
  c.beginPath(); c.ellipse(x, yt, rx, ry, 0, 0, TAU);
  g = c.createLinearGradient(0, yt - ry, 0, yt + ry); g.addColorStop(0, '#4a0912'); g.addColorStop(.5, '#a3182a'); g.addColorStop(1, '#d83040');
  c.fillStyle = g; c.fill();
  c.lineWidth = 6; c.strokeStyle = chromeGrad(c, 0, yt - ry, 0, yt + ry); c.stroke();
  c.strokeStyle = 'rgba(255,90,100,.9)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x, yt, rx - 30, ry - 6, 0, 0, TAU); c.stroke();
  for(let i = 0; i < 11; i++){                         // rivets along the front of the lid
    const a = Math.PI * (i + .5) / 11;
    sphere(c, x + (rx - 12) * Math.cos(a), yt + (ry - 5) * Math.sin(a), 3.4, '#ffffff', '#c9c0c4', '#3a2e32');
  }
  // opening
  c.beginPath(); c.ellipse(x, yt, HOLE.rx, HOLE.ry, 0, 0, TAU); c.fillStyle = '#060203'; c.fill();
  g = c.createLinearGradient(0, yt - HOLE.ry, 0, yt + HOLE.ry); g.addColorStop(0, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(90,10,20,.5)');
  c.fillStyle = g; c.fill();
  c.lineWidth = 5; c.strokeStyle = chromeGrad(c, 0, yt - HOLE.ry, 0, yt + HOLE.ry); c.stroke();
}
function drawGlass(c){
  const {x, y} = GC;
  c.save();
  circ(c, x, y, GR); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
  circ(c, x, y, GI); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke();
  let g = c.createRadialGradient(x, y, GR*.7, x, y, GR);
  g.addColorStop(0, 'rgba(255,225,225,0)'); g.addColorStop(.8, 'rgba(255,225,225,.07)'); g.addColorStop(1, 'rgba(255,225,225,.36)');
  c.fillStyle = g; circ(c, x, y, GR); c.fill();
  c.beginPath(); c.arc(x, y, GR - 9, Math.PI*1.03, Math.PI*1.56); c.arc(x + 22, y + 22, GR - 34, Math.PI*1.56, Math.PI*1.03, true); c.closePath();
  g = c.createLinearGradient(x - GR, y - GR*.45, x - 30, y - GR);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fill();
  c.beginPath(); c.arc(x, y, GR - 9, Math.PI*.05, Math.PI*.4); c.arc(x - 12, y - 12, GR - 26, Math.PI*.4, Math.PI*.05, true); c.closePath();
  c.fillStyle = 'rgba(255,170,170,.24)'; c.fill();
  c.save(); c.translate(x - 118, y - 128); c.rotate(-.75); c.scale(1, .4);
  g = c.createRadialGradient(0, 0, 0, 0, 0, 50); g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; circ(c, 0, 0, 50); c.fill(); c.restore();
  c.save(); circ(c, x, y, GI - 4); c.clip(); c.translate(x + 88, y - 50); c.rotate(.5);
  g = c.createLinearGradient(-16, 0, 16, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(-16, -140, 32, 280); c.restore();
  c.restore();
}
const LED_N = 26;
function ledPos(i){ const a = Math.PI * (i + .5) / LED_N; return {x:COLLAR.x + (COLLAR.rx - 6) * Math.cos(a), y:693 + COLLAR.ry * Math.sin(a)}; }
function drawCollar(c){
  const {x, y1, y2, rx, ry} = COLLAR;
  c.beginPath(); c.moveTo(x - rx, y1); c.ellipse(x, y1, rx, ry, 0, Math.PI, 0, true);
  c.lineTo(x + rx, y2); c.ellipse(x, y2, rx, ry, 0, 0, Math.PI); c.closePath();
  const g = c.createLinearGradient(x - rx, 0, x + rx, 0);
  g.addColorStop(0, '#2d040b'); g.addColorStop(.2, '#8a0f1d'); g.addColorStop(.45, '#e0303f'); g.addColorStop(.55, '#a8162a'); g.addColorStop(.85, '#5a0913'); g.addColorStop(1, '#240308');
  c.fillStyle = g; c.fill();
  c.strokeStyle = chromeGrad(c, x - rx, 0, x + rx, 0); c.lineWidth = 5; c.beginPath(); c.ellipse(x, y1, rx, ry, 0, 0, Math.PI); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y2, rx, ry, 0, 0, Math.PI); c.stroke();
  for(let i = 0; i < LED_N; i++){                    // dark bulb sockets
    const p = ledPos(i);
    c.fillStyle = '#1a0408'; circ(c, p.x, p.y, 5.4); c.fill();
  }
}

// back layer: everything behind the balls and the hand
function drawBack(c){
  drawFloorGlow(c); drawFloorBalls(c); drawSign(c); drawPlate(c); drawMachine(c); drawTube(c); drawGlobeBack(c); drawCap(c);
}
// front layer: glass, light-ring collar and the front half of the cap
function drawFront(c){
  drawGlass(c); drawCollar(c);
  // only the lid's front half goes in front of the hand and ball (they pass through the opening)
  c.save(); c.beginPath(); c.rect(0, HOLE.y, W, 200);
  c.ellipse(HOLE.x, HOLE.y, HOLE.rx, HOLE.ry, 0, 0, TAU); c.clip('evenodd');
  drawCap(c); c.restore();
}

/* =====================================================================
   MOVING PARTS
   ===================================================================== */
// --- number reels (the slot-style window) ---
const reels = [];
function setReelCount(n){ reels.length = 0; for(let i = 0; i < n; i++) reels.push({pos:0, mode:'idle', speed:18, t:0, started:false, target:0, from:0, to:0}); }
function reelsSpin(){ reels.forEach((r, i) => { r.mode = 'spin'; r.speed = 16 + i * 3; }); }
function reelsStop(str){                              // stop on the given digits, one reel after another
  reels.forEach((r, i) => { r.mode = 'stopping'; r.t = -i * 320; r.started = false; r.target = Number(str[i]) || 0; });
}
function updateReels(ms){
  for(const r of reels){
    if(r.mode === 'spin'){ r.pos = (r.pos + r.speed * ms / 1000) % 10; }
    else if(r.mode === 'stopping'){
      r.t += ms;
      if(r.t < 0){ r.pos = (r.pos + r.speed * ms / 1000) % 10; continue; }
      if(!r.started){ r.started = true; r.from = r.pos; r.to = r.from + (((r.target - r.from) % 10) + 10) % 10 + 10; }
      const p = clamp(r.t / 900, 0, 1);
      r.pos = lerp(r.from, r.to, easeOut(p));
      if(p >= 1){ r.pos = r.target; r.mode = 'idle'; sfx.ding(); }
    }
  }
}
function drawReels(now){
  const n = reels.length, areaX = REEL.x, areaW = REEL.w, gap = 4, y = REEL.y, h = REEL.h;
  const w = (areaW - (n - 1) * gap) / n;
  reels.forEach((r, i) => {
    const x = areaX + i * (w + gap);
    ctx.save(); rr(ctx, x, y, w, h, 4); ctx.clip();
    let g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#d9cfc2'); g.addColorStop(.5, '#fff6ea'); g.addColorStop(1, '#cfc4b6');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const base = Math.floor(r.pos), fr = r.pos - base;
    ctx.fillStyle = '#3a0a12'; ctx.font = `800 ${h * .84}px "Segoe UI", Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for(let k = -1; k <= 2; k++) ctx.fillText(String((((base + k) % 10) + 10) % 10), x + w/2, y + h/2 + 2 + (k - fr) * h);
    g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(.28, 'rgba(0,0,0,0)'); g.addColorStop(.72, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.restore();
  });
  ctx.save(); rr(ctx, areaX, y, areaW, h, 4); ctx.clip();
  const g = ctx.createLinearGradient(areaX, y, areaX + 60, y + h); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.5, 'rgba(255,255,255,.05)'); g.addColorStop(.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(areaX, y, areaW, h); ctx.restore();
  if(ph === 'show' && reels.every(r => r.mode === 'idle')){                      // winner glow
    ctx.save(); ctx.shadowColor = 'rgba(255,70,85,1)'; ctx.shadowBlur = 16 + 8 * Math.sin(now * .006);
    ctx.strokeStyle = 'rgba(255,110,120,.95)'; ctx.lineWidth = 2.5; rr(ctx, 255, 737, 210, 74, 10); ctx.stroke(); ctx.restore();
  }
}

// --- pull lever on the left ---
let leverT = 9999;                                    // ms since the lever was last pulled
function drawLever(){
  const t = leverT; let a = t < 200 ? t / 200 : t < 900 ? 1 - (t - 200) / 700 : 0; a = smooth(clamp(a, 0, 1));
  const th = -2.2 - a * 1.5, L = 74, px = 214, py = 752;
  const kx = px + Math.cos(th) * L, ky = py + Math.sin(th) * L;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2a2024'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(kx, ky); ctx.stroke();
  ctx.strokeStyle = '#d6ced2'; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px - 1, py - 1); ctx.lineTo(kx - 1, ky - 1); ctx.stroke();
  const g = ctx.createRadialGradient(kx - 5, ky - 6, 2, kx, ky, 16); g.addColorStop(0, '#ffb0b0'); g.addColorStop(.45, '#e0303f'); g.addColorStop(1, '#4a0610');
  ctx.fillStyle = g; circ(ctx, kx, ky, 16); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(kx - 5.5, ky - 7, 5, 3, -.7, 0, TAU); ctx.fill();
}

// --- glowing light ring around the base of the globe ---
function drawLEDs(now){
  const busy = isBusy();
  const level = i => busy ? .5 + .5 * Math.sin(now * .014 - i * .55) : .62 + .38 * Math.sin(now * .002 + i * .35);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for(let i = 0; i < LED_N; i++){
    const p = ledPos(i), lvl = level(i);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 13);
    g.addColorStop(0, `rgba(255,170,150,${.8 * lvl})`); g.addColorStop(1, 'rgba(255,60,70,0)');
    ctx.fillStyle = g; circ(ctx, p.x, p.y, 13); ctx.fill();
  }
  ctx.restore();
  for(let i = 0; i < LED_N; i++){
    const p = ledPos(i), lvl = level(i);
    ctx.fillStyle = `rgba(255,${Math.round(200 + 55 * lvl)},${Math.round(180 + 60 * lvl)},${.55 + .45 * lvl})`; circ(ctx, p.x, p.y, 3.6); ctx.fill();
  }
}

/* ---------- hook the moving parts into the scene ---------- */
scene.init.push(() => setReelCount(String(state.max).length));
scene.update.push(ms => { leverT += ms; updateReels(ms); });
scene.mid.push(drawReels, drawLever);
scene.top.push(drawLEDs);
