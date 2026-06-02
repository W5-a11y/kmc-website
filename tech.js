(function () {
  'use strict';

  var root   = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scale hero stage ── */
  function thScale() {
    var s = window.innerWidth / 1440;
    s = s > 0 ? s : 1;
    root.style.setProperty('--tech-scale', String(s));

    var hero = document.getElementById('tech-hero');
    if (hero) hero.style.height = Math.round(1401 * s) + 'px';
  }

  thScale();
  window.addEventListener('resize', thScale, { passive: true });

  /* ── Nav hide/show on scroll ── */
  (function navCollapse() {
    var nav = document.getElementById('aw-nav');
    if (!nav) return;

    var lastY  = window.scrollY || 0;
    var DELTA  = 6;
    var TOP    = 24;

    function onScroll() {
      var y    = window.scrollY || 0;
      var diff = y - lastY;

      if (y <= TOP) {
        nav.classList.remove('is-collapsed');
      } else if (diff > DELTA) {
        nav.classList.add('is-collapsed');
      } else if (diff < -DELTA) {
        nav.classList.remove('is-collapsed');
      }
      lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ── Back to top ── */
  var backBtn = document.querySelector('.js-th-back-top');
  var hero    = document.getElementById('tech-hero');

  if (backBtn && hero) {
    backBtn.addEventListener('click', function () {
      hero.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ── Keyword push interaction ── */
  (function initKeywords() {
    var groups = document.querySelectorAll('.th-kw-group, .th-future-group');
    if (!groups.length) return;

groups.forEach(function (group) {
      group.addEventListener('mouseenter', function () { group.classList.add('is-active'); });
      group.addEventListener('mouseleave', function () { group.classList.remove('is-active'); });
    });
  })();

})();
