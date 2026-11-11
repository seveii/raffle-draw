'use strict';
/* Tech Raffle Draw — shared foundation.
   Helpers, saved settings, sounds, scene sizes and small drawing helpers.
   Every feature file adds its own start-up, update and draw steps to `scene`;
   js/main.js runs them. */

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
const smooth = t => t*t*(3 - 2*t);
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch{ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// unbiased secure random integer in [0, n)
function randInt(n){
  const lim = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= lim);
  return buf[0] % n;
}

/* ---------- saved state ---------- */
const savedHistory = store.get('raffle.history', []);
const state = {
  max: Math.round(clamp(Number(store.get('raffle.max', 1386)) || 1386, 2, 99999)),
  noRepeat: !!store.get('raffle.noRepeat', true),
  sound: !!store.get('raffle.sound', true),
  prize: String(store.get('raffle.prize', '')),
  history: Array.isArray(savedHistory) ? savedHistory : []
};
const pad = n => String(n).padStart(String(state.max).length, '0');

/* ---------- page elements ---------- */
const cv = $('scene'), ctx = cv.getContext('2d');
const digitsEl = $('digits'), displayEl = $('display');
const btn = $('drawBtn'), statusEl = $('status');

/* ---------- sounds ---------- */
let ac = null;
function ensureAudio(){
  if(!state.sound) return;
  try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === 'suspended') ac.resume(); }catch{}
}
function tone(f, d = .08, type = 'square', v = .05, when = 0){
  if(!state.sound || !ac) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .02);
}
const sfx = {
  tick(){ tone(600 + Math.random()*500, .05, 'square', .025); },
  thump(){ tone(120, .2, 'sine', .22); },
  ding(){ tone(880, .18, 'triangle', .08); },
  start(){ [300,400,500].forEach((f,i) => tone(f, .1, 'triangle', .08, i*.07)); },
  fanfare(){ [523,659,784,1047,784,1047].forEach((f,i) => tone(f, .24, 'triangle', .12, i*.13)); }
};

/* ---------- scene sizes (the machine canvas is drawn in a 720 x 1000 space) ---------- */
const W = 720, H = 1000;
const GC = {x:360, y:470}, GR = 215, GI = 206, RIN = 204;       // glass globe: centre, outer, inner, ball-centre limit
const HOLE = {x:360, y:226, rx:44, ry:9.5};                      // opening in the top cap
const CAP = {x:360, y:226, rx:96, ry:20, yb:262};
const COLLAR = {x:360, y1:680, y2:706, rx:132, ry:20};
const BODY = {x0:232, x1:488, y0:722, y1:900};
const REEL = {x:262, y:743, w:196, h:62};                        // number window on the machine
const BALL_R = 24, BALL_COUNT = 28;

/* ---------- drawing helpers ---------- */
function circ(c, x, y, r){ c.beginPath(); c.arc(x, y, r, 0, TAU); }
function rr(c, x, y, w, h, r){
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function chromeGrad(c, x1, y1, x2, y2){
  const g = c.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, '#3a2e32'); g.addColorStop(.18, '#b5aab0'); g.addColorStop(.38, '#ffffff');
  g.addColorStop(.55, '#d6ced2'); g.addColorStop(.8, '#6f6569'); g.addColorStop(1, '#2a2024');
  return g;
}
function redGrad(c, x1, y1, x2, y2){
  const g = c.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, '#3a050d'); g.addColorStop(.3, '#c01a2a'); g.addColorStop(.5, '#ff4a58'); g.addColorStop(.7, '#a8142a'); g.addColorStop(1, '#2a0409');
  return g;
}
function sphere(c, x, y, r, light, base, dark){
  const g = c.createRadialGradient(x - r*.35, y - r*.4, r*.1, x, y, r);
  g.addColorStop(0, light); g.addColorStop(.5, base); g.addColorStop(1, dark);
  c.fillStyle = g; circ(c, x, y, r); c.fill();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(x - r*.35, y - r*.42, r*.22, r*.13, -.7, 0, TAU); c.fill();
}

/* ---------- glossy ball sprites (drawn once, reused for every ball) ---------- */
// maroon / red / black / ivory lacquer
const PALETTE = [
  {light:'#ff8a8a', base:'#d71f2e', dark:'#5e0610', ink:'#ffffff'},   // crimson
  {light:'#ffb0a8', base:'#f0434d', dark:'#7a0a15', ink:'#ffffff'},   // ruby
  {light:'#c8505e', base:'#7d1022', dark:'#2c030a', ink:'#ffffff'},   // maroon
  {light:'#7a7a84', base:'#232227', dark:'#030304', ink:'#ffffff'},   // black
  {light:'#ffffff', base:'#f4ebde', dark:'#a39580', ink:'#6a0c1a'}    // ivory
];
const SPR = 512;
function makeSprite(col){
  const c = document.createElement('canvas'); c.width = c.height = SPR;
  const x = c.getContext('2d'), r = SPR/2 - 2; x.translate(SPR/2, SPR/2);
  x.beginPath(); x.arc(0, 0, r, 0, TAU); x.clip();
  let g = x.createRadialGradient(-r*.35, -r*.42, r*.05, 0, 0, r*1.05);
  g.addColorStop(0, col.light); g.addColorStop(.38, col.base); g.addColorStop(1, col.dark);
  x.fillStyle = g; x.fillRect(-r, -r, 2*r, 2*r);
  g = x.createRadialGradient(r*.4, r*.6, 0, r*.4, r*.6, r*.75);          // warm bounce light from below
  g.addColorStop(0, 'rgba(255,120,110,.28)'); g.addColorStop(1, 'rgba(255,120,110,0)');
  x.fillStyle = g; x.fillRect(-r, -r, 2*r, 2*r);
  g = x.createRadialGradient(0, 0, r*.62, 0, 0, r);                        // edge falloff
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)');
  x.fillStyle = g; x.fillRect(-r, -r, 2*r, 2*r);
  return c;
}
function makeGloss(){
  const c = document.createElement('canvas'); c.width = c.height = SPR;
  const x = c.getContext('2d'), r = SPR/2 - 2; x.translate(SPR/2, SPR/2);
  x.beginPath(); x.arc(0, 0, r, 0, TAU); x.clip();
  x.save(); x.rotate(-.75); x.translate(-r*.1, -r*.52);                    // soft-box reflection
  const g = x.createLinearGradient(0, -r*.2, 0, r*.2);
  g.addColorStop(0, 'rgba(255,255,255,.72)'); g.addColorStop(1, 'rgba(255,255,255,.04)');
  x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, r*.5, r*.2, 0, 0, TAU); x.fill(); x.restore();
  const h = x.createRadialGradient(-r*.34, -r*.4, 0, -r*.34, -r*.4, r*.14);   // hot spot
  h.addColorStop(0, 'rgba(255,255,255,.95)'); h.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = h; x.fillRect(-r, -r, 2*r, 2*r);
  const rim = x.createRadialGradient(0, 0, r*.84, 0, 0, r);                // subtle rim light
  rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(.8, 'rgba(255,255,255,.07)'); rim.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = rim; x.fillRect(-r, -r, 2*r, 2*r);
  return c;
}
const SPRITES = PALETTE.map(makeSprite), GLOSS = makeGloss();

// num = null draws a plain ball: numbers stay hidden until the winning ball is revealed
function drawBall(c, x, y, r, ci, num, rot, alpha){
  c.save(); c.translate(x, y);
  if(alpha !== undefined) c.globalAlpha *= alpha;
  c.drawImage(SPRITES[ci], -r, -r, 2*r, 2*r);
  if(num != null){
    c.save(); c.rotate(rot);
    const s = String(num);
    let fs = r * (s.length > 3 ? .62 : s.length > 2 ? .7 : .8);
    c.font = `700 ${fs}px "Segoe UI", Arial, sans-serif`;
    const tw = c.measureText(s).width;
    if(tw > r * 1.45){ fs *= r * 1.45 / tw; c.font = `700 ${fs}px "Segoe UI", Arial, sans-serif`; }
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = PALETTE[ci].ink;
    c.globalAlpha *= .94; c.fillText(s, 0, r * .04);
    c.restore();
  }
  c.drawImage(GLOSS, -r, -r, 2*r, 2*r);
  c.restore();
}
function drawPlainBall(c, x, y, r, ci){ c.drawImage(SPRITES[ci], x - r, y - r, 2*r, 2*r); c.drawImage(GLOSS, x - r, y - r, 2*r, 2*r); }

/* ---------- scene pipeline ---------- */
// init:   run once at start-up
// update: run every animation step with (ms, now)
// mid:    drawn between the machine's back layer and its glass front
// top:    drawn in front of everything
const scene = {init:[], update:[], mid:[], top:[]};

/* ---------- draw-sequence state shared by every feature ---------- */
let ph = 'idle';                                   // idle, shake, reach, grab, lift, present, show, retract
const isBusy = () => ['shake','reach','grab','lift','present','retract'].includes(ph);
let shake = 0;                                     // 0..1: how hard the balls are being tumbled
