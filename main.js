(function () {
  const BODY = document.body;
  const HTML = document.documentElement;
  const DRAWER = document.getElementById("menu-drawer");

  function isMenuOpen() {
    return BODY.classList.contains("menu-open");
  }

  function setMenuOpen(open) {
    BODY.classList.toggle("menu-open", open);
    DRAWER.classList.toggle("is-active", open);
    DRAWER.setAttribute("aria-hidden", open ? "false" : "true");

    document.querySelectorAll(".js-menu-toggle").forEach(function (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function toggleMenu() {
    setMenuOpen(!isMenuOpen());
  }

  function goHome(ev) {
    const el = ev.currentTarget;
    const href = el.getAttribute("href") || "";
    setMenuOpen(false);
    if (href === "#" || href === "") {
      ev.preventDefault();
      const reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    ev.preventDefault();
    window.location.href = href;
  }

  document.querySelectorAll(".js-menu-toggle").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toggleMenu();
    });
  });

  document.querySelectorAll(".js-go-home").forEach(function (el) {
    el.addEventListener("click", goHome);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isMenuOpen()) {
      setMenuOpen(false);
    }
  });

  /* Home hero intro only (not WORK / All Work pages); runs after Lottie opening if present */
  var homeIntroStarted = false;

  function attachHeroScrollSoft() {
    var heroScrollSoftApplied = false;
    window.addEventListener(
      "scroll",
      function () {
        if (heroScrollSoftApplied || !HTML.classList.contains("intro-done")) return;
        if ((window.scrollY || document.documentElement.scrollTop) > 10) {
          heroScrollSoftApplied = true;
          HTML.classList.add("hero-scroll-soft");
        }
      },
      { passive: true }
    );
  }

  /** Legacy path: home without has-opening (intro-pending flash OK). */
  function startHomeIntro() {
    if (homeIntroStarted) return;
    homeIntroStarted = true;
    HTML.classList.add("intro-pending");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        HTML.classList.remove("intro-pending");
        HTML.classList.add("intro-active");
      });
    });

    window.setTimeout(function () {
      HTML.classList.remove("intro-active");
      HTML.classList.add("intro-done");
    }, 2400);

    attachHeroScrollSoft();
  }

  /**
   * Page/header snap in when Lottie ends (no long blur/lift). Brand stays off-air until intro-active,
   * then glitch / tagline / scan — the single creative entrance.
   */
  function startHomeIntroMerged() {
    if (homeIntroStarted) return;
    homeIntroStarted = true;
    var mergeDelayMs = 160;
    var brandHoldMs = 2600;

    window.setTimeout(function () {
      HTML.classList.add("intro-active");
    }, mergeDelayMs);

    window.setTimeout(function () {
      HTML.classList.remove("intro-active");
      HTML.classList.add("intro-done");
    }, mergeDelayMs + brandHoldMs);

    attachHeroScrollSoft();
  }

  function finishHomeIntroReduced() {
    if (homeIntroStarted) return;
    homeIntroStarted = true;
    HTML.classList.add("intro-done");
    attachHeroScrollSoft();
  }

  function scheduleHomeIntro() {
    var reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      window.setTimeout(finishHomeIntroReduced, 0);
      return;
    }
    if (HTML.classList.contains("has-opening")) {
      window.setTimeout(startHomeIntroMerged, 0);
    } else {
      window.setTimeout(startHomeIntro, 0);
    }
  }

  if (!HTML.classList.contains("work-page") && !HTML.classList.contains("all-work-page")) {
    if (HTML.classList.contains("opening-finished")) {
      scheduleHomeIntro();
    } else {
      window.addEventListener("kmc-opening-done", scheduleHomeIntro, { once: true });
      window.setTimeout(function () {
        if (!homeIntroStarted) scheduleHomeIntro();
      }, 10000);
    }
  }
})();
