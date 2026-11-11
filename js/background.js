'use strict';
/* Full-page room behind everything: a tiled wall and a checkered floor in perspective,
   lined up with the machine canvas so the machine stands on the floor. */

const bgc = $('bg'), bgx = bgc.getContext('2d');

function drawBg(){
  const d = Math.min(window.devicePixelRatio || 1, 2), vw = innerWidth, vh = innerHeight;
  const pw = Math.round(vw * d), phh = Math.round(vh * d);
  if(bgc.width !== pw || bgc.height !== phh){ bgc.width = pw; bgc.height = phh; }
  const c = bgx; c.setTransform(d, 0, 0, d, 0, 0);
  const r = cv.getBoundingClientRect(), s = (r.width / W) || 1;
  const cx = r.left + r.width / 2, yH = r.top + 812 * s, gy = r.top + GC.y * s;   // yH: where wall meets floor
  const far = Math.max(vw, vh);

  // wall: dark maroon with a spotlight behind the machine
  let g = c.createLinearGradient(0, 0, 0, vh); g.addColorStop(0, '#0d0306'); g.addColorStop(1, '#1d060c');
  c.fillStyle = g; c.fillRect(0, 0, vw, vh);
  g = c.createRadialGradient(cx, gy, 30, cx, gy, far * .6);
  g.addColorStop(0, 'rgba(158,32,52,.95)'); g.addColorStop(.4, 'rgba(98,16,32,.6)'); g.addColorStop(1, 'rgba(12,3,6,0)');
  c.fillStyle = g; c.fillRect(0, 0, vw, vh);
  // wall tiles
  const T = 92 * s;
  c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,.22)';
  for(let j = 0, y = yH - T; y > -T; j++, y -= T){
    for(let k = Math.floor(-cx / T) - 1; cx + (k - .5) * T < vw; k++){
      const x = cx + (k - .5) * T;
      c.fillStyle = ((j + k) & 1) ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.14)';
      c.fillRect(x, y, T, T); c.strokeRect(x + .5, y + .5, T, T);
    }
  }
  // baseboard
  const bh = 14 * s;
  g = c.createLinearGradient(0, yH - bh, 0, yH); g.addColorStop(0, '#4a0c18'); g.addColorStop(1, '#16050a');
  c.fillStyle = g; c.fillRect(0, yH - bh, vw, bh);
  c.fillStyle = 'rgba(255,130,140,.3)'; c.fillRect(0, yH - bh, vw, 1.2);
  // wall vignette
  g = c.createRadialGradient(cx, gy, Math.min(vw, vh) * .32, cx, gy, far * .85);
  g.addColorStop(0, 'rgba(5,1,2,0)'); g.addColorStop(1, 'rgba(5,1,2,.9)');
  c.fillStyle = g; c.fillRect(0, 0, vw, Math.max(0, yH));

  // floor: checkered tiles in perspective, across the whole page
  const fh = vh - yH;
  if(fh > 0){
    c.save(); c.beginPath(); c.rect(0, yH, vw, fh); c.clip();
    c.fillStyle = '#120508'; c.fillRect(0, yH, vw, fh);
    const vpY = yH - fh * 1.25, TW = 170 * s, rows = 7, f0 = (yH - vpY) / (vh - vpY);
    const kMax = Math.ceil(Math.max(cx, vw - cx) / (TW * f0)) + 2;
    const xAt = (k, y) => cx + (k - .5) * TW * (y - vpY) / (vh - vpY);
    const yAt = i => yH + fh * Math.pow(i / rows, 1.55);
    for(let i = 0; i < rows; i++){
      const y0 = yAt(i), y1 = yAt(i + 1);
      for(let k = -kMax; k < kMax; k++){
        c.beginPath(); c.moveTo(xAt(k, y0), y0); c.lineTo(xAt(k + 1, y0), y0); c.lineTo(xAt(k + 1, y1), y1); c.lineTo(xAt(k, y1), y1); c.closePath();
        c.fillStyle = ((i + k) & 1) ? '#641121' : '#19070c'; c.fill();
      }
    }
    c.strokeStyle = 'rgba(255,170,170,.08)'; c.lineWidth = 1;                 // grout lines
    for(let k = -kMax; k <= kMax; k++){ c.beginPath(); c.moveTo(xAt(k, yH), yH); c.lineTo(xAt(k, vh), vh); c.stroke(); }
    for(let i = 1; i < rows; i++){ const y = yAt(i); c.beginPath(); c.moveTo(0, y); c.lineTo(vw, y); c.stroke(); }
    g = c.createLinearGradient(0, yH, 0, vh);                                  // depth haze toward the wall
    g.addColorStop(0, 'rgba(8,2,4,.62)'); g.addColorStop(.45, 'rgba(8,2,4,.18)'); g.addColorStop(1, 'rgba(8,2,4,0)');
    c.fillStyle = g; c.fillRect(0, yH, vw, fh);
    g = c.createLinearGradient(0, yH, 0, vh);                                  // polished-floor sheen
    g.addColorStop(0, 'rgba(255,120,130,0)'); g.addColorStop(1, 'rgba(255,120,130,.09)');
    c.fillStyle = g; c.fillRect(0, yH, vw, fh);
    const fy = yH + fh * .5;
    g = c.createRadialGradient(cx, fy, vw * .16, cx, fy, vw * .72);            // falls off into darkness at the sides
    g.addColorStop(0, 'rgba(5,1,2,0)'); g.addColorStop(1, 'rgba(5,1,2,.92)');
    c.fillStyle = g; c.fillRect(0, yH, vw, fh);
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, yH, vw, 2);
    c.restore();
  }
}

// redraw whenever the machine canvas may have moved
let bgQueued = false;
function queueBg(){
  if(bgQueued) return; bgQueued = true;
  requestAnimationFrame(() => { bgQueued = false; drawBg(); });
}
addEventListener('scroll', queueBg, {passive:true});
addEventListener('resize', drawBg);
addEventListener('load', drawBg);
drawBg();
