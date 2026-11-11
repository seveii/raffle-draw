'use strict';
/* The balls inside the globe. Simple physics makes them pile up, tumble while the
   machine mixes, and settle again. They show no numbers: only the winning ball gets
   a number, when it is revealed (see js/draw.js). */

const G = 1700;                                   // gravity
let balls = [];
let dim = 1, dimTarget = 1;                       // the other balls turn see-through while one is being picked
let spot = 0;                                     // glow around the ball that is about to be picked

function initBalls(){
  balls = [];
  let tries = 0;
  while(balls.length < BALL_COUNT && tries++ < 8000){
    const x = GC.x + (Math.random() - .5) * 340, y = GC.y - 100 + Math.random() * 290;
    if(Math.hypot(x - GC.x, y - GC.y) > RIN - BALL_R) continue;
    if(balls.some(b => Math.hypot(b.x - x, b.y - y) < 2*BALL_R + 1)) continue;
    balls.push({x, y, vx:0, vy:0, r:BALL_R, wob:Math.random()*TAU,
      ci:Math.floor(Math.random() * PALETTE.length), num:null, held:false, isTarget:false});
  }
  for(let i = 0; i < 400; i++) physics(1/60, 0, 0);     // let them settle before the first frame
}

// energy 0..1 is how hard the machine is blowing the balls around
function physics(dt, energy, t){
  const sub = 3, h = dt / sub;
  for(let s = 0; s < sub; s++){
    for(const b of balls){
      if(b.held) continue;
      b.vy += G * h;
      if(energy > 0){
        b.vy -= 2700 * energy * Math.max(0, Math.sin(t * .007 + b.wob)) * h;
        b.vx += (Math.random() - .5) * 5200 * energy * h + (GC.x - b.x) * 1.4 * energy * h;
        const sp = Math.hypot(b.vx, b.vy);
        if(sp > 1100){ b.vx *= 1100 / sp; b.vy *= 1100 / sp; }
      }
      b.vx *= .9996; b.vy *= .9996;
      b.x += b.vx * h; b.y += b.vy * h;
      // keep the ball inside the round glass
      const dx = b.x - GC.x, dy = b.y - GC.y, d = Math.hypot(dx, dy), lim = RIN - b.r;
      if(d > lim){
        const nx = dx / d, ny = dy / d;
        b.x = GC.x + nx * lim; b.y = GC.y + ny * lim;
        const vn = b.vx * nx + b.vy * ny;
        if(vn > 0){ b.vx -= 1.5 * vn * nx; b.vy -= 1.5 * vn * ny; }
        b.vx *= .992; b.vy *= .992;
      }
    }
    // balls bounce off each other
    for(let i = 0; i < balls.length; i++){
      const a = balls[i]; if(a.held) continue;
      for(let j = i + 1; j < balls.length; j++){
        const c = balls[j]; if(c.held) continue;
        const dx = c.x - a.x, dy = c.y - a.y, min = a.r + c.r, d2 = dx*dx + dy*dy;
        if(d2 < min*min && d2 > .0001){
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = min - d;
          a.x -= nx * ov / 2; a.y -= ny * ov / 2; c.x += nx * ov / 2; c.y += ny * ov / 2;
          const rv = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
          if(rv > 0){ const j2 = rv * 1.55 / 2; a.vx -= j2*nx; a.vy -= j2*ny; c.vx += j2*nx; c.vy += j2*ny; }
        }
      }
    }
  }
}

function drawBalls(){
  ctx.save(); circ(ctx, GC.x, GC.y, GI); ctx.clip();
  for(const b of balls){                           // soft shadows
    if(b.held) continue;
    const a = b.isTarget ? 1 : dim;
    const sg = ctx.createRadialGradient(b.x + 3, b.y + 7, 2, b.x + 3, b.y + 7, b.r * 1.35);
    sg.addColorStop(0, `rgba(0,0,0,${.5 * a})`); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(b.x + 3, b.y + 7, b.r * 1.35, 0, TAU); ctx.fill();
  }
  let tgt = null;
  for(const b of balls){ if(b.held) continue; if(b.isTarget){ tgt = b; continue; } drawBall(ctx, b.x, b.y, b.r, b.ci, null, 0, dim); }
  if(tgt){                                         // the ball being picked stays solid, with a glow
    if(spot > 0){
      const sg = ctx.createRadialGradient(tgt.x, tgt.y, tgt.r * .6, tgt.x, tgt.y, tgt.r * 2.8);
      sg.addColorStop(0, `rgba(255,190,170,${.55 * spot})`); sg.addColorStop(1, 'rgba(255,190,170,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(tgt.x, tgt.y, tgt.r * 2.8, 0, TAU); ctx.fill();
    }
    drawBall(ctx, tgt.x, tgt.y, tgt.r, tgt.ci, null, 0);
  }
  ctx.restore();
}

/* ---------- hook into the scene ---------- */
scene.init.push(initBalls);
scene.update.push((ms, now) => {
  dim += (dimTarget - dim) * Math.min(1, ms * .005);
  physics(ms / 1000, shake, now);
});
scene.mid.push(drawBalls);
