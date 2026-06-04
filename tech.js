(function () {
  var btn = document.querySelector('.js-tech-back-top');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var top = document.getElementById('tech-top');
    if (top) {
      top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();
