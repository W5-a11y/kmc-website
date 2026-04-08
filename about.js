(function () {
  var section = document.getElementById("about");
  if (!section) return;

  var items = section.querySelectorAll(".abt__item");
  var photos = section.querySelectorAll(".abt__photo-img");
  var quotes = section.querySelectorAll(".abt__quote");
  var bodies = section.querySelectorAll(".abt__body");
  var credits = section.querySelectorAll(".abt__credit");

  function activate(index) {
    items.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
    photos.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
    quotes.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
    bodies.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
    credits.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
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

  var list = section.querySelector(".abt__list");
  if (list) {
    list.addEventListener("mouseleave", function () {
      section.classList.remove("has-hover");
      activate(0);
    });
  }

  activate(0);
})();
