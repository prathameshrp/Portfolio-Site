// ─────────────────────────────────────────────────────────────
// BrushBuddy — Witch Hat Atelier worm companion (interactive)
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // Only run if not on mobile/tablet (min width 768px)
  if (window.innerWidth < 768) return;

  var MESSAGES = ['Zzz...', 'Hm?', 'hello!', 'ehehe~', 'wheee!', 'spiral!', 'up we go!', 'slither~'];
  var msgIdx = 0;

  // ── Create global styles/container ──────────────────────────
  var buddyEl = document.createElement('div');
  buddyEl.id = 'brushbuddy';
  buddyEl.setAttribute('aria-hidden', 'true');

  // We build an overlay SVG that hosts our multi-segment snake
  buddyEl.innerHTML = [
    '<svg class="bb-container" id="bb-svg-container" xmlns="http://www.w3.org/2000/svg">',
    '  <defs>',
    // Fluffy shadow/halo filter
    '    <filter id="bb-fluff-segment" x="-50%" y="-50%" width="200%" height="200%">',
    '      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="b"/>',
    '      <feFlood flood-color="#fdfaf2" result="c"/>',
    '      <feComposite in="c" in2="b" operator="in" result="halo"/>',
    '      <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '    </filter>',
    // Fluffy head filter
    '    <filter id="bb-fluff-head" x="-50%" y="-50%" width="200%" height="200%">',
    '      <feGaussianBlur in="SourceAlpha" stdDeviation="3.0" result="b"/>',
    '      <feFlood flood-color="#fefcf5" result="c"/>',
    '      <feComposite in="c" in2="b" operator="in" result="halo"/>',
    '      <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '    </filter>',
    // Cream colors
    '    <radialGradient id="bb-cream-seg" cx="35%" cy="30%">',
    '      <stop offset="0%" stop-color="#ffffff"/>',
    '      <stop offset="65%" stop-color="#ede5cf"/>',
    '      <stop offset="100%" stop-color="#d0bf9a"/>',
    '    </radialGradient>',
    '    <radialGradient id="bb-cream-head" cx="35%" cy="30%">',
    '      <stop offset="0%" stop-color="#ffffff"/>',
    '      <stop offset="60%" stop-color="#f5eedc"/>',
    '      <stop offset="100%" stop-color="#dcd0b0"/>',
    '    </radialGradient>',
    '  </defs>',
    // Group for tail/body segments
    '  <g id="bb-body-group"></g>',
    // Group for head and face
    '  <g id="bb-head-group">',
    '    <circle id="bb-head-base" r="18" fill="url(#bb-cream-head)" filter="url(#bb-fluff-head)"/>',
    // Sleeping/closed eyes (initially visible)
    '    <path id="bb-eyes-closed" d="M-10,-3 Q-7,-1 -4,-3 M4,-3 Q7,-1 10,-3" stroke="#8a7355" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    // Awake/open eyes (initially hidden)
    '    <g id="bb-eyes-open" display="none">',
    '      <circle cx="-7" cy="-2" r="6.5" fill="white"/>',
    '      <circle cx="-7" cy="-2" r="4.2" fill="#1b120c"/>',
    '      <circle cx="-5.2" cy="-4" r="1.6" fill="white"/>',
    '      <circle cx="7" cy="-2" r="6.5" fill="white"/>',
    '      <circle cx="7" cy="-2" r="4.2" fill="#1b120c"/>',
    '      <circle cx="8.8" cy="-4" r="1.6" fill="white"/>',
    '    </g>',
    // Mouth
    '    <path id="bb-mouth" d="M-3,5 Q0,7 3,5" stroke="#8a7355" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
    // Sparkles group
    '    <g id="bb-sparkles" opacity="0">',
    '      <text x="18" y="-18" font-size="9" fill="#fbc02d" class="bb-sparkle">✦</text>',
    '      <text x="-24" y="-14" font-size="7" fill="#80deea" class="bb-sparkle">★</text>',
    '    </g>',
    '  </g>',
    '</svg>',
    '<div class="bb-bubble" id="bb-bubble">Zzz...</div>'
  ].join('\n');

  document.body.appendChild(buddyEl);

  // ── DOM Elements ───────────────────────────────────────────────
  var container  = document.getElementById('bb-svg-container');
  var bodyGroup  = document.getElementById('bb-body-group');
  var headGroup  = document.getElementById('bb-head-group');
  var eyesClosed = document.getElementById('bb-eyes-closed');
  var eyesOpen   = document.getElementById('bb-eyes-open');
  var mouth      = document.getElementById('bb-mouth');
  var sparkles   = document.getElementById('bb-sparkles');
  var bubble     = document.getElementById('bb-bubble');

  // ── Configuration ──────────────────────────────────────────────
  var NUM_SEGMENTS = 14;
  var SEGMENT_SPACING = 11; // Distance between overlapping circles

  // ── States ─────────────────────────────────────────────────────
  var STATE_SLEEPING = 0;
  var STATE_WAKING   = 1;
  var STATE_SLITHER  = 2;
  var STATE_SPIRAL   = 3;
  var currentState = STATE_SLEEPING;

  // Position tracking (segment 0 = head)
  var segments = [];
  for (var i = 0; i < NUM_SEGMENTS; i++) {
    segments.push({ x: 0, y: 0 });
  }

  // Segment circles elements in DOM
  var segmentEls = [];
  for (var i = 1; i < NUM_SEGMENTS; i++) {
    var circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    // Tapered body size (thick in middle, thin at tail)
    var r = 16 - (i * 0.45);
    r = Math.max(7, r);
    circ.setAttribute('r', r);
    circ.setAttribute('fill', 'url(#bb-cream-seg)');
    circ.setAttribute('filter', 'url(#bb-fluff-segment)');
    bodyGroup.appendChild(circ);
    segmentEls.push(circ);
  }

  // Mouse state
  var mx = -9999, my = -9999;
  var lastActiveTime = Date.now();
  var slitherOffset = 0;
  var spiralAngle = 0;
  var bubbleTimeout = null;

  // Keep track of viewport dimensions
  var W = window.innerWidth;
  var H = window.innerHeight;

  window.addEventListener('resize', function () {
    W = window.innerWidth;
    H = window.innerHeight;
  });

  // Track cursor
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    lastActiveTime = Date.now();
  });

  // Handle sleep/wake interaction on click
  document.addEventListener('click', function (e) {
    // If clicked near the buddy, show message / wake up fully
    var dx = e.clientX - segments[0].x;
    var dy = e.clientY - segments[0].y;
    if (Math.hypot(dx, dy) < 80) {
      triggerExcitement();
    }
  });

  // Get sleep position at the bottom right corner (on solid ground)
  function getSleepPos() {
    return { x: W - 70, y: H - 25 };
  }

  // Initialize positions to sleep coil
  var sp = getSleepPos();
  for (var i = 0; i < NUM_SEGMENTS; i++) {
    // Curl into a spiral coil
    var angle = i * 0.45;
    var radius = 22 - (i * 0.8);
    segments[i].x = sp.x + Math.sin(angle) * radius;
    segments[i].y = sp.y + Math.cos(angle) * radius;
  }

  function showBubble(text, duration) {
    bubble.textContent = text;
    bubble.classList.add('visible');
    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(function () {
      bubble.classList.remove('visible');
    }, duration || 2000);
  }

  function triggerExcitement() {
    lastActiveTime = Date.now();
    if (currentState === STATE_SLEEPING) {
      currentState = STATE_WAKING;
      showBubble('Hm? Wha..!', 1800);
    } else {
      msgIdx = (msgIdx + 1) % MESSAGES.length;
      showBubble(MESSAGES[msgIdx], 2000);
    }
  }

  // ── Animation loop ─────────────────────────────────────────────
  var lastTime = 0;

  function loop(ts) {
    var dt = lastTime ? Math.min(ts - lastTime, 50) : 16;
    lastTime = ts;

    // Head is segment 0
    var hx = segments[0].x;
    var hy = segments[0].y;

    // Mouse distance to head
    var mDist = Math.hypot(mx - hx, my - hy);

    // ── State Machine ───────────────────────────────────────────
    var targetHeadX = hx;
    var targetHeadY = hy;

    var idleGroundY = H - 25; // ground line

    // If no interaction for 15s, return to sleep
    if (Date.now() - lastActiveTime > 15000) {
      currentState = STATE_SLEEPING;
    }

    if (currentState === STATE_SLEEPING) {
      // Sleep state: curl up in corner
      var sp = getSleepPos();
      targetHeadX = sp.x;
      targetHeadY = sp.y;

      eyesClosed.setAttribute('display', 'block');
      eyesOpen.setAttribute('display', 'none');
      sparkles.setAttribute('opacity', '0');
      mouth.setAttribute('d', 'M-3,5 Q0,7 3,5');

      if (mDist < 70) {
        // Wake up if hovered/interacted
        currentState = STATE_WAKING;
        lastActiveTime = Date.now();
        showBubble('!', 1500);
      }
    } else {
      // Awake states
      eyesClosed.setAttribute('display', 'none');
      eyesOpen.setAttribute('display', 'block');

      if (currentState === STATE_WAKING) {
        // Startled, looking at cursor
        targetHeadX = hx;
        targetHeadY = hy;
        mouth.setAttribute('d', 'M-3,4 Q0,4 3,4'); // straight mouth

        if (mDist > 80) {
          currentState = STATE_SLITHER;
        } else if (mDist < 45) {
          // If cursor gets too close, climb/spiral up!
          currentState = STATE_SPIRAL;
          spiralAngle = 0;
          showBubble('spiral!', 1500);
        }
      } else if (currentState === STATE_SPIRAL) {
        // Spirals up the side of the screen
        spiralAngle += 0.05;
        // Move upward vertically
        targetHeadY = hy - 4.5;
        // Sine wave X coordinate near the right border
        targetHeadX = (W - 35) + Math.sin(spiralAngle) * 22;

        sparkles.setAttribute('opacity', '1');
        mouth.setAttribute('d', 'M-3,4 Q0,1 3,4'); // happy curl

        // If reaches top or cursor is very far, return to ground
        if (hy < 80 || mDist > 300) {
          currentState = STATE_SLITHER;
          showBubble('wheee!', 1800);
        }
      } else {
        // STATE_SLITHER: Runs away from mouse along the bottom ground
        currentState = STATE_SLITHER;
        sparkles.setAttribute('opacity', '0');
        mouth.setAttribute('d', 'M-3,5 Q0,7 3,5');

        // Target slither position: keep distance from mouse on X axis
        if (mx > 0) {
          var targetX = hx;
          if (mx < hx && hx - mx < 180) {
            // Push right
            targetX = hx + 5.0;
          } else if (mx > hx && mx - hx < 180) {
            // Push left
            targetX = hx - 5.0;
          }
          // Slow drift back to bottom-right center when idle
          if (Math.abs(mx - hx) > 220) {
            targetX += (W - 120 - hx) * 0.02;
          }

          targetHeadX = targetX;
        }

        // Add snake slither height wave (sine offset)
        slitherOffset += 0.15;
        targetHeadY = idleGroundY + Math.sin(slitherOffset) * 4;

        // Spiral up triggers if cursor gets too close from below/front
        if (mDist < 60) {
          currentState = STATE_SPIRAL;
          spiralAngle = 0;
        }
      }
    }

    // Clamp head position
    targetHeadX = Math.max(30, Math.min(W - 30, targetHeadX));
    targetHeadY = Math.max(30, Math.min(H - 22, targetHeadY));

    // Smooth lerp for head
    if (currentState === STATE_SLEEPING) {
      // Coiling needs faster/tighter constraint
      segments[0].x = lerp(segments[0].x, targetHeadX, 0.08);
      segments[0].y = lerp(segments[0].y, targetHeadY, 0.08);
    } else {
      segments[0].x = lerp(segments[0].x, targetHeadX, 0.12);
      segments[0].y = lerp(segments[0].y, targetHeadY, 0.12);
    }

    // ── Follower segment trail logic ──────────────────────────────
    for (var i = 1; i < NUM_SEGMENTS; i++) {
      var prev = segments[i - 1];
      var curr = segments[i];

      if (currentState === STATE_SLEEPING) {
        // Coil layout: spiral circle shape
        var sp = getSleepPos();
        var angle = i * 0.48;
        var r = 20 - (i * 0.95);
        var targetX = sp.x + Math.sin(angle) * r;
        var targetY = sp.y + Math.cos(angle) * r;
        curr.x = lerp(curr.x, targetX, 0.15);
        curr.y = lerp(curr.y, targetY, 0.15);
      } else {
        // Running slither: maintain distance to previous segment (rigid snake path)
        var dx = curr.x - prev.x;
        var dy = curr.y - prev.y;
        var dist = Math.hypot(dx, dy);

        if (dist > SEGMENT_SPACING) {
          var scale = SEGMENT_SPACING / dist;
          curr.x = prev.x + dx * scale;
          curr.y = prev.y + dy * scale;
        }
        // Smoothly settle on ground if idle slithering
        if (currentState === STATE_SLITHER) {
          curr.y = lerp(curr.y, idleGroundY + Math.sin(slitherOffset - i * 0.4) * 4, 0.1);
        }
      }
    }

    // ── Render head ──────────────────────────────────────────────
    // Rotate head toward direction of movement
    var dx = segments[0].x - segments[1].x;
    var dy = segments[0].y - segments[1].y;
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    // Offset angle to match SVGs default rotation if needed (head faces forward relative to neck)
    headGroup.setAttribute('transform', 'translate(' + segments[0].x.toFixed(1) + ',' + segments[0].y.toFixed(1) + ') rotate(' + (angle + 90).toFixed(1) + ')');

    // ── Render body segments ─────────────────────────────────────
    for (var i = 1; i < NUM_SEGMENTS; i++) {
      var el = segmentEls[i - 1];
      var seg = segments[i];
      el.setAttribute('cx', seg.x.toFixed(1));
      el.setAttribute('cy', seg.y.toFixed(1));
    }

    // ── Render Speech Bubble position ────────────────────────────
    if (bubble.classList.contains('visible')) {
      bubble.style.left = segments[0].x + 'px';
      bubble.style.top = (segments[0].y - 30) + 'px';
    }

    requestAnimationFrame(loop);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  requestAnimationFrame(loop);

})();
