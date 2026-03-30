(function () {
  const videoRoot = document.querySelector(".work-video");
  if (!videoRoot) return;

  const ytId = videoRoot.getAttribute("data-youtube-id");
  if (!ytId) return;

  const playBtn = videoRoot.querySelector(".work-video__play");

  function mountIframe() {
    if (videoRoot.querySelector("iframe.work-video__yt")) return;
    const iframe = document.createElement("iframe");
    iframe.className = "work-video__yt";
    iframe.setAttribute("title", "Project video");
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );
    iframe.setAttribute("allowfullscreen", "");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(ytId) + "?autoplay=1&rel=0";
    videoRoot.appendChild(iframe);
    videoRoot.classList.add("is-playing");
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      mountIframe();
    });
  }
})();
