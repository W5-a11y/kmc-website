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

    root.querySelectorAll("[data-aw-rise-group]").forEach(function (el) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) el.classList.add("is-in");
          });
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
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
    root.querySelectorAll("[data-aw-reveal], [data-aw-rise], [data-aw-reveal-w3], [data-aw-rise-group]").forEach(function (el) {
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
    var map = { "#work_1_1": "work_1_1", "#work_1_3": "work_1_3", "#work_2": "work_2" };
    var id = map[window.location.hash];
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.setTimeout(w3MorphTick, reduce ? 80 : 520);
    });
  }

  var hash = window.location.hash || "";
  var deepWork = /^#work_1_3|^#work_2/.test(hash);
  scrollToHash();

  var s1 = document.getElementById("work_1_1");
  var s3 = document.getElementById("work_1_3");
  var downBtn = document.querySelector(".js-aw-down-next");
  var overlay = document.getElementById("aw-page-transition");
  var awGateActive = !deepWork && !!(s1 && s3 && downBtn);

  if (downBtn && s1 && s3) {
  function releaseAwScrollLock() {
    root.style.overflow = "";
    document.body.style.overflow = "";
  }

  function applyAwScrollLock() {
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
  }

  function removeAwNavBlocks() {
    window.removeEventListener("wheel", onAwWheel, { capture: true });
    window.removeEventListener("touchmove", onAwTouch, { capture: true });
    window.removeEventListener("keydown", onAwKey);
  }

  function onAwWheel(ev) {
    if (!awGateActive) return;
    ev.preventDefault();
  }

  function onAwTouch(ev) {
    if (!awGateActive) return;
    var el = ev.target;
    if (el.closest && (el.closest(".js-menu-toggle") || el.closest("#menu-drawer") || el.closest(".js-aw-down-next") || el.closest(".js-go-home"))) {
      return;
    }
    ev.preventDefault();
  }

  function onAwKey(ev) {
    if (!awGateActive) return;
    var k = ev.key;
    if (k === "PageDown" || k === "PageUp" || k === " " || k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
      ev.preventDefault();
    }
  }

  if (awGateActive) {
    applyAwScrollLock();
    window.addEventListener("wheel", onAwWheel, { passive: false, capture: true });
    window.addEventListener("touchmove", onAwTouch, { passive: false, capture: true });
    window.addEventListener("keydown", onAwKey);
  }

  function runAwDeepLinkScroll() {
    window.setTimeout(w3MorphTick, reduce ? 80 : 520);
  }

  function finishAwTransition() {
    downBtn.disabled = false;
    if (overlay) {
      overlay.setAttribute("hidden", "");
      overlay.classList.remove("is-on", "is-covered");
      overlay.style.transition = "";
      overlay.style.clipPath = "";
    }
  }

  downBtn.addEventListener("click", function () {
    if (!s3) return;

    if (!awGateActive) {
      s3.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      runAwDeepLinkScroll();
      return;
    }

    downBtn.disabled = true;
    s1.classList.add("aw-s1-exit");

    if (reduce || !overlay) {
      releaseAwScrollLock();
      s3.scrollIntoView({ behavior: "auto", block: "start" });
      awGateActive = false;
      removeAwNavBlocks();
      s1.classList.remove("aw-s1-exit");
      downBtn.disabled = false;
      try {
        history.replaceState(null, "", "#work_1_3");
      } catch (errSkip) {
        /* ignore */
      }
      runAwDeepLinkScroll();
      return;
    }

    overlay.removeAttribute("hidden");
    overlay.classList.add("is-on");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("is-covered");
      });
    });

    function onCoverEnd(ev) {
      if (ev.propertyName !== "clip-path") return;
      overlay.removeEventListener("transitionend", onCoverEnd);
      releaseAwScrollLock();
      s3.scrollIntoView({ behavior: "auto", block: "start" });
      awGateActive = false;
      removeAwNavBlocks();

      overlay.style.transition = "none";
      overlay.style.clipPath = "inset(0 0 0 0)";
      overlay.offsetHeight;
      overlay.style.transition = "clip-path 0.58s cubic-bezier(0.22, 1, 0.36, 1)";
      requestAnimationFrame(function () {
        overlay.style.clipPath = "inset(0 0 100% 0)";
      });

      function onUncoverEnd(e) {
        if (e.propertyName !== "clip-path") return;
        overlay.removeEventListener("transitionend", onUncoverEnd);
        s1.classList.remove("aw-s1-exit");
        finishAwTransition();
        try {
          history.replaceState(null, "", "#work_1_3");
        } catch (err) {
          /* ignore */
        }
        runAwDeepLinkScroll();
      }
      overlay.addEventListener("transitionend", onUncoverEnd);
    }
    overlay.addEventListener("transitionend", onCoverEnd);
  });
  }
})();
