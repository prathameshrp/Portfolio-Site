// ─────────────────────────────────────────────────────────────
// Magic Sigil Background — Witch Hat Atelier theme
// Adds faint, glowing, reactive spell circles across the site
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // Only load on screens wider than mobile (768px)
  if (window.innerWidth < 768) return;

  var container = document.createElement('div');
  container.id = 'sigil-bg';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1';
  container.style.overflow = 'hidden';
  container.style.opacity = '0.7'; // overall container master opacity
  document.body.appendChild(container);

  // Faint styles for background sigils
  var style = document.createElement('style');
  style.textContent = [
    '.bg-sigil {',
    '  position: absolute;',
    '  width: 320px;',
    '  height: 320px;',
    '  opacity: 0.02;',
    '  transition: opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);',
    '  transform: rotate(0deg) scale(0.95);',
    '  will-change: transform, opacity;',
    '}',
    '.bg-sigil svg {',
    '  width: 100%;',
    '  height: 100%;',
    '  fill: none;',
    '}',
    '.bg-sigil.reactive {',
    '  opacity: 0.12;',
    '  transform: scale(1.05);',
    '}',
    // Glow effect matching colors
    '.sigil-cyan { stroke: #22d3ee; }',
    '.sigil-purple { stroke: #a78bfa; }',
    '.sigil-orange { stroke: #fb923c; }',
    // Cursor rune glyphs
    '.rune-glyph { position:fixed; pointer-events:none; font-family:monospace; font-size:13px;',
    '  line-height:1; transform:translate(-50%,-50%); z-index:9998;',
    '  animation: rune-fade 1.2s ease forwards; }',
    '@keyframes rune-fade {',
    '  0%   { opacity:0.9; transform:translate(-50%,-50%) scale(1); }',
    '  60%  { opacity:0.4; transform:translate(-50%,-150%) scale(0.8); }',
    '  100% { opacity:0;   transform:translate(-50%,-220%) scale(0.5); }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // SVG templates for 3 spell formulas from Witch Hat Atelier
  var SIGILS = [
    // 1. Wind Spell (Gondry) - Spiral-like flow runes
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' +
    '  <circle cx="100" cy="100" r="95" stroke-width="1"/>' +
    '  <circle cx="100" cy="100" r="90" stroke-width="0.8" stroke-dasharray="3 4"/>' +
    '  <circle cx="100" cy="100" r="75" stroke-width="1.2"/>' +
    '  <circle cx="100" cy="100" r="45" stroke-width="0.7"/>' +
    '  <!-- Arrow vanes (wind direction runes) -->' +
    '  <path d="M100,5 L100,195 M5,100 L195,100 M33,33 L167,167 M33,167 L167,33" stroke-width="0.5" stroke-dasharray="6 8"/>' +
    '  <path d="M100,25 Q130,50 100,75 T100,125" stroke-width="1"/>' +
    '  <path d="M100,175 Q70,150 100,125 T100,75" stroke-width="1"/>' +
    '  <polygon points="100,25 104,35 96,35" fill="context-stroke"/>' +
    '  <polygon points="100,175 104,165 96,165" fill="context-stroke"/>' +
    '  <!-- Rune letters around ring -->' +
    '  <text x="100" y="86" text-anchor="middle" font-size="6" font-family="monospace" letter-spacing="1">ᚠ ᚢ ᚦ ᚨ</text>' +
    '  <text x="100" y="122" text-anchor="middle" font-size="6" font-family="monospace" letter-spacing="1">ᚱ ᚲ ᚷ ᚹ</text>' +
    '</svg>',

    // 2. Light Spell (Fulgur) - Geometric stars, ray runes
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' +
    '  <circle cx="100" cy="100" r="96" stroke-width="1.4"/>' +
    '  <circle cx="100" cy="100" r="82" stroke-width="0.8"/>' +
    '  <circle cx="100" cy="100" r="60" stroke-width="1" stroke-dasharray="8 4"/>' +
    '  <!-- Multi-point star -->' +
    '  <polygon points="100,18 124,76 182,76 135,110 153,167 100,132 47,167 65,110 18,76 76,76" stroke-width="1.2"/>' +
    '  <polygon points="100,35 115,76 160,76 123,101 137,143 100,117 63,143 77,101 40,76 85,76" stroke-width="0.7" opacity="0.7"/>' +
    '  <circle cx="100" cy="100" r="18" stroke-width="1.5"/>' +
    '  <circle cx="100" cy="100" r="6" fill="context-stroke" opacity="0.3"/>' +
    '</svg>',

    // 3. Fire/Heat Spell - Triangles, heavy inner borders
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' +
    '  <circle cx="100" cy="100" r="94" stroke-width="1.2"/>' +
    '  <circle cx="100" cy="100" r="78" stroke-width="1.5"/>' +
    '  <circle cx="100" cy="100" r="74" stroke-width="0.6" stroke-dasharray="2 3"/>' +
    '  <!-- Triangular spell cage -->' +
    '  <polygon points="100,24 166,138 34,138" stroke-width="1.4"/>' +
    '  <polygon points="100,176 166,62 34,62" stroke-width="0.7" stroke-dasharray="4 4"/>' +
    '  <circle cx="100" cy="100" r="32" stroke-width="1"/>' +
    '  <!-- Flame core marks -->' +
    '  <path d="M100,82 Q90,92 100,102 T100,118" stroke-width="1.5"/>' +
    '  <path d="M92,90 Q100,100 92,110" stroke-width="0.8"/>' +
    '  <path d="M108,90 Q100,100 108,110" stroke-width="0.8"/>' +
    '</svg>'
  ];

  var COLORS = ['sigil-cyan', 'sigil-purple', 'sigil-orange'];

  // Sigils to generate across the screen margins
  var sigilData = [
    { x: 3,   y: 8,   type: 0, color: 0, speed: 0.15 },  // Top left
    { x: 80,  y: 15,  type: 1, color: 1, speed: -0.10 }, // Top right
    { x: 5,   y: 65,  type: 2, color: 2, speed: -0.08 }, // Middle left
    { x: 82,  y: 72,  type: 0, color: 1, speed: 0.12 },  // Bottom right
  ];

  var sigilEls = [];

  sigilData.forEach(function (data) {
    var div = document.createElement('div');
    div.className = 'bg-sigil ' + COLORS[data.color];
    div.style.left = data.x + 'vw';
    div.style.top = data.y + 'vh';
    div.innerHTML = SIGILS[data.type];
    container.appendChild(div);

    sigilEls.push({
      el: div,
      xPercent: data.x,
      yPercent: data.y,
      angle: Math.random() * 360,
      targetAngle: 0,
      speed: data.speed,
      active: false
    });
  });

  // Track mouse coordinates to activate nearby sigils
  document.addEventListener('mousemove', function (e) {
    var mx = e.clientX;
    var my = e.clientY;

    sigilEls.forEach(function (sigil) {
      // Calculate absolute position on page
      var r = sigil.el.getBoundingClientRect();
      var sx = r.left + r.width / 2;
      var sy = r.top + r.height / 2;

      var dist = Math.hypot(mx - sx, my - sy);

      // Reactive range (approx 350px)
      if (dist < 350) {
        if (!sigil.active) {
          sigil.active = true;
          sigil.el.classList.add('reactive');
        }
        // Slightly rotate away/towards the mouse position
        var angleOffset = (dist / 350) * 15;
        sigil.targetAngle = sigil.angle + angleOffset;
      } else {
        if (sigil.active) {
          sigil.active = false;
          sigil.el.classList.remove('reactive');
        }
      }
    });
  });

  // Ambient spin loop
  var lastTime = 0;
  function update(time) {
    var dt = lastTime ? (time - lastTime) / 1000 : 0.016;
    lastTime = time;

    sigilEls.forEach(function (sigil) {
      // Rotate constantly at ambient speed
      sigil.angle += sigil.speed * 18 * dt;

      // Settle angle towards target if active
      var currentAngle = sigil.active ? sigil.targetAngle : sigil.angle;
      sigil.el.style.transform = 'rotate(' + currentAngle.toFixed(2) + 'deg) scale(' + (sigil.active ? 1.05 : 0.95) + ')';
    });

    requestAnimationFrame(update);
  }

  // ── Cursor rune trail ──────────────────────────────────────
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

  requestAnimationFrame(update);
})();
