/* Clients marquee: seamless infinite loop. Works with any number of logos (even 5). */
(function () {
  var track = document.querySelector('.cl-track');
  if (!track) return;
  var box = track.parentElement;
  var originals = Array.prototype.slice.call(track.children);
  if (!originals.length) return;

  function build() {
    // reset to the original items only
    while (track.firstChild) track.removeChild(track.firstChild);
    originals.forEach(function (li) { track.appendChild(li); });

    var one = originals[0].getBoundingClientRect();
    var cs = getComputedStyle(originals[0]);
    var itemW = one.width + parseFloat(cs.marginRight || 0) + parseFloat(cs.marginLeft || 0);
    var need = box.clientWidth + itemW;               // one "group" must be wider than the viewport

    // group = originals repeated until it is wider than the container
    var groupCount = originals.length;
    while (groupCount * itemW < need) {
      originals.forEach(function (li) {
        var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
      });
      groupCount += originals.length;
    }
    var groupW = groupCount * itemW;

    // second identical group makes the -50% jump invisible
    var kids = Array.prototype.slice.call(track.children);
    kids.forEach(function (li) {
      var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
    });

    var speed = parseFloat(track.getAttribute('data-speed')) || 45;   // px per second
    track.style.setProperty('--cl-dur', (groupW / speed) + 's');
  }

  build();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 200); });
})();
