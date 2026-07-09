// ─────────────────────────────────────────────────────────────
// Resume Journey — scroll animations, counters, spine, keyboard
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chapters = Array.from(document.querySelectorAll('.rj-chapter'));
  var nodes    = Array.from(document.querySelectorAll('.rj-node'));
  var spineFill = document.getElementById('rjSpineFill');
  var activeChapter = 0;

  if (!chapters.length) return;

  // ── If reduced motion: reveal everything immediately ─────────
  if (reduce) {
    document.querySelectorAll('.rj-animate').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ── Scroll-progress spine fill ───────────────────────────────
  function updateSpine() {
    var scrollTop  = window.scrollY;
    var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    if (spineFill) spineFill.style.height = pct + '%';
  }

  // ── Chapter IntersectionObserver ─────────────────────────────
  var chapterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var idx = parseInt(entry.target.getAttribute('data-chapter'), 10);

      // Activate spine node
      nodes.forEach(function (n) { n.classList.remove('is-active'); });
      if (nodes[idx]) nodes[idx].classList.add('is-active');
      activeChapter = idx;

      // Trigger child animations
      if (!reduce) {
        entry.target.querySelectorAll('.rj-animate').forEach(function (el) {
          el.classList.add('is-visible');
        });
      }

      // Trigger counters inside this chapter
      entry.target.querySelectorAll('[data-count-to]').forEach(countUp);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

  chapters.forEach(function (ch) { chapterIO.observe(ch); });

  // ── countUp animation ─────────────────────────────────────────
  var counted = new WeakSet();
  function countUp(el) {
    if (counted.has(el)) return;
    counted.add(el);

    var target   = parseFloat(el.getAttribute('data-count-to'));
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    var suffix   = el.getAttribute('data-count-suffix') || '';
    var duration = 1400;
    var start    = performance.now();

    function frame(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = (target * eased).toFixed(decimals);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ── Spine node click — smooth scroll to chapter ───────────────
  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var idx = parseInt(node.getAttribute('data-chapter'), 10);
      var target = document.getElementById('rjChapter' + idx);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Keyboard chapter navigation (↓ / ↑) ─────────────────────
  document.addEventListener('keydown', function (e) {
    if (!document.getElementById('resumeJourney')) return;
    // Only on the resume page (it's on the page if the element exists)
    var next = -1;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      next = Math.min(activeChapter + 1, chapters.length - 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      next = Math.max(activeChapter - 1, 0);
    }
    if (next >= 0) {
      var target = document.getElementById('rjChapter' + next);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ── Scroll listener ───────────────────────────────────────────
  window.addEventListener('scroll', updateSpine, { passive: true });
  updateSpine();

})();
