// Navbar: scroll state, mobile menu, reading-progress bar
(function () {
  var navbar = document.querySelector('[data-navbar]');
  var burger = document.querySelector('[data-nav-toggle]');
  var mobile = document.querySelector('[data-nav-mobile]');
  var progress = document.querySelector('[data-reading-progress]');
  var postContent = document.querySelector('[data-post-content]');

  if (burger && mobile) {
    burger.addEventListener('click', function (e) {
      var rect = burger.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      mobile.style.setProperty('--click-x', x + 'px');
      mobile.style.setProperty('--click-y', y + 'px');

      var open = burger.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));

      if (open) {
        mobile.hidden = false;
        // Delay tiny bit to let hidden=false register, then add visual classes
        requestAnimationFrame(function () {
          mobile.classList.add('is-open');
        });
        
        // Trigger Chomper screen shake/flash explosion!
        document.body.classList.add('jinx-explosion-shake');
        setTimeout(function() {
          document.body.classList.remove('jinx-explosion-shake');
        }, 500);
      } else {
        mobile.classList.remove('is-open');
        // Wait for the transition to finish before hiding display
        setTimeout(function() {
          if (!burger.classList.contains('is-open')) {
            mobile.hidden = true;
          }
        }, 700);
      }
    });

    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobile.classList.remove('is-open');
        setTimeout(function() {
          mobile.hidden = true;
        }, 700);
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
