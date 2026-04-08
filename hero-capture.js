(function () {
  var HTML = document.documentElement;
  if (HTML.classList.contains("work-page") || HTML.classList.contains("all-work-page")) {
    return;
  }

  var cursorRoot = document.getElementById("hero-cursor-root");
  var cursorDot = document.getElementById("hero-cursor-dot");
  var heroBrand = document.getElementById("hero-brand");

  if (!cursorRoot || !cursorDot || !heroBrand) {
    return;
  }

  var coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  var DOT_R = 24;

  function readDotRadius() {
    var inner = cursorDot.querySelector(".hero-cursor-dot__inner");
    if (!inner) return;
    var w = parseFloat(window.getComputedStyle(inner).width) || 48;
    DOT_R = w / 2;
  }

  function circleIntersectsRect(cx, cy, cr, r) {
    var rx = r.left;
    var ry = r.top;
    var rw = r.width;
    var rh = r.height;
    var nx = Math.max(rx, Math.min(cx, rx + rw));
    var ny = Math.max(ry, Math.min(cy, ry + rh));
    var dx = cx - nx;
    var dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var curX = mouseX;
  var curY = mouseY;
  var rafId = 0;
  var lastOverlap = false;
  var lastDark = false;

  /* Dark-background sections — cursor turns white here */
  var darkZoneEls = (function () {
    var out = [];
    ['.work-0', '.svc', '.ctc'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) out.push(el);
    });
    return out;
  }());

  function isInDarkZone(x, y) {
    for (var i = 0; i < darkZoneEls.length; i++) {
      var r = darkZoneEls[i].getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) return true;
    }
    return false;
  }

  function getHeroWordRects() {
    var kmc = heroBrand.querySelector(".hero-brand__line--kmc .hero-brand__word");
    var lucas = heroBrand.querySelector(".hero-brand__line--lucas .hero-brand__word");
    var out = [];
    if (kmc) out.push(kmc.getBoundingClientRect());
    if (lucas) out.push(lucas.getBoundingClientRect());
    return out;
  }

  function updateOverlap() {
    readDotRadius();

    /* Dark zone check */
    var dark = isInDarkZone(curX, curY);
    if (dark !== lastDark) {
      lastDark = dark;
      cursorDot.classList.toggle('is-dark-zone', dark);
    }

    /* Hero text overlap (only relevant in light zone) */
    var rects = getHeroWordRects();
    var hit = false;
    var i;
    for (i = 0; i < rects.length; i++) {
      if (circleIntersectsRect(curX, curY, DOT_R, rects[i])) {
        hit = true;
        break;
      }
    }
    if (hit !== lastOverlap) {
      lastOverlap = hit;
      cursorDot.classList.toggle("is-over-hero-text", hit);
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function tick() {
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);
    cursorDot.style.transform = "translate(" + curX + "px," + curY + "px)";
    updateOverlap();
    rafId = requestAnimationFrame(tick);
  }

  function onMove(ev) {
    mouseX = ev.clientX;
    mouseY = ev.clientY;
  }

  function setMenuClass() {
    HTML.classList.toggle("menu-open", document.body.classList.contains("menu-open"));
  }

  function enableHeroCursor() {
    HTML.classList.add("hero-cursor-ready", "hero-cursor-armed");
    readDotRadius();
    if (!coarsePointer) {
      rafId = requestAnimationFrame(tick);
      window.addEventListener("mousemove", onMove, { passive: true });
    }
  }

  function whenIntroDone(cb) {
    if (HTML.classList.contains("intro-done")) {
      cb();
      return;
    }
    var obs = new MutationObserver(function () {
      if (HTML.classList.contains("intro-done")) {
        obs.disconnect();
        cb();
      }
    });
    obs.observe(HTML, { attributes: true, attributeFilter: ["class"] });
  }

  new MutationObserver(setMenuClass).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  setMenuClass();

  window.addEventListener("resize", readDotRadius, { passive: true });

  whenIntroDone(enableHeroCursor);
})();
