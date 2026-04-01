(function () {
  const root = document.documentElement;
  if (!root.classList.contains("all-work-page")) return;

  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function awScale() {
    const sx = window.innerWidth / 1440;
    const sy = window.innerHeight / 1024;
    const s = Math.min(sx, sy, 1);
    root.style.setProperty("--aw-scale", String(s > 0 ? s : 1));
  }

  awScale();
  window.addEventListener("resize", awScale, { passive: true });

  if (!reduce) {
    root.querySelectorAll("[data-aw-reveal]").forEach(function (el) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) el.classList.add("is-in");
          });
        },
        { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
      );
      io.observe(el);
    });

    root.querySelectorAll("[data-aw-rise]").forEach(function (el) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) el.classList.add("is-in");
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
      io.observe(el);
    });

    root.querySelectorAll("[data-aw-reveal-w3]").forEach(function (el) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) el.classList.add("is-in");
          });
        },
        { root: null, rootMargin: "0px 0px -14% 0px", threshold: 0.06 }
      );
      io.observe(el);
    });
  } else {
    root.querySelectorAll("[data-aw-reveal], [data-aw-rise], [data-aw-reveal-w3]").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  const w3Section = document.getElementById("work_1_3");
  function w3MorphTick() {
    if (!w3Section || reduce) return;
    var vh = window.innerHeight;
    var r = w3Section.getBoundingClientRect();
    var p;
    if (r.top > vh * 0.9) {
      p = 0;
    } else if (r.bottom < -120) {
      p = 1;
    } else {
      var span = Math.max(vh * 0.52, 340);
      p = 1 - Math.min(Math.max(r.top / span, 0), 1);
    }
    w3Section.style.setProperty("--aw-w3-morph", String(p));
  }

  if (w3Section && !reduce) {
    w3MorphTick();
    window.addEventListener("scroll", w3MorphTick, { passive: true });
    window.addEventListener("resize", w3MorphTick, { passive: true });
  }

  function scrollToHash() {
    var map = { "#work_1_1": "work_1_1", "#work_1_3": "work_1_3" };
    var id = map[window.location.hash];
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.setTimeout(w3MorphTick, reduce ? 80 : 520);
    });
  }
  scrollToHash();
})();
