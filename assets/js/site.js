/* Shared page chrome: mobile menu, particle backdrop, EQ visualiser and
   active-nav highlight. Every module no-ops when its markup is absent, so
   this one file is safe to load on every page.
   Part of aarondavidge.com — see README.md for the file map. */

(function mobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOpen = document.getElementById('menu-icon-open');
  const menuClose = document.getElementById('menu-icon-close');
  if (!menuBtn || !mobileMenu) return;

  function closeMenu() {
    mobileMenu.classList.add('hidden');
    if (menuOpen) menuOpen.classList.remove('hidden');
    if (menuClose) menuClose.classList.add('hidden');
  }
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    if (menuOpen) menuOpen.classList.toggle('hidden');
    if (menuClose) menuClose.classList.toggle('hidden');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();

(function particleBackdrop() {
  /* ---------- particles / circuit background ---------- */
  const pc = document.getElementById('particles');
  if (!pc) return;
  const pctx = pc.getContext('2d');
  let W, H, dots = [];
  function resize() {
    W = pc.width = innerWidth; H = pc.height = innerHeight;
    dots = Array.from({ length: Math.min(110, W / 14) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.6 + .4
    }));
  }
  addEventListener('resize', resize); resize();
  (function drawParticles() {
    pctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      pctx.beginPath(); pctx.arc(d.x, d.y, d.r, 0, 7);
      pctx.fillStyle = 'rgba(96,165,250,.5)'; pctx.fill();
    }
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j], dx = a.x - b.x, dy = a.y - b.y, dist = dx * dx + dy * dy;
      if (dist < 130 * 130) {
        pctx.strokeStyle = `rgba(59,130,246,${.12 * (1 - dist / 16900)})`;
        pctx.lineWidth = 1; pctx.beginPath(); pctx.moveTo(a.x, a.y); pctx.lineTo(b.x, b.y); pctx.stroke();
      }
    }
    requestAnimationFrame(drawParticles);
  })();
})();

(function eqVisualiser() {
  /* ---------- AI assistant: voice visualizer (original eq wave) ---------- */
  const eq = document.getElementById('eq');
  if (!eq) return;
  for (let i = 0; i < 24; i++) {
    const b = document.createElement('span');
    b.className = 'eq-bar flex-1 bg-blue-500/80 rounded-sm';
    b.style.height = (8 + Math.random() * 34) + 'px';
    b.style.animationDelay = (Math.random() * 1) + 's';
    b.style.animationDuration = (.6 + Math.random() * .9) + 's';
    eq.appendChild(b);
  }
})();

(function activeNavHighlight() {
  /* ---------- active nav highlight on click ---------- */
  document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(x => {
      x.classList.remove('text-blue-400', 'after:absolute', 'after:-bottom-[22px]', 'after:left-0', 'after:w-full', 'after:h-[2px]', 'after:bg-blue-500', 'after:shadow-[0_0_8px_#3b82f6]');
      x.classList.add('hover:text-blue-400');
    });
    a.classList.add('text-blue-400', 'relative', 'after:absolute', 'after:-bottom-[22px]', 'after:left-0', 'after:w-full', 'after:h-[2px]', 'after:bg-blue-500', 'after:shadow-[0_0_8px_#3b82f6]');
  }));
})();
