(function () {
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.defer = true;
    document.head.appendChild(s);
  }

  var section = document.getElementById("work_0");
  if (!section) return;

  var YT_ID = "diQOQJfK-bM";
  var LOOP_END = 4;

  var player = null;
  var fourTimer = null;
  var apiReady = false;

  function getState() {
    return section.getAttribute("data-work-state") || "intro";
  }

  function setState(next) {
    section.setAttribute("data-work-state", next);
    syncPlayerMode();
    refreshVideoHitLabel();
  }

  function refreshVideoHitLabel() {
    var hit = section.querySelector(".js-work-0-video-hit");
    if (!hit) return;
    if (getState() === "detail") {
      hit.setAttribute("aria-label", "Open expanded video");
    } else {
      hit.removeAttribute("aria-label");
    }
  }

  function clearFourLoop() {
    if (fourTimer) {
      window.clearInterval(fourTimer);
      fourTimer = null;
    }
  }

  function startFourLoop() {
    clearFourLoop();
    fourTimer = window.setInterval(function () {
      if (getState() === "video" || !player || typeof player.getCurrentTime !== "function") return;
      try {
        var t = player.getCurrentTime();
        if (t >= LOOP_END - 0.05) player.seekTo(0, true);
      } catch (e) {
        /* ignore */
      }
    }, 120);
  }

  function resetYtHost() {
    var inner = section.querySelector(".work-0__yt-inner");
    if (!inner) return null;
    inner.innerHTML = "";
    var host = document.createElement("div");
    host.id = "work-0-yt-host";
    inner.appendChild(host);
    return host;
  }

  function destroyPlayer() {
    clearFourLoop();
    if (player && typeof player.destroy === "function") {
      try {
        player.destroy();
      } catch (e) {
        /* ignore */
      }
    }
    player = null;
    /* YT.Player.destroy() removes the placeholder node; must recreate #work-0-yt-host or the next build is a no-op. */
    resetYtHost();
  }

  function embedOrigin() {
    if (typeof window.location === "undefined") return undefined;
    if (window.location.protocol === "file:") return undefined;
    return window.location.origin || undefined;
  }

  function buildPlayer(showControls) {
    destroyPlayer();
    if (typeof YT === "undefined" || !YT.Player) return;
    var host = document.getElementById("work-0-yt-host");
    if (!host) return;

    var origin = embedOrigin();
    var vars = {
      autoplay: 1,
      mute: 1,
      controls: showControls ? 1 : 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      enablejsapi: 1,
    };
    if (origin) vars.origin = origin;

    player = new YT.Player("work-0-yt-host", {
      width: "100%",
      height: "100%",
      videoId: YT_ID,
      playerVars: vars,
      events: {
        onReady: function () {
          section.removeAttribute("data-yt-error");
          try {
            player.mute();
            player.playVideo();
          } catch (e) {
            /* ignore */
          }
          if (!showControls) startFourLoop();
        },
        onError: function () {
          section.setAttribute("data-yt-error", "1");
        },
      },
    });
  }

  function syncPlayerMode() {
    if (!apiReady) return;
    if (getState() === "video") {
      buildPlayer(true);
    } else {
      buildPlayer(false);
    }
  }

  function onApiReady() {
    apiReady = true;
    syncPlayerMode();
  }

  var prevReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (typeof prevReady === "function") prevReady();
    onApiReady();
  };

  /* If script loaded after API already fired */
  if (typeof YT !== "undefined" && YT.Player) {
    onApiReady();
  }

  /* ——— Scroll: enter animation ——— */
  var entered = false;
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio >= 0.28) {
          if (!entered) {
            entered = true;
            section.classList.add("work-0--entered");
          }
        }
      });
    },
    { threshold: [0, 0.28, 0.5] }
  );
  io.observe(section);

  /* ——— Intro → detail: click page (not header / links) ——— */
  section.addEventListener(
    "click",
    function (e) {
      var s = getState();
      if (s === "intro") {
        if (e.target.closest(".work-0__header, .work-0__header a, .work-0__menu, a[href], button")) return;
        e.preventDefault();
        setState("detail");
        return;
      }
      if (e.target.closest(".js-work-0-video-hit")) return;
    },
    true
  );

  var videoHit = section.querySelector(".js-work-0-video-hit");
  if (videoHit) {
    videoHit.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (getState() === "detail") {
        setState("video");
      }
    });
  }

  refreshVideoHitLabel();

  section.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (getState() !== "intro") return;
    if (e.target.closest(".work-0__header, a, button")) return;
    e.preventDefault();
    setState("detail");
  });

  var closeBtn = section.querySelector(".js-work-0-close-video");
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setState("detail");
    });
  }

  /* Prevent stage logic when using All Work */
  var allWork = section.querySelector(".work-0__all-work");
  if (allWork) {
    allWork.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  /* Smooth in-page anchor */
  document.querySelectorAll('a[href="#work_0"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
