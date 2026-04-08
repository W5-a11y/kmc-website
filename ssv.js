/* ═══════════════════════════════════════════════
   SSV — Surviving Silicon Valley (interactions)
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!document.querySelector('.page-ssv')) return;

  /* ─── Elements ──────────────────────────── */
  var sections = Array.from(document.querySelectorAll('.ssv-section'));
  var nav      = document.getElementById('ssv-nav');
  var TOTAL    = sections.length;          // 6
  var current  = 0;
  var busy     = false;
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = reduced ? 20 : 950;

  /* ─── Nav theme ─────────────────────────── */
  function setNavTheme(idx) {
    if (!nav) return;
    var theme = sections[idx].getAttribute('data-theme') || 'dark';
    nav.classList.toggle('ssv-nav--light',   theme === 'light');
    nav.classList.toggle('ssv-nav--landing', idx === 0);
  }

  /* ─── Go to section ─────────────────────── */
  function goTo(idx) {
    if (idx < 0 || idx >= TOTAL || idx === current || busy) return;
    busy = true;
    var from = current;
    current  = idx;

    /* — Landing → About: SSV window morphs to right ─
     *
     * Timeline (from click):
     *   0ms    : mask starts shrinking (0.95s), video snaps out (0.3s)
     *   350ms  : About activates — about_ssv.svg starts expanding from
     *            scale(0.12) as mask is still collapsing → visual hand-off
     *   1050ms : mask is fully gone; about_ssv.svg is ~90% expanded
     */
    if (from === 0 && idx === 1) {
      sections[0].classList.add('is-morphing');

      setTimeout(function () {
        sections[1].classList.add('is-active');
      }, reduced ? 10 : 350);

      setTimeout(function () {
        sections[0].classList.add('is-gone');
      }, reduced ? 20 : 1050);
    }

    /* — About → forward: slide sheets up as paper cards ─ */
    if (idx > 1) {
      sections[idx].classList.add('is-visible');
    }

    /* — Going backwards ─────────────────── */
    if (idx < from) {
      for (var i = from; i > Math.max(idx, 1); i--) {
        sections[i].classList.remove('is-visible');
      }
      if (idx === 0) {
        // Return to landing: reverse morph
        sections[0].classList.remove('is-morphing', 'is-gone');
        sections[1].classList.remove('is-active');
      } else if (idx === 1 && from > 1) {
        sections[1].classList.add('is-active');
      }
    }

    setNavTheme(idx);
    setTimeout(function () { busy = false; }, DURATION);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ─── Initialise ────────────────────────── */
  setNavTheme(0);

  /* ─── Landing: click anywhere → About ──── */
  sections[0].addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    next();
  });

  /* ─── data-target links ──────────────────── */
  document.querySelectorAll('.js-ssv-go').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var t = parseInt(el.getAttribute('data-target'), 10);
      if (!isNaN(t)) goTo(t);
    });
  });

  /* ─── "Past Episodes on Youtube" next btn ─ */
  var nextBtn = document.querySelector('.js-ssv-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      next();
    });
  }

  /* ─── "Back to Episodes" prev btn ────────── */
  var prevBtn = document.querySelector('.js-ssv-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.preventDefault();
      prev();
    });
  }

  /* ─── Wheel ─────────────────────────────── */
  var delta = 0, wTimer;
  document.addEventListener('wheel', function (e) {
    // Allow native scroll inside the screening section
    if (current === TOTAL - 1) {
      var inner = sections[TOTAL - 1].querySelector('.ssv-screening__inner');
      if (inner && e.deltaY > 0 &&
          inner.scrollTop < inner.scrollHeight - inner.clientHeight - 2) return;
    }
    e.preventDefault();
    delta += e.deltaY;
    clearTimeout(wTimer);
    wTimer = setTimeout(function () { delta = 0; }, 280);
    if (Math.abs(delta) < 80) return;
    if (delta > 0) next(); else prev();
    delta = 0;
  }, { passive: false });

  /* ─── Touch ──────────────────────────────── */
  var ty = 0;
  document.addEventListener('touchstart', function (e) {
    ty = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (current < TOTAL - 1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', function (e) {
    var dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 44) return;
    if (dy > 0) next(); else prev();
  }, { passive: true });

  /* ─── Keyboard ───────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowUp')                     { e.preventDefault(); prev(); }
  });

  /* ─── Other Content: drag + auto-scroll ─── */
  var track = document.querySelector('.ssv-other__scroll');
  if (track) {
    var drag = false, sx = 0, sl = 0;

    track.addEventListener('mousedown', function (e) {
      drag = true; sx = e.pageX; sl = track.scrollLeft;
    });
    track.addEventListener('mousemove', function (e) {
      if (!drag) return;
      e.preventDefault();
      track.scrollLeft = sl - (e.pageX - sx);
    });
    track.addEventListener('mouseup',    function () { drag = false; });
    track.addEventListener('mouseleave', function () { drag = false; });

    var raf, speed = 0.55;
    function autoScroll() {
      if (!drag) {
        track.scrollLeft += speed;
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
          track.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(autoScroll);
    }

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        autoScroll();
      } else {
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0.3 }).observe(track);
  }

})();
