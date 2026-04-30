/* Morphing Circular Trigger — magnetic pull + portal reveal.
   Pure vanilla JS. No GSAP. Mirrors the easing of gsap.power3.out
   via cubic-bezier(0.165, 0.84, 0.44, 1) on the CSS side. The JS
   here only handles the magnetic follow (lerp toward cursor) and
   pointer-precise positioning of the portal media. */
(function () {
  'use strict';

  var RADIUS  = 100;          // px from center: magnetic activation range
  var STRENGTH = 0.35;         // 0..1: how far the circle drifts toward cursor
  var EASE    = 0.18;          // lerp factor per frame (~power3.out feel)
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bind(trigger) {
    var circle = trigger.querySelector('.morph-trigger__circle');
    if (!circle) return;

    // Coarse pointers (touch) skip the magnetic effect entirely.
    var coarse = window.matchMedia('(pointer: coarse)').matches;

    var targetX = 0, targetY = 0;
    var x = 0, y = 0;
    var raf = null;
    var active = false;

    function tick() {
      x += (targetX - x) * EASE;
      y += (targetY - y) * EASE;
      circle.style.setProperty('--mt-mx', x.toFixed(2) + 'px');
      circle.style.setProperty('--mt-my', y.toFixed(2) + 'px');

      if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1 || active) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    function onMove(e) {
      var r = circle.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.hypot(dx, dy);
      if (dist > RADIUS) { onLeave(); return; }
      active = true;
      targetX = dx * STRENGTH;
      targetY = dy * STRENGTH;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onLeave() {
      active = false;
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    if (!coarse && !reduceMotion) {
      // Listen on the trigger so the magnetic zone matches the visual hit area.
      trigger.addEventListener('pointermove', onMove);
      trigger.addEventListener('pointerleave', onLeave);
      // Slightly larger ambient zone — listen on parent if it opts in.
      var zone = trigger.closest('[data-magnetic-zone]');
      if (zone && zone !== trigger) {
        zone.addEventListener('pointermove', onMove);
        zone.addEventListener('pointerleave', onLeave);
      }
    }

    // Portal media — promote a data attribute into a layered background so the
    // hover state can fade it in inside the circle. Accepts an image URL.
    var media = trigger.getAttribute('data-portal-media');
    if (media) {
      var layer = document.createElement('span');
      layer.className = 'morph-trigger__media';
      layer.style.backgroundImage = "url('" + media + "')";
      circle.insertBefore(layer, circle.firstChild);
    }
  }

  function init() {
    var nodes = document.querySelectorAll('.morph-trigger');
    nodes.forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
