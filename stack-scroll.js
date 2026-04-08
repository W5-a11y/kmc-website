/* ═══════════════════════════════════════════════════════
   Cinema-Stack Scroll
   Scales + dims each panel as the next one slides in.
   Only runs on desktop (≥ 768 px) after html.intro-done.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MOBILE_BP   = 768;
  var SCALE_MIN   = 0.92;   /* panel shrinks to 92% when fully covered */
  var DIM_MIN     = 0.60;   /* panel dims to 60% brightness when fully covered */

  function isMobile() {
    return window.innerWidth < MOBILE_BP;
  }

  function setup() {
    if (isMobile()) return;

    var wrap = document.getElementById('stack-wrap');
    if (!wrap) return;

    var panels = Array.from(wrap.querySelectorAll('.stack-panel'));
    var N = panels.length;
    if (N < 2) return;

    var ticking = false;

    function update() {
      ticking = false;
      if (isMobile()) {
        /* Viewport resized below breakpoint — clear any transforms */
        for (var j = 0; j < N; j++) {
          panels[j].style.transform = '';
          panels[j].style.filter = '';
        }
        return;
      }

      var wrapTop = wrap.getBoundingClientRect().top;
      var scrolled = -wrapTop;          /* px scrolled into the stack container */
      var vh      = window.innerHeight;

      for (var i = 0; i < N - 1; i++) {
        /*
         * progress: 0 when panel (i+1) just enters the viewport bottom,
         *           1 when panel (i+1) fully covers panel i.
         * Panel i+1 travels from y = (i+1)*vh down to y = 0 as the user
         * scrolls through the i-th segment of the container.
         */
        var raw      = (scrolled - i * vh) / vh;
        var progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;

        if (progress > 0) {
          var scale      = 1 - (1 - SCALE_MIN) * progress;     /* 1.0 → 0.92 */
          var brightness = 1 - (1 - DIM_MIN)   * progress;     /* 1.0 → 0.60 */
          panels[i].style.transform = 'scale(' + scale.toFixed(5) + ')';
          panels[i].style.filter   = 'brightness(' + brightness.toFixed(5) + ')';
        } else {
          panels[i].style.transform = '';
          panels[i].style.filter   = '';
        }
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll',  onScroll,  { passive: true });
    window.addEventListener('resize',  onScroll,  { passive: true });
    update(); /* run once immediately */
  }

  /* ── Wait for intro-done ── */
  var HTML = document.documentElement;

  if (HTML.classList.contains('intro-done')) {
    setup();
  } else {
    var obs = new MutationObserver(function () {
      if (HTML.classList.contains('intro-done')) {
        obs.disconnect();
        setup();
      }
    });
    obs.observe(HTML, { attributes: true, attributeFilter: ['class'] });
  }
})();
