// Navbar: scroll state, mobile menu, reading-progress bar
(function () {
  var navbar = document.querySelector('[data-navbar]');
  var burger = document.querySelector('[data-nav-toggle]');
  var mobile = document.querySelector('[data-nav-mobile]');
  var progress = document.querySelector('[data-reading-progress]');
  var postContent = document.querySelector('[data-post-content]');

  if (burger && mobile) {
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      if (open) { mobile.hidden = false; } else { mobile.hidden = true; }
    });
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobile.hidden = true;
      });
    });
  }

  function onScroll() {
    if (navbar) navbar.classList.toggle('is-scrolled', window.scrollY > 8);

    if (progress && postContent) {
      var rect = postContent.getBoundingClientRect();
      var total = rect.height - window.innerHeight + 200;
      var scrolled = Math.min(Math.max(-rect.top + 120, 0), total);
      var pct = total > 0 ? (scrolled / total) * 100 : 0;
      progress.style.width = pct + '%';
      progress.classList.toggle('is-active', pct > 0 && pct < 100);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
