// Skeleton loaders: swap skeleton placeholders for real content, fade images in
(function () {
  // Swap skeleton grids -> real card grids
  document.querySelectorAll('[data-skeleton-grid]').forEach(function (grid) {
    var real = grid.querySelector('[data-skeleton-real]');
    if (!real) return;
    // small delay so the shimmer is perceptible even on fast loads
    setTimeout(function () {
      grid.querySelectorAll('.post-card--skeleton').forEach(function (s) { s.remove(); });
      real.hidden = false;
      // re-observe newly revealed cards
      real.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      initMedia(real);
    }, 450);
  });

  // For cards already in DOM (blog page), mark media loaded
  initMedia(document);

  function initMedia(scope) {
    scope.querySelectorAll('[data-post-card]').forEach(function (card) {
      var img = card.querySelector('.post-card__img');
      if (img) {
        if (img.complete) { card.classList.add('is-loaded'); }
        else { img.addEventListener('load', function () { card.classList.add('is-loaded'); }); img.addEventListener('error', function () { card.classList.add('is-loaded'); }); }
      } else {
        // gradient placeholder, no image to wait for
        setTimeout(function () { card.classList.add('is-loaded'); }, 150);
      }
    });
  }
})();
