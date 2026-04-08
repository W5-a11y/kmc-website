(function () {
  var section = document.getElementById("services");
  if (!section) return;

  var items = section.querySelectorAll(".svc__item");
  var images = section.querySelectorAll(".svc__img");
  var descs = section.querySelectorAll(".svc__desc");
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function activate(index) {
    items.forEach(function (item, i) {
      item.classList.toggle("is-active", i === index);
    });
    images.forEach(function (img, i) {
      img.classList.toggle("is-active", i === index);
    });
    descs.forEach(function (desc, i) {
      desc.classList.toggle("is-active", i === index);
    });
  }

  items.forEach(function (item, i) {
    item.addEventListener("mouseenter", function () {
      section.classList.add("has-hover");
      activate(i);
    });

    item.addEventListener("click", function (e) {
      e.preventDefault();
      activate(i);
    });
  });

  var list = section.querySelector(".svc__list");
  if (list) {
    list.addEventListener("mouseleave", function () {
      section.classList.remove("has-hover");
      activate(0);
    });
  }

  activate(0);

  if (reduce) {
    section.querySelectorAll(".svc__img, .svc__desc, .svc__item").forEach(
      function (el) {
        el.style.transition = "none";
      }
    );
  }
})();
