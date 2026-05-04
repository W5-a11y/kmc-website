(function () {
  var HTML = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORAGE_KEY = "kmc-opening-played";

  function finishOpening() {
    HTML.classList.remove("opening-active");
    HTML.classList.add("opening-finished");
    var root = document.getElementById("opening-lottie-root");
    if (root) root.style.display = "none";
    window.dispatchEvent(new CustomEvent("kmc-opening-done"));
  }

  function skipOpening() {
    HTML.classList.remove("has-opening");
    finishOpening();
  }

  var alreadyPlayed = false;
  try {
    /* Force replay: index.html?replay-opening=1 (or hard refresh clears tab session on some browsers only — use this to test v2) */
    if (/\breplay-opening=1\b/.test(location.search)) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {}

  if (alreadyPlayed) {
    skipOpening();
    return;
  }

  var root = document.getElementById("opening-lottie-root");
  var view = document.getElementById("opening-lottie-view");

  if (!root || !view || reduce) {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    finishOpening();
    return;
  }

  if (typeof lottie === "undefined") {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    finishOpening();
    return;
  }

  HTML.classList.add("opening-active");

  var fallbackMs = 9000;
  var t = window.setTimeout(clearAndFinish, fallbackMs);
  var finished = false;

  function clearAndFinish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(t);
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    finishOpening();
  }

  try {
    var anim = lottie.loadAnimation({
      container: view,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "assets/opening-xl.json",
    });
    anim.addEventListener("complete", clearAndFinish);
    anim.addEventListener("data_failed", clearAndFinish);
  } catch (e) {
    clearAndFinish();
  }
})();
