/* ══════════════════════════════════════════════════
   Shared page cursor — SSV + About
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HTML = document.documentElement;
  var isSSV   = HTML.classList.contains('ssv-page');
  var isAbout = HTML.classList.contains('about-page');
  if (!isSSV && !isAbout) return;

  if (window.matchMedia('(pointer: coarse)').matches) return;

  var cursor = document.getElementById('page-cursor');
  if (!cursor) return;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var curX   = mouseX;
  var curY   = mouseY;
  var moved  = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);
    cursor.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
    requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!moved) {
      moved = true;
      cursor.classList.add('is-ready');
    }
  }, { passive: true });

  HTML.classList.add('pc-armed');
  requestAnimationFrame(tick);
})();
