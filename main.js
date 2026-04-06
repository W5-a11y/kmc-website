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

  /* Home hero intro only (not WORK / All Work pages) */
  if (!HTML.classList.contains("work-page") && !HTML.classList.contains("all-work-page")) {
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

    /* First small scroll: subtle tagline motion only */
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
})();
