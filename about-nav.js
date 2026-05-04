(function () {
  'use strict';

  var BODY   = document.body;
  var DRAWER = document.getElementById('menu-drawer');

  function setMenuOpen(open) {
    BODY.classList.toggle('menu-open', open);
    if (DRAWER) {
      DRAWER.classList.toggle('is-active', open);
      DRAWER.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    document.querySelectorAll('.js-menu-toggle').forEach(function (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.js-menu-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      setMenuOpen(!BODY.classList.contains('menu-open'));
    });
  });

  document.querySelectorAll('.js-go-home').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var href = el.getAttribute('href') || '';
      setMenuOpen(false);
      if (!href || href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      e.preventDefault();
      window.location.href = href;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && BODY.classList.contains('menu-open')) {
      setMenuOpen(false);
    }
  });

  if (DRAWER) {
    var overlay = document.querySelector('.menu-overlay');
    if (overlay) overlay.addEventListener('click', function () { setMenuOpen(false); });
  }

  (function aboutNavCollapseOnScroll() {
    var nav = document.getElementById('ab-nav');
    if (!nav) return;

    var lastY = window.scrollY || window.pageYOffset || 0;
    var DELTA = 6;
    var TOP_HOLD = 24;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      var diff = y - lastY;

      if (y <= TOP_HOLD) {
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
})();
