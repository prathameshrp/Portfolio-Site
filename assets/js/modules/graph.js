// Constellation: a dependency-free force-directed knowledge graph on canvas.
// Posts are stars, tags are hubs; posts sharing a tag cluster together.
(function () {
  var section = document.querySelector('[data-graph-section]');
  var canvas = document.querySelector('[data-graph-canvas]');
  var dataEl = document.getElementById('graph-data');
  if (!section || !canvas || !dataEl) return;

  var data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!data.nodes || !data.nodes.length) return;

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tooltip = document.querySelector('[data-graph-tooltip]');
  var hint = document.querySelector('[data-graph-hint]');

  // ── Palette (read from CSS vars so it follows the theme) ─────
  function cssVar(n, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return v || fb;
  }
  var COL = {};
  function refreshColors() {
    COL.accent = cssVar('--accent', '#7c5cff');
    COL.accent2 = cssVar('--accent-2', '#22d3ee');
    COL.accent3 = cssVar('--accent-3', '#f472b6');
    COL.text = cssVar('--text', '#ecedf6');
    COL.mute = cssVar('--text-mute', '#7a7d96');
    COL.line = document.documentElement.getAttribute('data-theme') === 'light'
      ? 'rgba(20,20,40,0.10)' : 'rgba(180,190,255,0.13)';
  }
  refreshColors();

  // ── Build node + link model ─────────────────────────────────
  var nodeById = {};
  var nodes = data.nodes.map(function (n) {
    var node = {
      id: n.id, type: n.type, label: n.label, url: n.url, date: n.date,
      tags: n.tags || [], weight: n.weight || 1,
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 400,
      vx: 0, vy: 0, neighbors: []
    };
    node.r = n.type === 'tag' ? 7 + Math.min(n.weight, 8) * 2.4 : 5 + Math.min(n.weight, 6) * 1.6;
    nodeById[n.id] = node;
    return node;
  });
  var links = (data.links || []).filter(function (l) {
    return nodeById[l.source] && nodeById[l.target];
  }).map(function (l) {
    var s = nodeById[l.source], t = nodeById[l.target];
    s.neighbors.push(t); t.neighbors.push(s);
    return { source: s, target: t };
  });

  // ── View transform ──────────────────────────────────────────
  var view = { scale: 1, x: 0, y: 0 };
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  function resize() {
    var rect = section.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function center() {
    view.x = W / 2; view.y = H * 0.5; view.scale = W < 700 ? 0.62 : 0.9;
  }

  // ── Physics ─────────────────────────────────────────────────
  var alpha = 1;
  var REPULSION = 5200, SPRING = 0.012, SPRING_LEN = 92, GRAVITY = 0.0016, DAMP = 0.86;

  function tick() {
    var i, j, a, b, dx, dy, d2, d, f;
    // repulsion (O(n^2) — fine for a personal blog's node count)
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = a.x - b.x; dy = a.y - b.y;
        d2 = dx * dx + dy * dy || 0.01;
        if (d2 > 90000) continue; // ignore far pairs
        d = Math.sqrt(d2);
        f = (REPULSION / d2) * alpha;
        var ux = dx / d, uy = dy / d;
        a.vx += ux * f; a.vy += uy * f;
        b.vx -= ux * f; b.vy -= uy * f;
      }
    }
    // springs
    for (i = 0; i < links.length; i++) {
      a = links[i].source; b = links[i].target;
      dx = b.x - a.x; dy = b.y - a.y;
      d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      f = (d - SPRING_LEN) * SPRING * alpha;
      var lx = (dx / d) * f, ly = (dy / d) * f;
      a.vx += lx; a.vy += ly; b.vx -= lx; b.vy -= ly;
    }
    // gravity to center + integrate
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      a.vx -= a.x * GRAVITY * alpha;
      a.vy -= a.y * GRAVITY * alpha;
      if (a === dragNode) continue;
      a.vx *= DAMP; a.vy *= DAMP;
      a.x += a.vx; a.y += a.vy;
    }
    alpha *= 0.994;
    if (alpha < 0.02) alpha = 0.02;
  }

  // ── Coordinate helpers ──────────────────────────────────────
  function toScreen(n) { return { x: n.x * view.scale + view.x, y: n.y * view.scale + view.y }; }
  function toWorld(px, py) { return { x: (px - view.x) / view.scale, y: (py - view.y) / view.scale }; }

  // ── Render ──────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // links
    ctx.lineWidth = 1;
    for (var i = 0; i < links.length; i++) {
      var s = toScreen(links[i].source), t = toScreen(links[i].target);
      var active = hoverNode && (links[i].source === hoverNode || links[i].target === hoverNode);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
      if (active) {
        ctx.strokeStyle = hexA(COL.accent2, 0.55);
        ctx.lineWidth = 1.4;
      } else {
        ctx.strokeStyle = COL.line;
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // nodes
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i], p = toScreen(n);
      var r = n.r * view.scale;
      var isHover = n === hoverNode;
      var isNeighbor = hoverNode && hoverNode.neighbors.indexOf(n) > -1;
      var dim = hoverNode && !isHover && !isNeighbor;

      var color = n.type === 'tag' ? COL.accent3 : COL.accent2;
      if (n.type === 'post') color = blend(COL.accent, COL.accent2, Math.min(n.weight / 4, 1));

      // glow
      var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * (isHover ? 5 : 3.2));
      glow.addColorStop(0, hexA(color, dim ? 0.10 : (isHover ? 0.5 : 0.28)));
      glow.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * (isHover ? 5 : 3.2), 0, Math.PI * 2); ctx.fill();

      // core
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = dim ? hexA(color, 0.35) : color;
      ctx.fill();
      if (isHover) { ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }

      // labels: tags always; posts when zoomed-in or hovered/neighbor
      var showLabel = n.type === 'tag' ? view.scale > 0.5 : (isHover || isNeighbor || view.scale > 1.45);
      if (showLabel && !dim) {
        ctx.font = (n.type === 'tag' ? '600 ' : '500 ') + Math.max(11, 12 * Math.min(view.scale, 1.3)) + 'px Inter, sans-serif';
        ctx.fillStyle = n.type === 'tag' ? hexA(COL.text, 0.9) : hexA(COL.text, isHover ? 1 : 0.8);
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        var label = n.type === 'tag' ? '#' + n.label : truncate(n.label, 26);
        ctx.fillText(label, p.x, p.y + r + 4);
      }
    }
  }

  // ── Loop ────────────────────────────────────────────────────
  var running = true;
  function frame() {
    if (!running) return;
    if (!paused) tick();
    draw();
    requestAnimationFrame(frame);
  }
  var paused = false;

  // ── Interaction ─────────────────────────────────────────────
  var hoverNode = null, dragNode = null, panning = false;
  var last = { x: 0, y: 0 }, downAt = null, moved = false;

  function pick(px, py) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var p = toScreen(nodes[i]);
      var dx = px - p.x, dy = py - p.y;
      var rr = nodes[i].r * view.scale + 8;
      var d = dx * dx + dy * dy;
      if (d < rr * rr && d < bestD) { bestD = d; best = nodes[i]; }
    }
    return best;
  }

  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  function onDown(e) {
    var p = pos(e);
    downAt = p; moved = false; last = p;
    var n = pick(p.x, p.y);
    if (n) { dragNode = n; } else { panning = true; }
    if (hint) hint.style.opacity = '0';
  }
  function onMove(e) {
    var p = pos(e);
    if (dragNode) {
      moved = true;
      var w = toWorld(p.x, p.y);
      dragNode.x = w.x; dragNode.y = w.y; dragNode.vx = 0; dragNode.vy = 0;
      alpha = Math.max(alpha, 0.5);
    } else if (panning) {
      moved = true;
      view.x += p.x - last.x; view.y += p.y - last.y; last = p;
    } else {
      var n = pick(p.x, p.y);
      setHover(n, p);
    }
  }
  function onUp(e) {
    if (dragNode && !moved) navigate(dragNode);
    else if (!moved && !dragNode) { /* background click */ }
    dragNode = null; panning = false;
  }

  function setHover(n, p) {
    if (n !== hoverNode) {
      hoverNode = n;
      canvas.style.cursor = n ? 'pointer' : 'grab';
    }
    if (n && tooltip) {
      tooltip.hidden = false;
      tooltip.innerHTML = n.type === 'tag'
        ? '<span class="tt-kind">topic</span><strong>#' + esc(n.label) + '</strong><span class="tt-meta">' + n.weight + ' post' + (n.weight !== 1 ? 's' : '') + '</span>'
        : '<span class="tt-kind">post · ' + esc(n.date || '') + '</span><strong>' + esc(n.label) + '</strong><span class="tt-meta">' + (n.tags || []).map(function (t) { return '#' + t; }).join(' ') + '</span><span class="tt-go">Click to read &rarr;</span>';
      var tx = (p ? p.x : toScreen(n).x) + 16;
      var ty = (p ? p.y : toScreen(n).y) + 16;
      var tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
      if (tx + tw > W) tx -= tw + 32;
      if (ty + th > H) ty -= th + 32;
      tooltip.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    } else if (tooltip) {
      tooltip.hidden = true;
    }
  }

  function navigate(n) {
    if (n.type === 'post' && n.url) {
      if (document.startViewTransition) document.startViewTransition(function () { window.location.href = n.url; });
      else window.location.href = n.url;
    } else if (n.type === 'tag') {
      focusCluster(n);
    }
  }

  function focusCluster(tag) {
    // gently pull the camera toward the tag hub and re-heat
    var p = tag;
    var target = toScreen(p);
    view.x += (W / 2 - target.x); view.y += (H / 2 - target.y);
    alpha = 0.6;
  }

  function zoomAt(px, py, factor) {
    var w = toWorld(px, py);
    view.scale = Math.max(0.3, Math.min(3, view.scale * factor));
    view.x = px - w.x * view.scale;
    view.y = py - w.y * view.scale;
  }

  canvas.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  canvas.addEventListener('mouseleave', function () { if (!panning && !dragNode) setHover(null); });
  canvas.addEventListener('touchstart', function (e) { onDown(e); }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { onMove(e); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', onUp);
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = pos(e);
    zoomAt(p.x, p.y, e.deltaY < 0 ? 1.12 : 0.89);
  }, { passive: false });

  var resetBtn = document.querySelector('[data-graph-reset]');
  if (resetBtn) resetBtn.addEventListener('click', function () { center(); alpha = 0.6; });

  // re-color on theme change
  new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('resize', function () { resize(); });

  // ── Helpers ─────────────────────────────────────────────────
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hexA(hex, a) {
    var c = parseHex(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  function parseHex(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (x) { return x + x; }).join('');
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  function blend(h1, h2, t) {
    var a = parseHex(h1), b = parseHex(h2);
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }

  // ── Boot ────────────────────────────────────────────────────
  resize(); center();
  if (reduce) {
    for (var k = 0; k < 320; k++) tick();   // settle synchronously
    paused = true; draw();
  } else {
    // pre-warm a little so it doesn't explode on first paint
    for (var w2 = 0; w2 < 60; w2++) tick();
    frame();
    // auto-pause sim when off-screen to save CPU
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        paused = !es[0].isIntersecting;
      }, { threshold: 0.01 }).observe(section);
    }
  }
})();
