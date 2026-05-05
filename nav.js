(function () {
  'use strict';

  var BODY   = document.body;
  var HTML   = document.documentElement;
  var DRAWER = document.getElementById('menu-drawer');

  /* ── Menu drawer ── */

  function isMenuOpen() {
    return BODY.classList.contains('menu-open');
  }

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
      setMenuOpen(!isMenuOpen());
    });
  });

  document.querySelectorAll('.js-go-home').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      var href = el.getAttribute('href') || '';
      setMenuOpen(false);
      if (!href || href === '#') {
        ev.preventDefault();
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }
      ev.preventDefault();
      window.location.href = href;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMenuOpen()) setMenuOpen(false);
  });

  var overlay = document.querySelector('.menu-overlay');
  if (overlay) overlay.addEventListener('click', function () { setMenuOpen(false); });

  /* ── About-nav collapse on scroll (only active when #ab-nav exists) ── */

  (function () {
    var nav = document.getElementById('ab-nav');
    if (!nav) return;

    var lastY   = window.scrollY || window.pageYOffset || 0;
    var DELTA   = 6;
    var TOP_HOLD = 24;

    function onScroll() {
      var y    = window.scrollY || window.pageYOffset || 0;
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

  /* ── Home intro (index.html only — no-op on all other pages) ── */

  var homeIntroStarted = false;

  function attachHeroScrollSoft() {
    var applied = false;
    window.addEventListener('scroll', function () {
      if (applied || !HTML.classList.contains('intro-done')) return;
      if ((window.scrollY || document.documentElement.scrollTop) > 10) {
        applied = true;
        HTML.classList.add('hero-scroll-soft');
      }
    }, { passive: true });
  }

  function startHomeIntro() {
    if (homeIntroStarted) return;
    homeIntroStarted = true;
    HTML.classList.add('intro-pending');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        HTML.classList.remove('intro-pending');
        HTML.classList.add('intro-active');
      });
    });
    window.setTimeout(function () {
      HTML.classList.remove('intro-active');
      HTML.classList.add('intro-done');
    }, 2400);
    attachHeroScrollSoft();
  }

  function startHomeIntroMerged() {
    if (homeIntroStarted) return;
    homeIntroStarted = true;
    var mergeDelayMs = 160;
    var brandHoldMs  = 2600;
    window.setTimeout(function () { HTML.classList.add('intro-active'); }, mergeDelayMs);
    window.setTimeout(function () {
      HTML.classList.remove('intro-active');
      HTML.classList.add('intro-done');
    }, mergeDelayMs + brandHoldMs);
    attachHeroScrollSoft();
  }

  function finishHomeIntroReduced() {
    if (homeIntroStarted) return;
    homeIntroStarted = true;
    HTML.classList.add('intro-done');
    attachHeroScrollSoft();
  }

  function scheduleHomeIntro() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { window.setTimeout(finishHomeIntroReduced, 0); return; }
    if (HTML.classList.contains('has-opening')) {
      window.setTimeout(startHomeIntroMerged, 0);
    } else {
      window.setTimeout(startHomeIntro, 0);
    }
  }

  if (!HTML.classList.contains('work-page') && !HTML.classList.contains('all-work-page') &&
      !HTML.classList.contains('ssv-page') && !HTML.classList.contains('ssv-we-page') &&
      !HTML.classList.contains('about-page')) {
    if (HTML.classList.contains('opening-finished')) {
      scheduleHomeIntro();
    } else {
      window.addEventListener('kmc-opening-done', scheduleHomeIntro, { once: true });
      window.setTimeout(function () { if (!homeIntroStarted) scheduleHomeIntro(); }, 10000);
    }
  }
})();
