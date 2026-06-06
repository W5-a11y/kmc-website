/* ══════════════════════════════════════════════
   About Page — scroll reveal
   ══════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!document.querySelector('.page-about')) return;

  var items = document.querySelectorAll('[data-ab-reveal]');
  if (!items.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(function (el) { io.observe(el); });

  /* ── Equation typewriter ──────────────────────────
     Types the equation character-by-character on first view, styling the
     +/= operators and the result phrase, trailed by a blinking caret. */
  (function equationTypewriter() {
    var host = document.querySelector('[data-equation-typewriter]');
    if (!host) return;
    var typed = host.querySelector('.ab-equation__typed');
    if (!typed) return;

    var segments = [
      { t: 'Advertising ',            c: '' },
      { t: '+ ',                      c: 'ab-equation__op' },
      { t: 'Real Estate ',            c: '' },
      { t: '+ ',                      c: 'ab-equation__op' },
      { t: 'Technology ',             c: '' },
      { t: '+ ',                      c: 'ab-equation__op' },
      { t: 'Entertainment ',          c: '' },
      { t: '= ',                      c: 'ab-equation__eq' },
      { t: 'Human Future Life Style', c: 'ab-equation__result' }
    ];
    var fullText = segments.map(function (s) { return s.t; }).join('');
    var total = fullText.length;
    var caret = '<span class="ab-equation__caret"></span>';

    function render(n) {
      var html = '', remaining = n;
      for (var s = 0; s < segments.length && remaining > 0; s++) {
        var seg = segments[s];
        var take = Math.min(seg.t.length, remaining);
        var part = seg.t.slice(0, take);
        html += seg.c ? '<span class="' + seg.c + '">' + part + '</span>' : part;
        remaining -= take;
      }
      typed.innerHTML = html + caret;
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { render(total); return; }

    var i = 0;
    function tick() {
      i++;
      render(i);
      if (i >= total) {
        host.classList.add('is-done');
        /* Hold briefly, then collapse the whole equation bar away. */
        var box = host.closest('.ab-equation');
        if (box) setTimeout(function () { box.classList.add('is-collapsed'); }, 1000);
        return;
      }
      var justTyped = fullText.charAt(i - 1);
      /* Brief human-like jitter; longer breath after a finished word. */
      var delay = 34 + Math.random() * 34;
      if (justTyped === ' ') delay += 130;
      setTimeout(tick, delay);
    }

    var typeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          typeIO.disconnect();
          setTimeout(tick, 260);
        }
      });
    }, { threshold: 0.6 });
    typeIO.observe(host);
  })();
})();
