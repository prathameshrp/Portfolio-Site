// Search: command-palette overlay + on-page blog filtering
(function () {
  var index = [];
  var raw = document.getElementById('search-index');
  if (raw) { try { index = JSON.parse(raw.textContent); } catch (e) {} }

  // ── Overlay palette ─────────────────────────────────────────
  var overlay = document.querySelector('[data-search-overlay]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');

  function openSearch() {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { input && input.focus(); }, 30);
    render('');
  }
  function closeSearch() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (input) input.value = '';
  }

  function score(item, q) {
    var hay = (item.title + ' ' + (item.tags || []).join(' ') + ' ' + item.excerpt).toLowerCase();
    return hay.indexOf(q) > -1;
  }
  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, i)) + '<mark>' + escapeHtml(text.slice(i, i + q.length)) + '</mark>' + escapeHtml(text.slice(i + q.length));
  }
  function render(q) {
    if (!results) return;
    q = q.trim().toLowerCase();
    var matches = q ? index.filter(function (it) { return score(it, q); }) : index.slice(0, 8);
    results.innerHTML = matches.map(function (it) {
      return '<li><a class="search-result" href="' + it.url + '">' +
        '<div class="search-result__title">' + highlight(it.title, q) + '</div>' +
        '<div class="search-result__meta">' + it.date + ' &middot; ' + (it.tags || []).join(', ') + '</div>' +
        '</a></li>';
    }).join('');
    if (empty) empty.hidden = matches.length !== 0;
  }

  document.querySelectorAll('[data-search-open]').forEach(function (b) { b.addEventListener('click', openSearch); });
  document.querySelectorAll('[data-search-close]').forEach(function (b) { b.addEventListener('click', closeSearch); });
  if (input) input.addEventListener('input', function () { render(input.value); });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay && overlay.hidden ? openSearch() : closeSearch(); }
    if (e.key === 'Escape') closeSearch();
    if (e.key === '/' && overlay && overlay.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  // ── Blog page filtering ─────────────────────────────────────
  var blogSearch = document.querySelector('[data-blog-search]');
  var filters = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('[data-blog-grid] [data-post-card]');
  var emptyState = document.querySelector('[data-blog-empty]');

  if (cards.length) {
    var activeTag = 'all';
    function apply() {
      var q = blogSearch ? blogSearch.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var excerpt = (card.getAttribute('data-excerpt') || '').toLowerCase();
        var matchQ = !q || title.indexOf(q) > -1 || tags.indexOf(q) > -1 || excerpt.indexOf(q) > -1;
        var matchTag = activeTag === 'all' || tags.indexOf(activeTag) > -1;
        var show = matchQ && matchTag;
        card.classList.toggle('is-hidden', !show);
        if (show) shown++;
      });
      if (emptyState) emptyState.classList.toggle('is-visible', shown === 0);
    }
    if (blogSearch) blogSearch.addEventListener('input', apply);
    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        filters.forEach(function (x) { x.classList.remove('is-active'); });
        f.classList.add('is-active');
        activeTag = (f.getAttribute('data-filter') || 'all').toLowerCase();
        apply();
      });
    });
  }

  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
})();
