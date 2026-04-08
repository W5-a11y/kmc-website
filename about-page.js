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
})();
