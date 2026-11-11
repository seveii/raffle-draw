'use strict';
/* The draw itself: mixing the balls, the hand that reaches in through the top cap and
   picks one, the big reveal of the winning control number, and confetti. */

/* ---------- the gloved hand on its chrome rod ---------- */
const K0 = 1.3;                                   // hand scale while reaching
const HOLD = {x:360, y:62, k:1.4, r:38};          // where the hand lifts the ball to, above the cap
const GRIP = 47;                                  // palm-to-ball-top distance: the ball hangs from the fingertips
const hand = {active:false, x:360, y:-90, k:K0, ballR:BALL_R, grip:0, held:null};

function armGeom(Wp){
  const A = {x:HOLE.x, y:HOLE.y + 2};
  let P1, topX;
  if(Wp.y >= A.y){ P1 = A; topX = A.x; }
  else{
    const s = clamp((A.y - Wp.y) / 50, 0, 1);
    P1 = {x:lerp(A.x, Wp.x, s), y:lerp(A.y, Wp.y, s)}; topX = lerp(A.x, Wp.x, s);
  }
  return {P1, topX, theta:Math.atan2(-(Wp.x - P1.x), Math.max(Wp.y - P1.y, 80))};
}
// palm position that puts the fingertips on the ball at (bx, by)
function palmForBall(bx, by){
  const off = GRIP * K0 + BALL_R;
  let Wp = {x:bx, y:by - off};
  for(let i = 0; i < 4; i++){
    const g = armGeom(Wp);
    Wp = {x:bx + Math.sin(g.theta) * off, y:by - Math.cos(g.theta) * off};
  }
  return Wp;
}
let gloveFill = null;
function glovePath(pts, w){
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#6a6070'; ctx.lineWidth = w + 3; ctx.stroke();
  ctx.strokeStyle = gloveFill; ctx.lineWidth = w; ctx.stroke();
}
function drawGlove(g){                               // g: 0 = open hand, 1 = closed
  gloveFill = ctx.createLinearGradient(-28, 0, 28, 0);
  gloveFill.addColorStop(0, '#bdb4c6'); gloveFill.addColorStop(.3, '#ffffff'); gloveFill.addColorStop(.65, '#f0ecf3'); gloveFill.addColorStop(1, '#b2a9bc');
  glovePath([[-18,0], [lerp(-32,-27,g), lerp(14,22,g)], [lerp(-37,-13,g), lerp(30,40,g)]], 10);
  [-16, -5.4, 5.4, 16].forEach(x => {
    const open = [[x,10], [x*1.3,36], [x*1.65,58]];
    const closed = [[x,10], [x*1.12,36], [x*.5,52]];
    glovePath(open.map((p,j) => [lerp(p[0], closed[j][0], g), lerp(p[1], closed[j][1], g)]), 10);
  });
  rr(ctx, -22, -18, 44, 34, 12); ctx.fillStyle = gloveFill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6a6070'; ctx.stroke();
  ctx.strokeStyle = 'rgba(120,108,130,.45)'; ctx.lineWidth = 1.5;
  [-8, 0, 8].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x, 5); ctx.stroke(); });
  // red wrist collar with a chrome band
  rr(ctx, -17, -34, 34, 19, 6);
  const wg = ctx.createLinearGradient(-17, 0, 17, 0);
  wg.addColorStop(0, '#3a050d'); wg.addColorStop(.35, '#ff4a58'); wg.addColorStop(.6, '#c01a2a'); wg.addColorStop(1, '#2a0409');
  ctx.fillStyle = wg; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#1c0306'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-15, -22, 30, 2.5);
}
function drawHand(){
  const Wp = {x:hand.x, y:hand.y}, g = armGeom(Wp), k = hand.k;
  ctx.save();
  // visible above the cap, through its opening, or inside the glass globe only
  ctx.beginPath(); ctx.rect(0, 0, W, HOLE.y + 10);
  ctx.moveTo(GC.x + GI, GC.y); ctx.arc(GC.x, GC.y, GI, 0, TAU);
  ctx.clip();
  // slim chrome rod
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(g.topX, -90); ctx.lineTo(g.P1.x, g.P1.y); ctx.lineTo(Wp.x, Wp.y);
  ctx.strokeStyle = '#1c1417'; ctx.lineWidth = 11 * k + 2; ctx.stroke();
  const mx = (g.P1.x + Wp.x) / 2;
  const sg = ctx.createLinearGradient(mx - 6*k, 0, mx + 6*k, 0);
  sg.addColorStop(0, '#4a3e42'); sg.addColorStop(.3, '#ffffff'); sg.addColorStop(.55, '#cfc6ca'); sg.addColorStop(1, '#5a4e52');
  ctx.strokeStyle = sg; ctx.lineWidth = 11 * k; ctx.stroke();
  // hand, with the picked ball hanging from the fingertips (its number stays hidden)
  ctx.translate(Wp.x, Wp.y); ctx.rotate(g.theta); ctx.scale(k, k);
  if(hand.held){ const rb = hand.ballR / k; drawBall(ctx, 0, GRIP + rb, rb, hand.held.ci, null, 0); }
  drawGlove(hand.grip);
  ctx.restore();
}

/* ---------- the winning ball, presented large in front of the globe ---------- */
const BIG_R = 118;
const big = {active:false, x:GC.x, y:GC.y, r:BIG_R, a:0};
let bigFrom = {x:GC.x, y:GC.y, r:BIG_R}, lastPrize = '';
function drawBig(now){
  if(!big.active || !target) return;
  const {x, y, r, a} = big;
  let g = ctx.createRadialGradient(x, y, r * .8, x, y, 380);            // soft spotlight vignette
  g.addColorStop(0, `rgba(6,1,3,${.74 * a})`); g.addColorStop(1, 'rgba(6,1,3,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(x, y); ctx.rotate(now * .0004);             // slow rotating rays
  const rg = ctx.createRadialGradient(0, 0, r, 0, 0, r * 3);
  rg.addColorStop(0, `rgba(255,110,110,${.4 * a})`); rg.addColorStop(1, 'rgba(255,110,110,0)');
  ctx.fillStyle = rg;
  for(let i = 0; i < 14; i++){ const a0 = i * TAU / 14; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 3, a0, a0 + TAU / 28); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  g = ctx.createRadialGradient(x, y, r * .9, x, y, r * 1.7);
  g.addColorStop(0, `rgba(255,200,180,${.6 * a})`); g.addColorStop(1, 'rgba(255,200,180,0)');
  ctx.fillStyle = g; circ(ctx, x, y, r * 1.7); ctx.fill();
  drawBall(ctx, x, y, r, target.ci, target.num, 0);
  if(a > .5){
    ctx.save(); ctx.globalAlpha = (a - .5) * 2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,60,75,.95)'; ctx.shadowBlur = 18; ctx.fillStyle = '#fff3ee';
    ctx.font = '900 38px "Arial Black", "Segoe UI", sans-serif'; ctx.fillText('W I N N E R', x, y - r - 42);
    if(lastPrize){ ctx.shadowBlur = 12; ctx.font = '800 26px "Segoe UI", Arial, sans-serif'; ctx.fillText(lastPrize, x, y + r + 40); }
    ctx.restore();
  }
}

/* ---------- confetti (on its own full-page canvas) ---------- */
const cfc = $('confetti'), cfx = cfc.getContext('2d');
let confetti = [], cfDirty = false;
const CF_COLORS = ['#ffe2a0','#d71f2e','#7d1022','#ffffff','#ff4150','#f4ebde','#232227'];
function sizeConfetti(){
  const d = Math.min(window.devicePixelRatio || 1, 2);
  cfc.width = innerWidth * d; cfc.height = innerHeight * d; cfx.setTransform(d, 0, 0, d, 0, 0);
}
sizeConfetti(); addEventListener('resize', sizeConfetti);
function burst(){
  const r = cv.getBoundingClientRect();
  const ox = r.left + r.width * (GC.x / W), oy = r.top + r.height * (GC.y / H);
  const n = reduceMotion ? 40 : 180;
  for(let i = 0; i < n; i++){
    const a = Math.random() * TAU, sp = 250 + Math.random() * 550;
    confetti.push({x:ox, y:oy, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp - 350, w:6 + Math.random()*6, h:4 + Math.random()*5,
      rot:Math.random()*TAU, vr:(Math.random() - .5) * 14, c:CF_COLORS[i % CF_COLORS.length], life:0});
  }
}
function updateConfetti(ms){
  if(!confetti.length) return;
  const dt = ms / 1000, drag = Math.pow(.992, ms / 16.7);
  for(const p of confetti){ p.vy += 900 * dt; p.vx *= drag; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life += dt; }
  confetti = confetti.filter(p => p.life < 4.5 && p.y < innerHeight + 40);
}
function drawConfetti(){
  if(!confetti.length){ if(cfDirty){ cfx.clearRect(0, 0, innerWidth, innerHeight); cfDirty = false; } return; }
  cfDirty = true;
  cfx.clearRect(0, 0, innerWidth, innerHeight);
  for(const p of confetti){
    cfx.save(); cfx.globalAlpha = clamp(1 - (p.life - 3) / 1.5, 0, 1);
    cfx.translate(p.x, p.y); cfx.rotate(p.rot); cfx.fillStyle = p.c; cfx.fillRect(-p.w/2, -p.h/2, p.w, p.h); cfx.restore();
  }
}

/* ---------- the draw sequence ---------- */
// shake -> reach -> grab -> lift -> present -> show; a new draw first runs retract
const DUR = {shake:2800, reach:1700, grab:500, lift:2000, present:800, retract:600};
let pt = 0;                                          // ms spent in the current phase
let winner = null, target = null;                    // winning number, and the ball that carries it
let reachStart = {x:360, y:-90}, liftStart = {x:360, y:400};
let flashAcc = 0;
function setPhase(p){ ph = p; pt = 0; updateUI(); }

// every control number that can still win
function buildPool(){
  const drawn = state.noRepeat ? new Set(state.history.map(h => h.no)) : null;
  const out = [];
  for(let n = 1; n <= state.max; n++) if(!drawn || !drawn.has(n)) out.push(n);
  return out;
}

function startDraw(){
  if(isBusy()) return;
  const pool = buildPool();
  if(!pool.length){ statusEl.textContent = 'Every control number has already been drawn.'; return; }
  ensureAudio();
  winner = pool[randInt(pool.length)];               // the winner is picked here, fairly, from the whole pool
  setDisplayMode('flashing');
  statusEl.textContent = 'Mixing the balls…';
  leverT = 0; reelsSpin();
  if(ph === 'show'){ bigFrom = {x:big.x, y:big.y, r:big.r}; dimTarget = 1; setPhase('retract'); }
  else { setPhase('shake'); sfx.start(); }
}
function flash(ms, interval){                        // flashing random numbers on the big display
  flashAcc += ms;
  if(flashAcc >= interval){
    flashAcc = 0; setDisplay(1 + Math.floor(Math.random() * state.max)); sfx.tick();
  }
}
function chooseTarget(){                             // the hand goes for one of the top balls
  const sorted = balls.filter(b => !b.held).sort((a, b) => a.y - b.y);
  target = sorted[Math.floor(Math.random() * Math.min(4, sorted.length))];
  target.num = winner; target.isTarget = true;
  dimTarget = .3;
  hand.active = true; hand.x = HOLE.x; hand.y = -90; hand.k = K0; hand.ballR = BALL_R; hand.grip = 0; hand.held = null;
  reachStart = {x:hand.x, y:hand.y};
  statusEl.textContent = 'Picking a ball…';
}
function reveal(){
  setDisplay(winner); setDisplayMode('winner');
  const prize = prizeInput.value.trim(); lastPrize = prize;
  state.history.push({no:winner, prize, at:Date.now()});
  store.set('raffle.history', state.history);
  renderHistory();
  statusEl.textContent = `Control No. ${pad(winner)} wins${prize ? ' — ' + prize : ''}!`;
  burst(); sfx.fanfare(); updateUI();
}
function respawnBall(){                              // the shown ball drops back into the globe as a plain ball
  const b = target; target = null; hand.held = null;
  b.held = false; b.isTarget = false; b.num = null;
  b.x = GC.x + (Math.random() - .5) * 30; b.y = GC.y - GI + 70; b.vx = (Math.random() - .5) * 200; b.vy = 0;
  dimTarget = 1;
}

function stepDraw(ms){
  pt += ms; shake = 0;
  switch(ph){
    case 'shake': {
      const p = pt / DUR.shake;
      shake = Math.min(1, pt / 350) * (p > .88 ? Math.max(0, (1 - p) / .12) : 1);
      flash(ms, 80);
      if(pt >= DUR.shake){ chooseTarget(); setPhase('reach'); }
      break;
    }
    case 'reach': {
      const p = clamp(pt / DUR.reach, 0, 1), e = easeIO(p);
      const goal = palmForBall(target.x, target.y);
      hand.grip = lerp(0, .15, p); spot = p;
      hand.x = lerp(reachStart.x, goal.x, e); hand.y = lerp(reachStart.y, goal.y, e);
      flash(ms, lerp(100, 200, p));
      if(pt >= DUR.reach){
        hand.x = goal.x; hand.y = goal.y; target.held = true; hand.held = target; target.vx = target.vy = 0; spot = 0;
        setPhase('grab'); sfx.thump();
      }
      break;
    }
    case 'grab': {
      const p = clamp(pt / DUR.grab, 0, 1);
      hand.grip = lerp(.15, 1, easeOut(p));
      flash(ms, 220);
      if(pt >= DUR.grab){
        liftStart = {x:hand.x, y:hand.y}; setPhase('lift'); statusEl.textContent = 'Got one!';
        reelsStop(String(winner).padStart(reels.length, '0'));
      }
      break;
    }
    case 'lift': {
      const p = clamp(pt / DUR.lift, 0, 1), s = easeIO(p), WP = {x:HOLE.x, y:GC.y - 120};
      const q = s < .35 ? {x:lerp(liftStart.x, WP.x, s / .35), y:lerp(liftStart.y, WP.y, s / .35)}
                        : {x:lerp(WP.x, HOLD.x, (s - .35) / .65), y:lerp(WP.y, HOLD.y, (s - .35) / .65)};
      hand.x = q.x; hand.y = q.y;
      const kp = smooth(clamp((270 - hand.y) / (270 - HOLD.y), 0, 1));       // grows once it clears the cap
      hand.k = lerp(K0, HOLD.k, kp); hand.ballR = lerp(BALL_R, HOLD.r, kp);
      flash(ms, 240);
      if(pt >= DUR.lift){
        hand.x = HOLD.x; hand.y = HOLD.y; hand.k = HOLD.k; hand.ballR = HOLD.r;
        // the hand lets go and the ball pops out large in front of the globe
        bigFrom = {x:HOLD.x, y:HOLD.y + GRIP * HOLD.k + HOLD.r, r:HOLD.r};
        big.active = true; big.x = bigFrom.x; big.y = bigFrom.y; big.r = bigFrom.r; big.a = 0;
        hand.held = null;
        setPhase('present'); reveal();
      }
      break;
    }
    case 'present': {
      const p = clamp(pt / DUR.present, 0, 1), e = easeOutBack(p);
      big.x = lerp(bigFrom.x, GC.x, e); big.y = lerp(bigFrom.y, GC.y, e); big.r = lerp(bigFrom.r, BIG_R, e); big.a = p;
      hand.grip = lerp(1, 0, clamp(p * 2.5, 0, 1)); hand.y = lerp(HOLD.y, -220, p * p);
      if(pt >= DUR.present){ hand.active = false; hand.k = K0; hand.ballR = BALL_R; setPhase('show'); }
      break;
    }
    case 'show': {
      big.x = GC.x; big.y = GC.y + Math.sin(pt / 520) * 4; big.r = BIG_R * (1 + .012 * Math.sin(pt / 330)); big.a = 1;
      break;
    }
    case 'retract': {                                 // the shown ball shrinks back in through the opening
      const p = clamp(pt / DUR.retract, 0, 1), e = easeIO(p);
      big.x = lerp(bigFrom.x, HOLE.x, e); big.y = lerp(bigFrom.y, HOLE.y - 12, e); big.r = lerp(bigFrom.r, 18, e); big.a = 1 - p;
      if(pt >= DUR.retract){
        big.active = false; respawnBall();
        setPhase('shake'); sfx.start();
      }
      break;
    }
  }
}

/* ---------- controls ---------- */
btn.addEventListener('click', startDraw);
cv.addEventListener('click', startDraw);
addEventListener('keydown', e => {
  if((e.code === 'Space' || e.code === 'Enter') && !/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)){
    e.preventDefault(); startDraw();
  }
});
// changing the highest control number puts a shown winner away
maxInput.addEventListener('change', () => {
  if(ph !== 'show') return;
  ph = 'idle'; hand.active = false; hand.held = null; big.active = false;
  if(target){ target.held = false; target.isTarget = false; target.num = null; target = null; }
  dimTarget = 1; updateUI();
});

/* ---------- hook into the scene ---------- */
scene.update.push(stepDraw, updateConfetti);
scene.mid.push(() => { if(hand.active) drawHand(); });
scene.top.push(drawBig, drawConfetti);
