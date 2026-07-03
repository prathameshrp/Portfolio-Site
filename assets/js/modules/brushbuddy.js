// ─────────────────────────────────────────────────────────────
// BrushBuddy — Witch Hat Atelier companion
// A fluffy sigil-marked creature that lives on the home page,
// wanders around, and reaches toward the user's cursor.
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // Only inject on pages that have the grimoire section (home page)
  if (!document.querySelector('.grimoire-section')) return;

  // ── Messages it shows when excited ────────────────────────────
  var MESSAGES = [
    'ᚠ hello! ᚠ',
    '✦ found you! ✦',
    '★ hi hi! ★',
    'ᚢ play? ᚢ',
    '✧ friend! ✧',
    '~ ehehe ~',
    '◇ reached! ◇',
  ];
  var msgIdx = 0;

  // ── Build the SVG creature ─────────────────────────────────────
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var el = document.createElement('div');
  el.id = 'brushbuddy';
  el.setAttribute('aria-hidden', 'true');

  el.innerHTML = [
    '<svg class="bb-svg" viewBox="-44 -44 88 88" xmlns="http://www.w3.org/2000/svg">',

    // ── Defs ──────────────────────────────────────────────────
    '<defs>',
    '<radialGradient id="bb-body-g" cx="38%" cy="30%">',
    '  <stop offset="0%"   stop-color="#f0e6ff"/>',
    '  <stop offset="55%"  stop-color="#c4a0ff"/>',
    '  <stop offset="100%" stop-color="#8a5df0"/>',
    '</radialGradient>',
    '<radialGradient id="bb-ear-g" cx="40%" cy="35%">',
    '  <stop offset="0%"   stop-color="#e0ccff"/>',
    '  <stop offset="100%" stop-color="#7c4de0"/>',
    '</radialGradient>',
    '<filter id="bb-glow" x="-60%" y="-60%" width="220%" height="220%">',
    '  <feGaussianBlur stdDeviation="3.5" result="b"/>',
    '  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '</filter>',
    '<filter id="bb-soft" x="-20%" y="-20%" width="140%" height="140%">',
    '  <feGaussianBlur stdDeviation="1.2"/>',
    '</filter>',
    '</defs>',

    // ── Aura glow halo behind body ────────────────────────────
    '<ellipse cx="0" cy="6" rx="28" ry="26" fill="rgba(167,139,250,0.08)" filter="url(#bb-soft)"/>',

    // ── Tiny witch hat ────────────────────────────────────────
    // Hat brim
    '<ellipse cx="0" cy="-32" rx="14" ry="3.5" fill="#140828" stroke="rgba(167,139,250,0.6)" stroke-width="0.7"/>',
    // Hat cone
    '<polygon points="0,-54 -10,-33 10,-33" fill="#140828" stroke="rgba(167,139,250,0.5)" stroke-width="0.7"/>',
    // Hat band star
    '<text x="0" y="-30" text-anchor="middle" font-size="5" fill="rgba(251,146,60,0.9)">✦</text>',

    // ── Fluffy ears (behind body) ─────────────────────────────
    '<ellipse cx="-20" cy="-16" rx="9" ry="11" fill="url(#bb-ear-g)" opacity="0.95"/>',
    '<ellipse cx="20" cy="-16" rx="9" ry="11" fill="url(#bb-ear-g)" opacity="0.95"/>',
    // Inner ear tint
    '<ellipse cx="-20" cy="-16" rx="5" ry="7" fill="rgba(255,190,240,0.35)"/>',
    '<ellipse cx="20" cy="-16" rx="5" ry="7" fill="rgba(255,190,240,0.35)"/>',
    // Ear tuft marks
    '<line x1="-20" y1="-21" x2="-20" y2="-24" stroke="rgba(220,180,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>',
    '<line x1="20" y1="-21" x2="20" y2="-24" stroke="rgba(220,180,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>',

    // ── Main fluffy body ──────────────────────────────────────
    // Extra fluff bumps around edge
    '<circle cx="-21" cy="6"  r="7"  fill="url(#bb-ear-g)" opacity="0.6"/>',
    '<circle cx="21"  cy="6"  r="7"  fill="url(#bb-ear-g)" opacity="0.6"/>',
    '<circle cx="-15" cy="20" r="6"  fill="url(#bb-ear-g)" opacity="0.5"/>',
    '<circle cx="15"  cy="20" r="6"  fill="url(#bb-ear-g)" opacity="0.5"/>',
    '<circle cx="0"   cy="24" r="6"  fill="url(#bb-ear-g)" opacity="0.45"/>',
    // Core body
    '<ellipse cx="0" cy="5" rx="20" ry="19" fill="url(#bb-body-g)" filter="url(#bb-glow)"/>',

    // ── Spinning sigil on belly ───────────────────────────────
    '<g class="bb-sigil-ring">',
    '  <circle cx="0" cy="9" r="10" fill="none" stroke="rgba(34,211,238,0.25)" stroke-width="0.9" stroke-dasharray="3 4"/>',
    '</g>',
    '<circle cx="0" cy="9" r="6.5" fill="none" stroke="rgba(167,139,250,0.3)" stroke-width="0.7"/>',
    '<text x="0" y="12" text-anchor="middle" font-size="7" fill="rgba(34,211,238,0.65)" font-family="serif">✦</text>',

    // ── Eyes ──────────────────────────────────────────────────
    // Eye sockets
    '<circle cx="-7" cy="-3" r="5.5" fill="#08030f"/>',
    '<circle cx="7"  cy="-3" r="5.5" fill="#08030f"/>',
    // Iris glow
    '<circle class="bb-eye-glow" cx="-7" cy="-3" r="2.2" fill="rgba(34,211,238,0.85)"/>',
    '<circle class="bb-eye-glow" cx="7"  cy="-3" r="2.2" fill="rgba(34,211,238,0.85)"/>',
    // Pupil specular
    '<circle cx="-5.5" cy="-5" r="0.9" fill="white" opacity="0.95"/>',
    '<circle cx="8.5"  cy="-5" r="0.9" fill="white" opacity="0.95"/>',

    // ── Blush patches ─────────────────────────────────────────
    '<ellipse cx="-12" cy="4" rx="4" ry="2.5" fill="rgba(255,160,200,0.25)"/>',
    '<ellipse cx="12"  cy="4" rx="4" ry="2.5" fill="rgba(255,160,200,0.25)"/>',

    // ── Mouth ─────────────────────────────────────────────────
    '<path class="bb-mouth" d="M-5,7 Q0,11 5,7" stroke="rgba(167,139,250,0.85)" stroke-width="1.3" fill="none" stroke-linecap="round"/>',

    // ── Arms (in groups so we can rotate around shoulder) ─────
    // LEFT arm — shoulder at (-20, 4)
    '<g class="bb-arm-l">',
    '  <line x1="-20" y1="4" x2="-32" y2="4" stroke="rgba(196,160,255,0.9)" stroke-width="4.5" stroke-linecap="round"/>',
    '  <circle cx="-32" cy="4" r="4" fill="rgba(196,160,255,0.9)"/>',
    '  <!-- fingers -->',
    '  <line x1="-32" y1="4" x2="-36" y2="0.5" stroke="rgba(220,190,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>',
    '  <line x1="-32" y1="4" x2="-36.5" y2="5" stroke="rgba(220,190,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>',
    '</g>',

    // RIGHT arm — shoulder at (20, 4)
    '<g class="bb-arm-r">',
    '  <line x1="20" y1="4" x2="32" y2="4" stroke="rgba(196,160,255,0.9)" stroke-width="4.5" stroke-linecap="round"/>',
    '  <circle cx="32" cy="4" r="4" fill="rgba(196,160,255,0.9)"/>',
    '  <!-- fingers -->',
    '  <line x1="32" y1="4" x2="36" y2="0.5" stroke="rgba(220,190,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>',
    '  <line x1="32" y1="4" x2="36.5" y2="5" stroke="rgba(220,190,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>',
    '</g>',

    // ── Sparkle particles (shown when excited) ────────────────
    '<g class="bb-sparkles" opacity="0">',
    '  <text x="30"  y="-26" font-size="9"  fill="rgba(251,146,60,0.95)"   font-family="serif">✦</text>',
    '  <text x="-36" y="-20" font-size="7"  fill="rgba(34,211,238,0.95)"  font-family="serif">★</text>',
    '  <text x="24"  y="30"  font-size="6"  fill="rgba(167,139,250,0.9)"  font-family="serif">✧</text>',
    '  <text x="-30" y="28"  font-size="8"  fill="rgba(251,146,60,0.9)"   font-family="serif">✦</text>',
    '</g>',

    '</svg>',
    // Speech bubble
    '<div class="bb-bubble" id="bb-bubble">✦ hello! ✦</div>',
  ].join('\n');

  document.body.appendChild(el);

  // ── DOM refs ───────────────────────────────────────────────────
  var armL     = el.querySelector('.bb-arm-l');
  var armR     = el.querySelector('.bb-arm-r');
  var sparkles = el.querySelector('.bb-sparkles');
  var mouth    = el.querySelector('.bb-mouth');
  var bubble   = el.querySelector('.bb-bubble');

  // ── State ──────────────────────────────────────────────────────
  var bx = 0, by = 0;           // buddy center (viewport px)
  var tx = 0, ty = 0;           // movement target
  var mx = -9999, my = -9999;   // mouse (viewport px)
  var armLRot = 20;             // SVG rotation deg (from default left-pointing)
  var armRRot = -20;            // SVG rotation deg (from default right-pointing)
  var wanderTimer = 1000;       // ms until next wander pick
  var homeTimer   = 0;          // ms since cursor last nearby; return home after 10s
  var isExcited   = false;
  var lastTime    = 0;

  // ── Home position: sit on the witch hat ASCII art ──────────────
  function getHomePos() {
    var art = document.querySelector('.witch-ascii');
    if (art) {
      var r = art.getBoundingClientRect();
      return { x: r.left + r.width * 0.55, y: r.top + r.height * 0.2 };
    }
    return { x: 100, y: window.innerHeight - 130 };
  }

  // Initialize
  var home = getHomePos();
  bx = home.x; by = home.y;
  tx = bx + 40; ty = by - 20;

  // ── Fade in ────────────────────────────────────────────────────
  setTimeout(function () { el.classList.add('bb-visible'); }, 800);

  // ── Mouse tracking ─────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
  });

  // Reset mouse when leaving window
  document.addEventListener('mouseleave', function () {
    mx = -9999; my = -9999;
  });

  // ── Pick a random wander target ────────────────────────────────
  function newWanderTarget() {
    var margin = 80;
    var W = window.innerWidth;
    var H = window.innerHeight;
    tx = margin + Math.random() * (W - margin * 2);
    ty = margin + Math.random() * (H - margin * 2);
    wanderTimer = 2800 + Math.random() * 4000;
  }

  // ── Lerp a rotation angle, handling 360° wrap ─────────────────
  function lerpAngle(cur, tgt, t) {
    var diff = tgt - cur;
    while (diff >  180) diff -= 360;
    while (diff < -180) diff += 360;
    return cur + diff * t;
  }

  // ── Main animation loop ────────────────────────────────────────
  function tick(ts) {
    var dt = lastTime ? Math.min(ts - lastTime, 60) : 16;
    lastTime = ts;

    var ATTRACT_DIST = 210;
    var EXCITED_DIST = 85;
    var dist = Math.hypot(mx - bx, my - by);

    var targetArmL, targetArmR, moveSpeed;

    if (dist < ATTRACT_DIST) {
      // ── Cursor nearby: reach toward it ────────────────────────
      homeTimer = 0;
      tx = mx;
      ty = my;
      moveSpeed = 0.055;

      // Shoulder positions in viewport space
      var lsx = bx - 20, lsy = by + 4;
      var rsx = bx + 20, rsy = by + 4;

      // Angle from shoulder to cursor (degrees, screen-space Y-down)
      var angleL = Math.atan2(my - lsy, mx - lsx) * 180 / Math.PI;
      var angleR = Math.atan2(my - rsy, mx - rsx) * 180 / Math.PI;

      // Left arm default points LEFT (180°): rotate = target - 180
      targetArmL = angleL - 180;
      // Right arm default points RIGHT (0°): rotate = target - 0
      targetArmR = angleR;

      isExcited = dist < EXCITED_DIST;
    } else {
      // ── Wander / return home ───────────────────────────────────
      moveSpeed = 0.016;
      homeTimer += dt;

      if (homeTimer > 10000) {
        // Return to sit on hat
        var h = getHomePos();
        tx = h.x;
        ty = h.y;
        wanderTimer = 9999;
      } else {
        wanderTimer -= dt;
        if (wanderTimer <= 0) newWanderTarget();
      }

      // Arms droop naturally at rest
      targetArmL = 22;   // slightly drooping left
      targetArmR = -22;  // slightly drooping right
      isExcited = false;
    }

    // Lerp arm rotations
    armLRot = lerpAngle(armLRot, targetArmL, 0.14);
    armRRot = lerpAngle(armRRot, targetArmR, 0.14);

    // Apply SVG rotations (around the respective shoulder joint)
    armL.setAttribute('transform', 'rotate(' + armLRot.toFixed(2) + ', -20, 4)');
    armR.setAttribute('transform', 'rotate(' + armRRot.toFixed(2) + ', 20, 4)');

    // Lerp buddy position
    bx += (tx - bx) * moveSpeed;
    by += (ty - by) * moveSpeed;

    // Clamp inside viewport with padding
    var pad = 50;
    bx = Math.max(pad, Math.min(window.innerWidth  - pad, bx));
    by = Math.max(pad, Math.min(window.innerHeight - pad, by));

    // Apply transform (44px = half of 88px element)
    el.style.transform = 'translate(' + (bx - 44).toFixed(1) + 'px, ' + (by - 44).toFixed(1) + 'px)';

    // ── Excitement effects ─────────────────────────────────────
    if (isExcited) {
      el.classList.add('bb-excited');
      sparkles.setAttribute('opacity', '1');
      mouth.setAttribute('d', 'M-6,6 Q0,12 6,6');
      bubble.textContent = MESSAGES[msgIdx % MESSAGES.length];
    } else {
      el.classList.remove('bb-excited');
      sparkles.setAttribute('opacity', '0');
      mouth.setAttribute('d', 'M-5,7 Q0,11 5,7');
    }

    requestAnimationFrame(tick);
  }

  // ── Cycle messages on repeated excitement ──────────────────────
  var msgCooldown = 0;
  setInterval(function () {
    if (isExcited) {
      msgIdx = (msgIdx + 1) % MESSAGES.length;
    }
  }, 1800);

  newWanderTarget();
  requestAnimationFrame(tick);

})();
