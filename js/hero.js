/* Image cards (landing + about): gentle tilt that follows the cursor, plus a soft glow under the cursor */
(function () {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [['heroVis', 'heroCard']].forEach(function (ids) {
    var vis = document.getElementById(ids[0]), card = document.getElementById(ids[1]);
    if (!vis || !card) return;
    window.addEventListener('pointermove', function (e) {
      var r = vis.getBoundingClientRect();
      var x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.4)));
      var y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight * 0.5)));
      card.style.transform = 'translate3d(' + (x * 8) + 'px,' + (y * 6) + 'px,0) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 4) + 'deg)';
      var c = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - c.left) + 'px');
      card.style.setProperty('--my', (e.clientY - c.top) + 'px');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
})();

/* Cursor glow anywhere inside the landing section */
(function () {
  var box = document.querySelector('.landing');
  if (!box || !matchMedia('(pointer: fine)').matches) return;
  box.addEventListener('pointermove', function (e) {
    var r = box.getBoundingClientRect();
    box.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    box.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();
