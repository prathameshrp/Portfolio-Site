// ─────────────────────────────────────────────────────────────
// Witch Hat Atelier — Ambient Magic Background
// • Faint rotating sigil circles in viewport margins (reactive to cursor)
// • Floating ink-drop particles that drift upward
// • Cursor rune trail: leaves fading glyphs as the mouse moves
// • Page-edge ambient glow pulses matching the site accent colors
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  if (window.innerWidth < 600) return; // skip mobile

  // ── 1. Inject stylesheet ──────────────────────────────────────
  var css = [
    '#sigil-bg { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }',

    // Sigil circles
    '.bg-sigil { position:absolute; pointer-events:none; opacity:0.03;',
    '  transition: opacity 1.8s cubic-bezier(.16,1,.3,1); will-change: transform; }',
    '.bg-sigil svg { width:100%; height:100%; fill:none; overflow:visible; }',
    '.bg-sigil.lit { opacity:0.13; }',

    // Floating ink-drop particles
    '.ink-drop { position:absolute; pointer-events:none; font-family:monospace;',
    '  font-size:11px; color:rgba(167,139,250,0.5); opacity:0;',
    '  animation: ink-rise var(--d,6s) ease-in forwards; }',
    '@keyframes ink-rise {',
    '  0%   { opacity:0;    transform: translateY(0)   scale(0.7) rotate(0deg); }',
    '  15%  { opacity:0.7; }',
    '  80%  { opacity:0.3; }',
    '  100% { opacity:0;    transform: translateY(-120px) scale(1) rotate(var(--r,25deg)); }',
    '}',

    // Cursor rune glyphs — pointer-events:none critical so they don't block clicks
    '.rune-glyph { position:fixed; pointer-events:none; font-family:monospace; font-size:13px;',
    '  line-height:1; transform:translate(-50%,-50%); z-index:9998;',
    '  animation: rune-fade 1.2s ease forwards; }',
    '@keyframes rune-fade {',
    '  0%   { opacity:0.9; transform:translate(-50%,-50%) scale(1); }',
    '  60%  { opacity:0.4; transform:translate(-50%,-150%) scale(0.8); }',
    '  100% { opacity:0;   transform:translate(-50%,-220%) scale(0.5); }',
    '}',

    // Subtle radial corner glows (CSS-only, no JS)
    '.corner-glow { position:fixed; pointer-events:none; border-radius:50%;',
    '  animation: corner-pulse 8s ease-in-out infinite; }',
    '.corner-glow--tl { top:-200px; left:-200px; width:500px; height:500px;',
    '  background:radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%); }',
    '.corner-glow--br { bottom:-200px; right:-200px; width:600px; height:600px;',
    '  background:radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 70%); }',
    '.corner-glow--tr { top:-150px; right:-150px; width:400px; height:400px;',
    '  background:radial-gradient(circle, rgba(251,146,60,0.025) 0%, transparent 70%);',
    '  animation-delay:-3s; }',
    '@keyframes corner-pulse {',
    '  0%,100% { transform:scale(1); opacity:1; }',
    '  50%      { transform:scale(1.15); opacity:0.6; }',
    '}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 2. Create main container ──────────────────────────────────
  var bg = document.createElement('div');
  bg.id = 'sigil-bg';
  document.body.appendChild(bg);

  // Corner ambient glows
  ['tl','br','tr'].forEach(function(pos) {
    var g = document.createElement('div');
    g.className = 'corner-glow corner-glow--' + pos;
    bg.appendChild(g);
  });

  // ── 3. Sigil SVG definitions ──────────────────────────────────
  // Three types inspired by Witch Hat Atelier spells
  var SIGIL_SVGS = [
    // Wind — flowing spiral arrows
    '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="100" r="78" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 5"/><circle cx="100" cy="100" r="55" stroke="currentColor" stroke-width="1"/><path d="M100,20 C140,20 170,60 150,100 C130,140 80,140 60,100 C40,60 70,20 100,20" stroke="currentColor" stroke-width="0.9" stroke-dasharray="4 3"/><path d="M100,55 Q120,75 100,95 T100,130" stroke="currentColor" stroke-width="1.1"/><polygon points="100,22 104,33 96,33" fill="currentColor" opacity="0.5"/><text x="100" y="106" text-anchor="middle" font-size="7" font-family="monospace" letter-spacing="2" fill="currentColor" opacity="0.6">ᚠ ᚢ ᚦ ᚨ</text><text x="100" y="122" text-anchor="middle" font-size="6" font-family="monospace" fill="currentColor" opacity="0.5">· GONDRY ·</text></svg>',
    // Light — starburst polygon
    '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" stroke="currentColor" stroke-width="1.4"/><circle cx="100" cy="100" r="84" stroke="currentColor" stroke-width="0.7"/><circle cx="100" cy="100" r="62" stroke="currentColor" stroke-width="1" stroke-dasharray="8 4"/><polygon points="100,18 124,76 182,76 135,110 153,167 100,132 47,167 65,110 18,76 76,76" stroke="currentColor" stroke-width="1.2"/><polygon points="100,38 115,76 160,76 123,101 137,143 100,117 63,143 77,101 40,76 85,76" stroke="currentColor" stroke-width="0.6" opacity="0.7"/><circle cx="100" cy="100" r="18" stroke="currentColor" stroke-width="1.5"/><circle cx="100" cy="100" r="5" fill="currentColor" opacity="0.25"/></svg>',
    // Fire — triangular cage
    '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" stroke="currentColor" stroke-width="1.3"/><circle cx="100" cy="100" r="78" stroke="currentColor" stroke-width="1.6"/><circle cx="100" cy="100" r="74" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3"/><polygon points="100,24 168,138 32,138" stroke="currentColor" stroke-width="1.5"/><polygon points="100,176 168,62 32,62" stroke="currentColor" stroke-width="0.7" stroke-dasharray="4 4"/><circle cx="100" cy="100" r="30" stroke="currentColor" stroke-width="1"/><path d="M100,80 Q90,93 100,105 T100,120" stroke="currentColor" stroke-width="1.6"/><text x="100" y="104" text-anchor="middle" font-size="6" font-family="monospace" fill="currentColor" opacity="0.55">✦ IGNIS ✦</text></svg>',
    // Earth — square lattice within circle
    '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="0.6" stroke-dasharray="5 6"/><rect x="36" y="36" width="128" height="128" stroke="currentColor" stroke-width="1.1" rx="4"/><line x1="36" y1="100" x2="164" y2="100" stroke="currentColor" stroke-width="0.7"/><line x1="100" y1="36" x2="100" y2="164" stroke="currentColor" stroke-width="0.7"/><circle cx="100" cy="100" r="20" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="100" r="8" stroke="currentColor" stroke-width="0.7"/><text x="100" y="104" text-anchor="middle" font-size="5.5" font-family="monospace" fill="currentColor" opacity="0.5">ᚱ ᚲ ᚷ ᚹ</text></svg>',
  ];

  var COLORS = [
    { css: 'rgba(34,211,238,1)',  hex: '#22d3ee' },
    { css: 'rgba(167,139,250,1)', hex: '#a78bfa' },
    { css: 'rgba(251,146,60,1)',  hex: '#fb923c' },
    { css: 'rgba(167,139,250,1)', hex: '#a78bfa' },
  ];

  // Positions: { x,y in vw/vh, size, type, colorIdx, speed(deg/s) }
  var SIGIL_DEFS = [
    { x:2,   y:6,  s:280, t:0, c:0, spd: 0.18 },
    { x:78,  y:12, s:320, t:1, c:1, spd:-0.12 },
    { x:4,   y:65, s:240, t:2, c:2, spd:-0.09 },
    { x:80,  y:70, s:300, t:3, c:3, spd: 0.14 },
  ];

  var sigils = SIGIL_DEFS.map(function(def) {
    var d = document.createElement('div');
    d.className = 'bg-sigil';
    d.style.width  = def.s + 'px';
    d.style.height = def.s + 'px';
    d.style.left   = def.x + 'vw';
    d.style.top    = def.y + 'vh';
    d.style.color  = COLORS[def.c].hex;
    d.innerHTML    = SIGIL_SVGS[def.t];
    bg.appendChild(d);
    return { el:d, angle:Math.random()*360, spd:def.spd, lit:false, cx:0, cy:0 };
  });

  // ── 4. Ink-drop particles ─────────────────────────────────────
  var INK_GLYPHS = ['✦','✧','◇','◆','ᚠ','ᚢ','ᚦ','ᚨ','✶','★','·','∘'];
  var INK_COLORS = [
    'rgba(167,139,250,0.55)','rgba(34,211,238,0.45)','rgba(251,146,60,0.4)'
  ];

  function spawnInkDrop() {
    var glyph = document.createElement('span');
    glyph.className = 'ink-drop';
    var dur = (5 + Math.random() * 5).toFixed(1) + 's';
    var rot = (-30 + Math.random() * 60).toFixed(0) + 'deg';
    glyph.style.setProperty('--d', dur);
    glyph.style.setProperty('--r', rot);
    glyph.style.left   = (5 + Math.random() * 90) + 'vw';
    glyph.style.bottom = (Math.random() * 30) + 'vh';
    glyph.style.color  = INK_COLORS[Math.floor(Math.random() * INK_COLORS.length)];
    glyph.style.fontSize = (9 + Math.random() * 8) + 'px';
    glyph.textContent = INK_GLYPHS[Math.floor(Math.random() * INK_GLYPHS.length)];
    bg.appendChild(glyph);
    setTimeout(function() { if (glyph.parentNode) glyph.parentNode.removeChild(glyph); }, parseFloat(dur) * 1000 + 200);
  }
  // Spawn a drop every 1.8s
  setInterval(spawnInkDrop, 1800);

  // ── 5. Cursor rune trail ──────────────────────────────────────
  var RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','✦','◇','✧','·'];
  var RUNE_COLORS = [
    'rgba(167,139,250,0.75)','rgba(34,211,238,0.65)','rgba(251,146,60,0.6)'
  ];
  var lastRuneTime = 0;

  document.addEventListener('mousemove', function(e) {
    var now = Date.now();
    if (now - lastRuneTime < 120) return; // throttle to ~8 per second
    lastRuneTime = now;

    var r = document.createElement('span');
    r.className = 'rune-glyph';
    r.style.left  = e.clientX + 'px';
    r.style.top   = e.clientY + 'px';
    r.style.color = RUNE_COLORS[Math.floor(Math.random() * RUNE_COLORS.length)];
    r.style.fontSize = (9 + Math.random() * 6) + 'px';
    r.textContent = RUNES[Math.floor(Math.random() * RUNES.length)];
    document.body.appendChild(r);

    setTimeout(function() { if (r.parentNode) r.parentNode.removeChild(r); }, 1300);
  });

  // ── 6. Update sigil positions & reactivity ────────────────────
  var mx = -9999, my = -9999;
  document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });

  // Pre-calculate sigil centers
  function refreshCenters() {
    sigils.forEach(function(s) {
      var r = s.el.getBoundingClientRect();
      s.cx = r.left + r.width  / 2;
      s.cy = r.top  + r.height / 2;
    });
  }
  refreshCenters();
  window.addEventListener('scroll', refreshCenters);
  window.addEventListener('resize', refreshCenters);

  var lastTime = 0;
  function frame(ts) {
    var dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.08) : 0.016;
    lastTime = ts;

    sigils.forEach(function(s) {
      s.angle += s.spd * dt * (s.lit ? 3 : 1); // faster when lit
      var dist = Math.hypot(mx - s.cx, my - s.cy);
      var wasLit = s.lit;
      s.lit = dist < 380;
      if (s.lit !== wasLit) s.el.classList.toggle('lit', s.lit);
      // Apply rotation + subtle scale
      var scale = s.lit ? 1.06 : 0.96;
      s.el.style.transform = 'rotate(' + s.angle.toFixed(2) + 'deg) scale(' + scale + ')';
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})();
