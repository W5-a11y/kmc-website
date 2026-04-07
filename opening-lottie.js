(function () {
  var HTML = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function finishOpening() {
    HTML.classList.remove("opening-active");
    HTML.classList.add("opening-finished");
    window.dispatchEvent(new CustomEvent("kmc-opening-done"));
  }

  var root = document.getElementById("opening-lottie-root");
  var view = document.getElementById("opening-lottie-view");

  if (!root || !view || reduce) {
    finishOpening();
    return;
  }

  if (typeof lottie === "undefined") {
    finishOpening();
    return;
  }

  HTML.classList.add("opening-active");

  var fallbackMs = 9000;
  var t = window.setTimeout(finishOpening, fallbackMs);
  var finished = false;

  function clearAndFinish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(t);
    finishOpening();
  }

  try {
    var anim = lottie.loadAnimation({
      container: view,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "assets/v2.json",
    });
    anim.addEventListener("complete", clearAndFinish);
    anim.addEventListener("data_failed", clearAndFinish);
  } catch (e) {
    clearAndFinish();
  }
})();
