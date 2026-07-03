// ─────────────────────────────────────────────────────────────
// BrushBuddy — Witch Hat Atelier companion (accurate design)
// A fluffy cream-colored worm creature that curls into a donut,
// pokes its head up, and reaches tiny paws toward the cursor.
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';
  if (!document.querySelector('.grimoire-section')) return;

  var MESSAGES = ['hello!', 'ehehe~', 'found you!', 'hi hi!', 'play?', 'squish!', '...!'];
  var msgIdx = 0;

  // ── Build SVG ────────────────────────────────────────────────
  var el = document.createElement('div');
  el.id = 'brushbuddy';
  el.setAttribute('aria-hidden', 'true');

  el.innerHTML = [
    // viewBox is wide enough for the donut body + head poking up
    '<svg class="bb-svg" viewBox="-55 -65 110 130" xmlns="http://www.w3.org/2000/svg">',

    '<defs>',

    // Fuzzy soft-edge filter (expands edge with a blur halo)
    '<filter id="bb-fluff" x="-40%" y="-40%" width="180%" height="180%">',
    '  <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b"/>',
    '  <feFlood flood-color="#f5f0e4" result="c"/>',
    '  <feComposite in="c" in2="b" operator="in" result="halo"/>',
    '  <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '</filter>',
    '<filter id="bb-fluff-sm" x="-50%" y="-50%" width="200%" height="200%">',
    '  <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="b"/>',
    '  <feFlood flood-color="#f0ead8" result="c"/>',
    '  <feComposite in="c" in2="b" operator="in" result="halo"/>',
    '  <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '</filter>',

    // Body gradient — cream top, tan underside
    '<radialGradient id="bb-cream" cx="42%" cy="30%" r="65%">',
    '  <stop offset="0%"   stop-color="#fdfaf2"/>',
    '  <stop offset="55%"  stop-color="#ede5cf"/>',
    '  <stop offset="100%" stop-color="#d8caa8"/>',
    '</radialGradient>',
    '<radialGradient id="bb-under" cx="50%" cy="45%">',
    '  <stop offset="0%"   stop-color="#cfc0a0"/>',
    '  <stop offset="100%" stop-color="#b8a880"/>',
    '</radialGradient>',
    // Head gradient — slightly lighter/rounder look
    '<radialGradient id="bb-head-g" cx="38%" cy="28%" r="70%">',
    '  <stop offset="0%"   stop-color="#fefcf5"/>',
    '  <stop offset="50%"  stop-color="#f0e8d2"/>',
    '  <stop offset="100%" stop-color="#ddd0b0"/>',
    '</radialGradient>',

    '</defs>',

    // ── Ground shadow ───────────────────────────────────────────
    '<ellipse cx="0" cy="62" rx="40" ry="7" fill="rgba(0,0,0,0.10)"/>',

    // ── Body: donut/coil ring ───────────────────────────────────
    // The body is a thick tube that wraps in a ring, seen from slightly above.
    // Rendered as: bottom arc first (goes behind head), then top arc (in front)

    // Outer fluffy ring (whole donut shape)
    '<ellipse class="bb-ring" cx="0" cy="42" rx="46" ry="20"',
    '  fill="url(#bb-under)" filter="url(#bb-fluff)"/>',
    // Top surface of ring
    '<ellipse class="bb-ring" cx="0" cy="38" rx="44" ry="18" fill="url(#bb-cream)"/>',
    // Donut hole (darker - depth illusion)
    '<ellipse cx="0" cy="38" rx="22" ry="9" fill="#c4b490"/>',

    // Fluff bumps around the ring (suggest fuzzy texture)
    '<circle cx="-44" cy="36" r="6"  fill="#f5efdf" filter="url(#bb-fluff-sm)"/>',
    '<circle cx="44"  cy="36" r="6"  fill="#f5efdf" filter="url(#bb-fluff-sm)"/>',
    '<circle cx="-40" cy="50" r="5"  fill="#ede5cb" filter="url(#bb-fluff-sm)"/>',
    '<circle cx="40"  cy="50" r="5"  fill="#ede5cb" filter="url(#bb-fluff-sm)"/>',
    '<circle cx="-20" cy="56" r="4.5" fill="#ede5cb" filter="url(#bb-fluff-sm)"/>',
    '<circle cx="20"  cy="56" r="4.5" fill="#ede5cb" filter="url(#bb-fluff-sm)"/>',
    '<circle cx="0"   cy="58" r="5"  fill="#ede5cb" filter="url(#bb-fluff-sm)"/>',

    // ── Tiny paw arms (sit inside donut ring) ──────────────────
    // Left paw
    '<g class="bb-arm-l">',
    '  <ellipse cx="-20" cy="26" rx="9" ry="7" fill="#f5efdf" filter="url(#bb-fluff-sm)"/>',
    '  <!-- tiny toe nubs -->',
    '  <ellipse cx="-24" cy="22" rx="3.5" ry="2.5" fill="#eee6d2"/>',
    '  <ellipse cx="-20" cy="20" rx="3.5" ry="2.5" fill="#eee6d2"/>',
    '  <ellipse cx="-15" cy="21" rx="3.5" ry="2.5" fill="#eee6d2"/>',
    '</g>',
    // Right paw
    '<g class="bb-arm-r">',
    '  <ellipse cx="20"  cy="26" rx="9" ry="7" fill="#f5efdf" filter="url(#bb-fluff-sm)"/>',
    '  <ellipse cx="15"  cy="22" rx="3.5" ry="2.5" fill="#eee6d2"/>',
    '  <ellipse cx="20"  cy="20" rx="3.5" ry="2.5" fill="#eee6d2"/>',
    '  <ellipse cx="25"  cy="21" rx="3.5" ry="2.5" fill="#eee6d2"/>',
    '</g>',

    // ── Head — pokes up from center of the donut ────────────────
    '<g class="bb-head">',
    // Neck connecting head to body ring (fills the donut hole)
    '<ellipse cx="0" cy="22" rx="16" ry="12" fill="#ede5cf"/>',
    // Main head shape — slightly teardrop, wider at top
    '<ellipse cx="0" cy="0" rx="22" ry="26" fill="url(#bb-head-g)" filter="url(#bb-fluff)"/>',

    // ── Eyes (the most important part — large, round, white sclera + dark) ──
    // Left eye
    '<circle cx="-9"  cy="-4" r="11" fill="white"/>',
    '<circle cx="-9"  cy="-4" r="8"  fill="#1a1008"/>',
    // Left iris shine — gives it depth
    '<circle cx="-6.5" cy="-7" r="3"  fill="white" opacity="0.9"/>',
    '<circle cx="-11" cy="-1" r="1.2" fill="white" opacity="0.5"/>',

    // Right eye
    '<circle cx="9"   cy="-4" r="11" fill="white"/>',
    '<circle cx="9"   cy="-4" r="8"  fill="#1a1008"/>',
    // Right iris shine
    '<circle cx="11.5" cy="-7" r="3"  fill="white" opacity="0.9"/>',
    '<circle cx="7"   cy="-1" r="1.2" fill="white" opacity="0.5"/>',

    // ── Mouth — tiny, subtle ────────────────────────────────────
    '<path class="bb-mouth" d="M-4,8 Q0,11 4,8" stroke="#9a8060" stroke-width="1.4" fill="none" stroke-linecap="round"/>',

    // Cheek blush (very subtle)
    '<ellipse cx="-16" cy="5" rx="5" ry="3" fill="rgba(240,180,140,0.20)"/>',
    '<ellipse cx="16"  cy="5" rx="5" ry="3" fill="rgba(240,180,140,0.20)"/>',

    '</g>',

    // ── Sparkles (excited) ──────────────────────────────────────
    '<g class="bb-sparkles" opacity="0">',
    '  <text x="32"  y="-32" font-size="11" fill="rgba(251,200,60,0.95)"  font-family="serif">✦</text>',
    '  <text x="-40" y="-28" font-size="8"  fill="rgba(200,220,255,0.95)" font-family="serif">★</text>',
    '  <text x="28"  y="62"  font-size="7"  fill="rgba(255,220,160,0.9)"  font-family="serif">✧</text>',
    '  <text x="-34" y="60"  font-size="10" fill="rgba(251,200,60,0.9)"   font-family="serif">✦</text>',
    '</g>',

    '</svg>',
    '<div class="bb-bubble" id="bb-bubble">hello!</div>',
  ].join('\n');

  document.body.appendChild(el);

  // ── DOM refs ───────────────────────────────────────────────────
  var armL     = el.querySelector('.bb-arm-l');
  var armR     = el.querySelector('.bb-arm-r');
  var head     = el.querySelector('.bb-head');
  var sparkles = el.querySelector('.bb-sparkles');
  var mouth    = el.querySelector('.bb-mouth');
  var bubble   = el.querySelector('.bb-bubble');

  // ── State ──────────────────────────────────────────────────────
  var bx = 0, by = 0;
  var tx = 0, ty = 0;
  var mx = -9999, my = -9999;

  // Arm offset (translation, not rotation — paws just reach out)
  var armLdx = 0, armLdy = 0;
  var armRdx = 0, armRdy = 0;
  var targetArmLdx = 0, targetArmLdy = 0;
  var targetArmRdx = 0, targetArmRdy = 0;

  // Head tilt (slight rotation toward cursor)
  var headTilt = 0, targetHeadTilt = 0;

  var wanderTimer = 1500;
  var homeTimer   = 0;
  var isExcited   = false;
  var lastTime    = 0;

  // ── Home position ──────────────────────────────────────────────
  function getHomePos() {
    var art = document.querySelector('.witch-ascii');
    if (art) {
      var r = art.getBoundingClientRect();
      // Sit on top of the witch hat (which itself is below .witch-ascii text)
      return { x: r.left + r.width * 0.5, y: r.bottom - 20 };
    }
    return { x: 90, y: window.innerHeight - 100 };
  }

  var home = getHomePos();
  bx = home.x; by = home.y;
  tx = bx; ty = by;

  setTimeout(function () { el.classList.add('bb-visible'); }, 600);

  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', function () { mx = -9999; my = -9999; });

  function newWander() {
    var m = 80;
    tx = m + Math.random() * (window.innerWidth  - m * 2);
    ty = m + Math.random() * (window.innerHeight - m * 2);
    wanderTimer = 3000 + Math.random() * 4500;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick(ts) {
    var dt = lastTime ? Math.min(ts - lastTime, 60) : 16;
    lastTime = ts;

    var ATTRACT = 200;
    var EXCITED = 80;
    var dist = Math.hypot(mx - bx, my - by);
    var moveSpeed;

    if (dist < ATTRACT) {
      homeTimer = 0;
      tx = mx; ty = my;
      moveSpeed = 0.05;

      // Paw nubs push slightly toward cursor (max 12px reach)
      var reach = Math.max(0, (ATTRACT - dist) / ATTRACT);
      var angle = Math.atan2(my - by, mx - bx);
      var maxReach = 13;
      targetArmLdx = Math.cos(angle) * reach * maxReach;
      targetArmLdy = Math.sin(angle) * reach * maxReach;
      targetArmRdx = targetArmLdx;
      targetArmRdy = targetArmLdy;

      // Head tilts slightly toward cursor
      targetHeadTilt = Math.atan2(my - by, mx - bx) * 18 / Math.PI;
      targetHeadTilt = Math.max(-18, Math.min(18, targetHeadTilt));

      isExcited = dist < EXCITED;
    } else {
      homeTimer += dt;
      if (homeTimer > 9000) {
        var h = getHomePos();
        tx = h.x; ty = h.y;
        wanderTimer = 99999;
      } else {
        wanderTimer -= dt;
        if (wanderTimer <= 0) newWander();
      }
      moveSpeed = 0.015;
      targetArmLdx = 0; targetArmLdy = 0;
      targetArmRdx = 0; targetArmRdy = 0;
      targetHeadTilt = 0;
      isExcited = false;
    }

    // Lerp everything
    armLdx = lerp(armLdx, targetArmLdx, 0.12);
    armLdy = lerp(armLdy, targetArmLdy, 0.12);
    armRdx = lerp(armRdx, targetArmRdx, 0.12);
    armRdy = lerp(armRdy, targetArmRdy, 0.12);
    headTilt = lerp(headTilt, targetHeadTilt, 0.1);

    // Apply paw translations
    armL.setAttribute('transform', 'translate(' + armLdx.toFixed(2) + ',' + armLdy.toFixed(2) + ')');
    armR.setAttribute('transform', 'translate(' + armRdx.toFixed(2) + ',' + armRdy.toFixed(2) + ')');
    // Head tilt
    head.setAttribute('transform', 'rotate(' + headTilt.toFixed(2) + ', 0, 10)');

    // Move buddy
    bx += (tx - bx) * moveSpeed;
    by += (ty - by) * moveSpeed;
    bx = Math.max(55, Math.min(window.innerWidth  - 55, bx));
    by = Math.max(65, Math.min(window.innerHeight - 65, by));
    el.style.transform = 'translate(' + (bx - 55).toFixed(1) + 'px,' + (by - 65).toFixed(1) + 'px)';

    // Excitement state
    if (isExcited) {
      el.classList.add('bb-excited');
      sparkles.setAttribute('opacity', '1');
      mouth.setAttribute('d', 'M-5,7 Q0,13 5,7');
      bubble.textContent = MESSAGES[msgIdx % MESSAGES.length];
    } else {
      el.classList.remove('bb-excited');
      sparkles.setAttribute('opacity', '0');
      mouth.setAttribute('d', 'M-4,8 Q0,11 4,8');
    }

    requestAnimationFrame(tick);
  }

  setInterval(function () {
    if (isExcited) msgIdx = (msgIdx + 1) % MESSAGES.length;
  }, 1600);

  newWander();
  requestAnimationFrame(tick);
})();
