// ─────────────────────────────────────────────────────────────
// Cursor Runic Trail Module
// Spawns floating runic symbols (ᚠ,ᚢ,ᚦ,ᚨ,ᚱ,✦,◇,✧,·) in cyan, purple, and orange
// colors at the mouse pointer, which float upwards and fade away over 1.2 seconds.
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // Only load on screens wider than mobile (768px)
  if (window.innerWidth < 768) return;

  // Rune overlay container — appended to <html> to prevent overflow clipping
  var runeOverlay = document.createElement('div');
  runeOverlay.id = 'rune-overlay';
  runeOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:9999;overflow:visible;';
  document.documentElement.appendChild(runeOverlay);

  // Styling rules for the runic glyphs
  var style = document.createElement('style');
  style.textContent = [
    '.rune-glyph {',
    '  position: fixed;',
    '  pointer-events: none;',
    '  font-family: monospace;',
    '  line-height: 1;',
    '  transform: translate(-50%, -50%);',
    '  z-index: 9999;',
    '  text-shadow: 0 0 4px currentColor;',
    '  will-change: transform, opacity;',
    '  animation: rune-fade 1.2s cubic-bezier(0.2, 0, 0.8, 1) forwards;',
    '}',
    '@keyframes rune-fade {',
    '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }',
    '  15%  { opacity: 0.45; transform: translate(-50%, -60%) scale(1); }',
    '  100% { opacity: 0; transform: translate(-50%, -130px) scale(0.5); }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  var RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','✦','◇','✧','·'];
  var RUNE_COLORS = ['#a78bfa', '#22d3ee', '#fb923c']; // purple, cyan, orange
  var lastRuneTime = 0;

  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastRuneTime < 50) return; // throttle spawns
    lastRuneTime = now;

    var r = document.createElement('span');
    r.className = 'rune-glyph';
    r.style.left     = e.clientX + 'px';
    r.style.top      = e.clientY + 'px';
    r.style.color    = RUNE_COLORS[Math.floor(Math.random() * RUNE_COLORS.length)];
    r.style.fontSize = (8 + Math.random() * 5) + 'px';
    r.textContent    = RUNES[Math.floor(Math.random() * RUNES.length)];
    runeOverlay.appendChild(r);

    // Remove element after animation completes
    setTimeout(function () {
      if (r.parentNode) {
        r.parentNode.removeChild(r);
      }
    }, 1250);
  });
})();
