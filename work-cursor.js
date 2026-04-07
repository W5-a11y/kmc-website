(function () {
  var HTML = document.documentElement;
  if (!HTML.classList.contains("all-work-page")) return;

  var cursorRoot = document.getElementById("work-cursor-root");
  var cursorDot = document.getElementById("work-cursor-dot");
  if (!cursorRoot || !cursorDot) return;

  var coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var curX = mouseX;
  var curY = mouseY;
  var rafId = 0;
  var DOT_R = 24;
  var lastOverDark = false;

  var INVERSE_ZONE_SELECTORS = [
    "#work_1_4",
    "#work_1_5",
    "#work_1_6",
    "#work_1_3 .aw-w3-box",
    "#work_1_3 .aw-w3-text--black",
    "#work_1_3 .aw-w3-bridge__h1",
    "#work_1_3 .aw-w3-bridge__v1",
    "#work_1_3 .aw-w3-bridge__h2",
    "#work_1_3 .aw-w3-bridge__v2",
    "#work_1_1 .aw-work-title",
    "#work_1_1 .aw-body",
  ];

  var inverseEls = [];

  function cacheInverseElements() {
    inverseEls = [];
    INVERSE_ZONE_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        inverseEls.push(el);
      });
    });
  }

  function readDotRadius() {
    var inner = cursorDot.querySelector(".work-cursor-dot__inner");
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

  function updateOverDark() {
    readDotRadius();
    var hit = false;
    var i;
    for (i = 0; i < inverseEls.length; i++) {
      var rect = inverseEls[i].getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      if (circleIntersectsRect(curX, curY, DOT_R, rect)) {
        hit = true;
        break;
      }
    }
    if (hit !== lastOverDark) {
      lastOverDark = hit;
      cursorDot.classList.toggle("is-over-dark", hit);
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function tick() {
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);
    cursorDot.style.transform = "translate(" + curX + "px," + curY + "px)";
    updateOverDark();
    rafId = requestAnimationFrame(tick);
  }

  function onMove(ev) {
    mouseX = ev.clientX;
    mouseY = ev.clientY;
  }

  function setMenuClass() {
    HTML.classList.toggle("menu-open", document.body.classList.contains("menu-open"));
  }

  function enableWorkCursor() {
    cacheInverseElements();
    readDotRadius();
    HTML.classList.add("work-cursor-ready", "work-cursor-armed");
    if (!coarsePointer) {
      rafId = requestAnimationFrame(tick);
      window.addEventListener("mousemove", onMove, { passive: true });
    }
  }

  new MutationObserver(setMenuClass).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  setMenuClass();

  window.addEventListener(
    "resize",
    function () {
      cacheInverseElements();
      readDotRadius();
    },
    { passive: true }
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(enableWorkCursor);
    });
  } else {
    requestAnimationFrame(enableWorkCursor);
  }
})();
