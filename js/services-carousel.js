/* Services carousel: progress bar, prev/next buttons and auto-slide (cards scroll sideways) */
(function () {
  var t = document.getElementById('track'), bar = document.getElementById('svBar'), th = document.getElementById('svThumb'),
      p = document.getElementById('svPrev'), n = document.getElementById('svNext'), sec = document.getElementById('services');
  if (!t || !bar || !th) return;

  function upd() {
    var max = t.scrollWidth - t.clientWidth, ratio = Math.min(1, t.clientWidth / t.scrollWidth);
    th.style.width = (ratio * 100) + '%';
    th.style.left = (max > 0 ? (t.scrollLeft / max) * (100 - ratio * 100) : 0) + '%';
    p.disabled = t.scrollLeft <= 2; n.disabled = t.scrollLeft >= max - 2;
  }
  function step(d) {
    var c = t.querySelector('.sv'), gap = parseFloat(getComputedStyle(t).columnGap) || 26;
    t.scrollBy({ left: d * (c.offsetWidth + gap), behavior: 'smooth' });
  }

  /* ---- auto-slide: one card every 6 seconds, back to the first card at the end ---- */
  var AUTO = 6000, timer = null, hovering = false, touching = false, focused = false, seen = false;
  function tick() {
    if (hovering || touching || focused || !seen || document.hidden) return;   /* never moves while the visitor is on the section */
    var max = t.scrollWidth - t.clientWidth;
    if (t.scrollLeft >= max - 4) t.scrollTo({ left: 0, behavior: 'smooth' }); else step(1);
  }
  function restart() {                                                          /* wait a full 6s after any interaction */
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(tick, AUTO);
  }

  p.addEventListener('click', function () { step(-1); restart(); });
  n.addEventListener('click', function () { step(1); restart(); });
  t.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  bar.addEventListener('click', function (e) {
    var r = bar.getBoundingClientRect();
    t.scrollTo({ left: ((e.clientX - r.left) / r.width) * (t.scrollWidth - t.clientWidth), behavior: 'smooth' });
    restart();
  });

  if (sec) {
    /* mouse: paused while the cursor is anywhere inside the services section */
    sec.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    sec.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; restart(); } });
    /* touch: paused while a finger is on the section */
    sec.addEventListener('touchstart', function () { touching = true; }, { passive: true });
    sec.addEventListener('touchend', function () { touching = false; restart(); }, { passive: true });
    sec.addEventListener('touchcancel', function () { touching = false; restart(); }, { passive: true });
    /* keyboard focus */
    sec.addEventListener('focusin', function () { focused = true; });
    sec.addEventListener('focusout', function () { focused = false; restart(); });
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { seen = e[0].isIntersecting; }).observe(t); else seen = true;

  upd();
  restart();
})();
