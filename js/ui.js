'use strict';
/* Controls: the big number display, the draw-button label, and the hidden
   settings / winners panel behind the gear icon. */

const maxInput = $('maxInput'), prizeInput = $('prizeInput');
const noRepeatEl = $('noRepeat'), soundEl = $('soundOn');
const drawer = $('drawer'), gearBtn = $('gearBtn'), clearBtn = $('clearBtn');

/* ---------- settings panel (open / close) ---------- */
function setDrawer(open){
  drawer.classList.toggle('open', open);
  gearBtn.setAttribute('aria-expanded', String(open));
  if(open) $('drawerClose').focus(); else if(document.activeElement && drawer.contains(document.activeElement)) gearBtn.focus();
}
gearBtn.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
$('drawerClose').addEventListener('click', () => setDrawer(false));
addEventListener('keydown', e => { if(e.key === 'Escape') setDrawer(false); });

/* ---------- big number display ---------- */
function buildDigits(){
  const n = String(state.max).length;
  digitsEl.textContent = '';
  for(let i = 0; i < n; i++){ const s = document.createElement('span'); s.className = 'digit'; s.textContent = '-'; digitsEl.appendChild(s); }
}
function setDisplay(num){                             // null shows dashes
  const n = digitsEl.children.length;
  const str = num == null ? '-'.repeat(n) : String(num).padStart(n, '0');
  [...digitsEl.children].forEach((el, i) => { el.textContent = str[i] || '-'; });
}
function setDisplayMode(m){ displayEl.className = 'display ' + m; }      // idle, flashing or winner

/* ---------- draw button label + how many numbers are left ---------- */
function poolSize(){
  if(!state.noRepeat) return state.max;
  return state.max - new Set(state.history.map(h => h.no).filter(n => n <= state.max)).size;
}
function updateUI(){
  const busy = isBusy(), remain = poolSize();
  if(busy){ btn.disabled = true; btn.textContent = 'DRAWING…'; }
  else if(remain === 0){ btn.disabled = true; btn.textContent = 'ALL NUMBERS DRAWN'; }
  else { btn.disabled = false; btn.textContent = ph === 'show' ? 'DRAW AGAIN' : 'TAP TO DRAW'; }
  maxInput.disabled = busy;
  $('poolInfo').textContent = state.noRepeat
    ? `${remain} of ${state.max} control numbers still in the box`
    : `${state.max} control numbers in the box (repeats allowed)`;
}

/* ---------- winners list ---------- */
function renderHistory(){
  const ol = $('history'); ol.textContent = '';
  if(!state.history.length){
    const li = document.createElement('li'); li.className = 'empty'; li.style.display = 'block'; li.textContent = 'No winners yet.'; ol.appendChild(li); return;
  }
  for(let i = state.history.length - 1; i >= 0; i--){
    const h = state.history[i], li = document.createElement('li');
    const a = document.createElement('span'); a.className = 'hn'; a.textContent = '#' + (i + 1);
    const b = document.createElement('span'); b.className = 'hno'; b.textContent = pad(h.no);
    const c = document.createElement('span'); c.className = 'hmeta';
    const t = new Date(h.at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    c.textContent = (h.prize ? h.prize + ' · ' : '') + t;
    li.append(a, b, c); ol.appendChild(li);
  }
}

// Clear asks for a second tap instead of a browser pop-up (pop-ups are blocked in some browsers)
let clearArmed = 0;
function disarmClear(){ clearTimeout(clearArmed); clearArmed = 0; clearBtn.textContent = 'Clear'; clearBtn.classList.remove('danger'); }
clearBtn.addEventListener('click', () => {
  if(isBusy()){ $('poolInfo').textContent = 'Wait for the draw to finish, then clear.'; return; }
  if(!state.history.length){ disarmClear(); return; }
  if(!clearArmed){
    clearBtn.textContent = 'Tap again to clear all'; clearBtn.classList.add('danger');
    clearArmed = setTimeout(disarmClear, 4000);
    return;
  }
  disarmClear();
  state.history = []; store.set('raffle.history', []); renderHistory(); updateUI();
  statusEl.textContent = 'Winners cleared.';
});
$('copyBtn').addEventListener('click', async () => {
  if(!state.history.length) return;
  const text = state.history.map((h, i) => `#${i + 1}\t${pad(h.no)}${h.prize ? '\t' + h.prize : ''}`).join('\n');
  try{ await navigator.clipboard.writeText(text); statusEl.textContent = 'Winners copied to clipboard.'; }
  catch{ statusEl.textContent = 'Could not copy — your browser blocked clipboard access.'; }
});

/* ---------- settings ---------- */
function applyMax(){
  maxInput.value = state.max;
  buildDigits(); setReelCount(String(state.max).length); setDisplay(null);
}
maxInput.addEventListener('change', () => {
  const v = Math.round(Number(maxInput.value));
  state.max = clamp(Number.isFinite(v) ? v : state.max, 2, 99999);
  store.set('raffle.max', state.max);
  applyMax(); setDisplayMode('idle'); renderHistory(); updateUI();
});
prizeInput.addEventListener('input', () => store.set('raffle.prize', prizeInput.value));
noRepeatEl.addEventListener('change', () => { state.noRepeat = noRepeatEl.checked; store.set('raffle.noRepeat', state.noRepeat); updateUI(); });
soundEl.addEventListener('change', () => { state.sound = soundEl.checked; store.set('raffle.sound', state.sound); if(state.sound) ensureAudio(); });

/* ---------- hook into the scene ---------- */
scene.init.push(() => {
  noRepeatEl.checked = state.noRepeat; soundEl.checked = state.sound; prizeInput.value = state.prize;
  applyMax(); renderHistory(); updateUI();
});
