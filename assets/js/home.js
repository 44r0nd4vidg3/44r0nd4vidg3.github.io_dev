/* Home page only: uptime clock, ops console boot sequence, background
   music toggle, GitHub contribution tiles.
   Part of aarondavidge.com — see README.md for the file map. */

/* ---------- uptime ---------- */
const bootHours = 1337, bootTime = Date.now();
setInterval(() => {
  const s = Math.floor((Date.now() - bootTime) / 1000);
  const h = bootHours + Math.floor(s / 3600), m = String(Math.floor(s / 60) % 60).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  document.getElementById('uptime').textContent = `${h}:${m}:${ss}`;
}, 1000);

/* ---------- ops console: boot sequence, then live sentinel feed ---------- */
const bootLines = [
  { text: '$ whoami', cls: 'text-green-400' },
  { text: '44r0nd4vidg3 :: AI Engineer', cls: 'text-slate-300' },
  { text: '$ cat mission.txt', cls: 'text-green-400' },
  { text: '> Build it. Break it. Fix it. Repeat.', cls: 'text-slate-300' },
  { text: '$ ./sentinel --watch --all-subdomains', cls: 'text-green-400' },
];
const term = document.getElementById('terminal');
const caret = document.createElement('span');
caret.className = 'cursor-blink inline-block w-2 h-4 bg-blue-400 align-middle ml-1';
let li = 0, ci = 0;
let cur = document.createElement('div');
term.appendChild(cur); cur.appendChild(caret);
(function typeBoot() {
  const L = bootLines[li];
  cur.className = L.cls;
  if (ci < L.text.length) {
    caret.remove();
    cur.textContent = L.text.slice(0, ++ci);
    cur.appendChild(caret);
    setTimeout(typeBoot, 30 + Math.random() * 40);
  } else {
    li++; ci = 0;
    if (li < bootLines.length) {
      caret.remove();
      cur = document.createElement('div');
      term.appendChild(cur); cur.appendChild(caret);
      setTimeout(typeBoot, bootLines[li].text.startsWith('$') ? 450 : 140);
    } else {
      setTimeout(startFeed, 800);
    }
  }
})();
const sentinelFeed = [
  ['[ OK ]',  'text-emerald-400', 'perimeter integrity verified'],
  ['[SCAN]',  'text-amber-400',   'inbound port sweep detected — dropped'],
  ['[AGNT]',  'text-blue-300',    'agent swarm nominal · pipelines green'],
  ['[HNYP]',  'text-amber-400',   'honeypot visitor logged. hi there.'],
  ['[THRT]',  'text-red-400',     'threat detected — signature unknown'],
  ['[THRT]',  'text-red-400',     'analysing threat vector...'],
  ['[THRT]',  'text-red-400',     'threat eliminated · perimeter restored'],
  ['[CRYP]',  'text-emerald-400', 'TLS 1.3 handshake · channel secure'],
  ['[PTCH]',  'text-blue-300',    'vuln patched before breakfast'],
  ['[ OK ]',  'text-emerald-400', 'caffeine reserves 99% · systems nominal'],
  ['[BULD]',  'text-blue-300',    'shipping v2 while you read this'],
];
let fi = 0;
function startFeed() {
  caret.remove();
  setInterval(() => {
    const [tag, cls, msg] = sentinelFeed[fi % sentinelFeed.length]; fi++;
    const t = new Date().toTimeString().slice(0, 8);
    const row = document.createElement('div');
    const mk = (txt, klass) => { const s = document.createElement('span'); s.className = klass; s.textContent = txt; return s; };
    row.append(mk(t, 'text-slate-600'), document.createTextNode(' '), mk(tag, cls), document.createTextNode(' '), mk(msg, 'text-slate-400'));
    term.appendChild(row);
    while (term.children.length > 8) term.removeChild(term.firstChild);
  }, 1900);
}

/* ---------- background music: starts on first interaction, neon toggle ---------- */
(function bgMusic() {
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('bgm-btn');
  if (!audio || !btn) return;
  const iconOn = document.getElementById('bgm-icon-on');
  const iconOff = document.getElementById('bgm-icon-off');
  const TARGET_VOL = 0.35, KEY = 'bgm-muted';
  let started = false, fadeTimer = null;

  function setIcons(playing) {
    iconOn.classList.toggle('hidden', !playing);
    iconOff.classList.toggle('hidden', playing);
    btn.setAttribute('aria-pressed', String(playing));
    btn.classList.toggle('text-blue-300', playing);
    btn.classList.toggle('text-slate-500', !playing);
  }

  function fadeTo(target, ms) {
    clearInterval(fadeTimer);
    const step = (target - audio.volume) / (ms / 50);
    fadeTimer = setInterval(() => {
      const v = audio.volume + step;
      if ((step > 0 && v >= target) || (step < 0 && v <= target)) {
        audio.volume = target; clearInterval(fadeTimer);
        if (target === 0) audio.pause();
      } else audio.volume = v;
    }, 50);
  }

  function play() {
    audio.volume = audio.paused ? 0 : audio.volume;
    audio.play().then(() => { setIcons(true); fadeTo(TARGET_VOL, 2000); }).catch(() => setIcons(false));
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    started = true;
    if (audio.paused) { try { localStorage.removeItem(KEY); } catch {} play(); }
    else { try { localStorage.setItem(KEY, '1'); } catch {} setIcons(false); fadeTo(0, 600); }
  });

  let muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch {}
  if (!muted) {
    const KICKOFF_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'click', 'wheel', 'scroll'];
    const kickoff = (e) => {
      if (started || (e && e.target && btn.contains(e.target))) return; /* toggle clicks handle themselves */
      audio.volume = 0;
      audio.play().then(() => {
        started = true;
        setIcons(true);
        fadeTo(TARGET_VOL, 2000);
        KICKOFF_EVENTS.forEach(ev => window.removeEventListener(ev, kickoff));
      }).catch(() => {}); /* not permitted yet — keep listening */
    };
    KICKOFF_EVENTS.forEach(ev => window.addEventListener(ev, kickoff, { passive: true }));
    kickoff(null); /* eager attempt on load — works for returning visitors browsers already trust */
  }
})();

/* ---------- github activity tiles ---------- */
(function ghActivity() {
  const grid = document.getElementById('gh-grid');
  const totalEl = document.getElementById('gh-total');
  if (!grid) return;
  const GH_USER = '44r0nd4vidg3';

  // deterministic simulated year, used only if the live fetch fails
  function fallbackDays() {
    const days = [], today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - 364);
    let seed = 1337;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const wd = d.getDay(), base = (wd === 0 || wd === 6) ? .35 : .75, r = rnd();
      const count = r < 1 - base ? 0 : Math.floor(r * 12 * base);
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4;
      days.push({ date: d.toISOString().slice(0, 10), count, level });
    }
    return days;
  }

  const ghMq = window.matchMedia('(max-width: 767px)');
  let ghState = null;

  function render(days, total, live) {
    ghState = [days, total, live];
    grid.textContent = '';
    let view = days;
    if (ghMq.matches) {
      // phones: trim leading empty weeks so a young account fits full-width
      const fi = days.findIndex(d => d.count > 0);
      if (fi > -1) {
        let startIdx = Math.max(0, fi - new Date(days[fi].date + 'T00:00:00').getDay());
        startIdx = Math.min(startIdx, Math.max(0, days.length - 12 * 7)); // show at least 12 weeks
        view = days.slice(startIdx);
      }
      const weeks = Math.ceil((new Date(view[0].date + 'T00:00:00').getDay() + view.length) / 7);
      grid.style.width = weeks > 30 ? (weeks * 12) + 'px' : '100%'; // scroll only if history is long
    } else {
      grid.style.width = '100%';
    }
    const pad = new Date(view[0].date + 'T00:00:00').getDay();
    for (let i = 0; i < pad; i++) {
      const c = document.createElement('span');
      c.className = 'gh-cell'; c.style.visibility = 'hidden';
      grid.appendChild(c);
    }
    for (const d of view) {
      const c = document.createElement('span');
      c.className = 'gh-cell' + (d.level ? ' gh-l' + Math.min(d.level, 4) : '');
      c.title = `${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`;
      grid.appendChild(c);
    }
    totalEl.textContent = `${total} CONTRIBUTIONS · 12MO` + (live ? '' : ' · SIM');
    const sc = grid.parentElement;
    sc.scrollLeft = sc.scrollWidth; // newest weeks in view when scrolling kicks in
  }

  ghMq.addEventListener('change', () => { if (ghState) render(...ghState); });

  fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      const days = (data.contributions || []).map(c => ({ date: c.date, count: c.count || 0, level: c.level || 0 }));
      if (!days.length) throw new Error('empty');
      const total = (data.total && (data.total.lastYear ?? Object.values(data.total)[0])) ?? days.reduce((s2, d) => s2 + d.count, 0);
      render(days, total, true);
    })
    .catch(() => { const days = fallbackDays(); render(days, days.reduce((s2, d) => s2 + d.count, 0), false); });
})();
