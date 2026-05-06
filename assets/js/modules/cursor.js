// Custom cursor: a precise dot + a lagging ring that reacts to interactive
// elements, plus a magnetic pull on buttons. Desktop / fine-pointer only.
(function () {
  var fine = window.matchMedia('(pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine) return;

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-custom-cursor');

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var rx = mx, ry = my;
  var visible = false;

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!visible) { visible = true; dot.style.opacity = ring.style.opacity = '1'; }
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
  });
  window.addEventListener('mouseleave', function () { visible = false; dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });

  var INTERACTIVE = 'a, button, input, textarea, [data-magnetic], .chip, .post-card, [data-graph-canvas]';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(INTERACTIVE)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(INTERACTIVE)) ring.classList.remove('is-hover');
  });

  function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    requestAnimationFrame(loop);
  }
  loop();

  // ── Magnetic buttons ────────────────────────────────────────
  if (!reduce) {
    var magnets = document.querySelectorAll('.btn, .icon-btn, [data-magnetic]');
    magnets.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }
})();
