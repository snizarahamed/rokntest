/* fx.js
 * 1) Cursor glow on every card (soft light + glowing border edge under the cursor)
 * 2) Background: thin wires with soft gold light pulses running along them (kept very subtle)
 */

/* ---------- 1) CURSOR GLOW ON CARDS ---------- */
(function () {
  // every card-like element on the page; add your own selector here if you add new cards
  var SELECTORS = '.box, .cert-card, .sira2-card, #what-we-do .img, .form, .pt';
  var cards = document.querySelectorAll(SELECTORS);
  cards.forEach(function (c) {
    c.classList.add('glow-card');
    var fx = document.createElement('span');
    fx.className = 'gfx';
    fx.setAttribute('aria-hidden', 'true');
    c.appendChild(fx);
  });
  if (!matchMedia('(pointer: fine)').matches) return;
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.glow-card');
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();

/* ---------- 2) RUNNING WIRES BACKGROUND ---------- */
(function () {
  var cv = document.getElementById('wires');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- look & feel (lower alpha = more subtle) ---
  var WIRE_ALPHA = 0.06;      // the idle wires
  var PULSE_ALPHA = 0.55;     // brightness of the running light
  var PULSE_SPEED = [38, 80]; // px per second (slow = calm)
  var TAIL = 170;             // length of the light trail in px
  var GOLD = '214,173,67';

  var W, H, dpr, wires, pulses, base, raf, last = 0;

  function rng(seed) {
    return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  }

  function makeWire(rand, across, span, vertical) {
    // path runs along "u" (0..span) while drifting in "v" (across); bends are 45° or 90°
    var u = -20, v = across, dir = 0, pts = [[u, v]];
    while (u < span + 20) {
      var len = 90 + rand() * 230;
      var next = dir === 0 ? (rand() < .66 ? 0 : (rand() < .5 ? 1 : -1)) : 0;
      var d = Math.min(len, 150);
      if (next !== 0 && (v + next * d < 14 || v + next * d > (vertical ? W : H) - 14)) next = 0;
      if (next === 0) { u += len; } else { u += d; v += next * d; }
      pts.push([u, v]);
      dir = next;
    }
    if (vertical) pts = pts.map(function (p) { return [p[1], p[0]]; });
    var cum = [0];
    for (var i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts: pts, cum: cum, len: cum[cum.length - 1] };
  }

  function pointAt(w, d) {
    if (d <= 0) return w.pts[0];
    if (d >= w.len) return w.pts[w.pts.length - 1];
    var lo = 0, hi = w.cum.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (w.cum[mid] <= d) lo = mid; else hi = mid; }
    var t = (d - w.cum[lo]) / (w.cum[hi] - w.cum[lo] || 1);
    return [w.pts[lo][0] + (w.pts[hi][0] - w.pts[lo][0]) * t, w.pts[lo][1] + (w.pts[hi][1] - w.pts[lo][1]) * t];
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var rand = rng(11), nH = W < 700 ? 3 : 6, nV = W < 700 ? 2 : 3;
    wires = [];
    var i;
    for (i = 0; i < nH; i++) wires.push(makeWire(rand, (i + .5) / nH * H + (rand() - .5) * (H / nH) * .7, W, false));
    for (i = 0; i < nV; i++) wires.push(makeWire(rand, (i + .5) / nV * W + (rand() - .5) * (W / nV) * .7, H, true));

    // static layer: wires + small junction dots
    base = document.createElement('canvas');
    base.width = cv.width; base.height = cv.height;
    var b = base.getContext('2d');
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.lineWidth = 1; b.lineJoin = 'round';
    wires.forEach(function (w) {
      b.strokeStyle = 'rgba(231,235,240,' + WIRE_ALPHA + ')';
      b.beginPath();
      w.pts.forEach(function (p, k) { k ? b.lineTo(p[0], p[1]) : b.moveTo(p[0], p[1]); });
      b.stroke();
      b.fillStyle = 'rgba(' + GOLD + ',' + (WIRE_ALPHA * 1.6) + ')';
      for (var k = 1; k < w.pts.length - 1; k++) {
        b.beginPath(); b.arc(w.pts[k][0], w.pts[k][1], 2, 0, 6.2832); b.fill();
      }
    });

    // moving lights: one per wire, each with its own speed and pause
    pulses = wires.map(function (w, idx) {
      return { w: w, d: -rand() * w.len, v: PULSE_SPEED[0] + rand() * (PULSE_SPEED[1] - PULSE_SPEED[0]), wait: rand() * 4 };
    });
  }

  function drawPulse(p) {
    var w = p.w, head = p.d;
    var steps = 14, step = TAIL / steps, prev = pointAt(w, head - TAIL);
    ctx.lineCap = 'round';
    for (var i = 1; i <= steps; i++) {
      var d = head - TAIL + i * step;
      if (d < 0) { prev = pointAt(w, d); continue; }
      var cur = pointAt(w, d);
      var a = Math.pow(i / steps, 2.2) * PULSE_ALPHA;
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(cur[0], cur[1]); ctx.stroke();
      prev = cur;
    }
    if (head > 0 && head < w.len) {
      var hp = pointAt(w, head);
      var g = ctx.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 12);
      g.addColorStop(0, 'rgba(' + GOLD + ',' + (PULSE_ALPHA * .9) + ')');
      g.addColorStop(1, 'rgba(' + GOLD + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hp[0], hp[1], 12, 0, 6.2832); ctx.fill();
    }
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((t - last) / 1000, .1) || 0; last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0, W, H);
    pulses.forEach(function (p) {
      if (p.wait > 0) { p.wait -= dt; return; }
      p.d += p.v * dt;
      if (p.d - TAIL > p.w.len) { p.d = -40; p.wait = 1.5 + Math.random() * 5; return; }
      drawPulse(p);
    });
  }

  function start() { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  build();
  ctx.drawImage(base, 0, 0, W, H);          // reduced-motion: static wires only
  if (!reduce) {
    start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { build(); if (reduce) ctx.drawImage(base, 0, 0, W, H); }, 200);
  });
})();


/* ---------- 3) COUNT-UP NUMBERS (About stats) ---------- */
(function () {
  var els = document.querySelectorAll('.cnt[data-to]');
  if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  els.forEach(function (el) { el.textContent = '0'; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      var el = en.target, to = +el.dataset.to, t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .6 });
  els.forEach(function (el) { io.observe(el); });
})();
