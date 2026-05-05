(function () {
  'use strict';

  /* ── Mobile scale ── */
  (function cdScale() {
    function apply() {
      var s = Math.min(window.innerWidth / 1440, 1);
      document.documentElement.style.setProperty('--cd-scale', s > 0 ? String(s) : '1');
    }
    apply();
    window.addEventListener('resize', apply, { passive: true });
  })();

  var stage = document.querySelector('.cd-stage');
  if (!stage) return;

  var ytId = stage.getAttribute('data-yt-id');
  if (!ytId) return; // no-video pages: skip player wiring

  var playBtn = document.querySelector('.cd-play');
  var heroImg = document.querySelector('.cd-hero__img');
  var player = document.getElementById('cd-player');
  var frame = player ? player.querySelector('.cd-player__frame') : null;
  var closeBtn = player ? player.querySelector('.cd-player__close') : null;

  function openPlayer() {
    if (!player || !frame) return;
    frame.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' +
      ytId +
      '?autoplay=1&rel=0&modestbranding=1" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    player.classList.add('is-on');
    document.body.style.overflow = 'hidden';
  }

  function closePlayer() {
    if (!player || !frame) return;
    player.classList.remove('is-on');
    frame.innerHTML = '';
    document.body.style.overflow = '';
  }

  if (playBtn) playBtn.addEventListener('click', openPlayer);
  if (heroImg) {
    heroImg.style.cursor = 'pointer';
    heroImg.addEventListener('click', openPlayer);
  }
  if (closeBtn) closeBtn.addEventListener('click', closePlayer);
  if (player) {
    player.addEventListener('click', function (e) {
      if (e.target === player) closePlayer();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePlayer();
  });
})();
