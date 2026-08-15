/* A4RON.AI chat panel. Shared by the home page panel and /assistant.html;
   exits quietly if the panel markup is not on the page.
   Part of aarondavidge.com — see README.md for the file map. */

/* ---------- A4RON.AI: live chat wired to the secure gateway ---------- */
(function a4ron() {
  const GATEWAY = 'https://api.aarondavidge.com/chat';
  const log = document.getElementById('a4-log');
  const input = document.getElementById('a4-input');
  const chips = document.getElementById('a4-chips');
  const sub = document.getElementById('assistant-sub');
  if (!log || !input) return;
  const session = 'web-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  let busy = false;

  function add(cls, text) {
    const d = document.createElement('div');
    d.className = cls;
    if (text) d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function typewriter(el, text) {
    return new Promise(function (resolve) {
      let i = 0;
      (function tick() {
        el.textContent = text.slice(0, i);
        log.scrollTop = log.scrollHeight;
        if (i++ < text.length) setTimeout(tick, 10); else resolve();
      })();
    });
  }
  async function send(msg) {
    msg = (msg || '').trim();
    if (busy || !msg) return;
    busy = true;
    input.value = '';
    add('u', '> ' + msg);
    if (sub) sub.textContent = 'PROCESSING\u2026';
    const pending = add('a', '\u2026');
    try {
      const r = await fetch(GATEWAY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session, message: msg })
      });
      if (r.status === 429) { pending.className = 'sys'; pending.textContent = 'RATE LIMIT ENGAGED \u00b7 TRY AGAIN SHORTLY'; }
      else if (!r.ok) { pending.className = 'sys'; pending.textContent = 'MAINFRAME UNREACHABLE \u00b7 reach Aaron: /contact'; }
      else {
        const data = await r.json();
        pending.textContent = '';
        await typewriter(pending, data.text || 'MAINFRAME UNREACHABLE \u00b7 reach Aaron: /contact');
      }
    } catch (e) {
      pending.className = 'sys';
      pending.textContent = 'MAINFRAME UNREACHABLE \u00b7 reach Aaron: /contact';
    }
    if (sub) sub.textContent = 'AWAITING INPUT';
    busy = false;
  }
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(input.value); });
  if (chips) chips.addEventListener('click', function (e) {
    const b = e.target.closest('.a4-chip');
    if (b) send(b.getAttribute('data-q'));
  });
})();
