// Animations: scroll-reveal, word rotator, terminal typing, count-up, TOC, tilt
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Scroll reveal ───────────────────────────────────────────
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          var el = e.target;
          setTimeout(function () { el.classList.add('is-visible'); }, (i % 4) * 70);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.02, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ── Diff widget ─────────────────────────────────────────────
  var diffOld = document.getElementById('heroDiffOld');
  var diffNew = document.getElementById('heroDiffNew');

  if (diffOld && diffNew) {
    var pairs = [
      ['manual test scripts in bash',     'automated OpenAPI integration tests'],
      ['bug fixed in local dev branch',   'bug reintroduced in production merge'],
      ['regex from ChatGPT that breaks',  'robust RFC-compliant email parser'  ],
      ['print statements for debugging',  'actual interactive debugger breakpoints'],
      ['legacy callback spaghetti loops', 'async/await promise pipelines'      ],
      ['permanent temporary workaround',  'documented structural technical debt']
    ];
    var pi = 0;
    var isTyping = false;

    function typeDiff() {
      if (isTyping) return;
      isTyping = true;

      var nextPair = pairs[(pi + 1) % pairs.length];
      var oldVal1 = pairs[pi][0];
      var newVal1 = nextPair[0];
      var oldVal2 = pairs[pi][1];
      var newVal2 = nextPair[1];

      // Backspace simulation
      var currentVal1 = oldVal1;
      var currentVal2 = oldVal2;

      function backspace() {
        var changed = false;
        if (currentVal1.length > 0) {
          currentVal1 = currentVal1.slice(0, -1);
          diffOld.textContent = currentVal1 || ' ';
          changed = true;
        }
        if (currentVal2.length > 0) {
          currentVal2 = currentVal2.slice(0, -1);
          diffNew.textContent = currentVal2 || ' ';
          changed = true;
        }

        if (changed) {
          setTimeout(backspace, 12);
        } else {
          pi = (pi + 1) % pairs.length;
          type();
        }
      }

      var typeIdx1 = 0;
      var typeIdx2 = 0;

      function type() {
        var changed = false;
        if (typeIdx1 < newVal1.length) {
          diffOld.textContent = newVal1.slice(0, typeIdx1 + 1);
          typeIdx1++;
          changed = true;
        }
        if (typeIdx2 < newVal2.length) {
          diffNew.textContent = newVal2.slice(0, typeIdx2 + 1);
          typeIdx2++;
          changed = true;
        }

        if (changed) {
          setTimeout(type, 18);
        } else {
          isTyping = false;
        }
      }

      backspace();
    }

    setInterval(typeDiff, 5200);
  }

  // ── Bottom Ticker scroll visibility ─────────────────────────
  var ticker = document.querySelector('.skills-ticker-strip');
  if (ticker) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        ticker.classList.add('is-hidden');
      } else {
        ticker.classList.remove('is-hidden');
      }
    }, { passive: true });
  }

  // ── Terminal typing ─────────────────────────────────────────
  var term = document.querySelector('[data-terminal]');
  if (term) {
    var lines = [];
    try { lines = JSON.parse(term.getAttribute('data-lines')); } catch (e) {}
    function isCmd(l) { return l.indexOf('$') === 0; }
    if (reduce) {
      term.innerHTML = lines.map(function (l) {
        return '<span class="' + (isCmd(l) ? 't-prompt' : 't-out') + '">' + escapeHtml(l) + '</span>';
      }).join('\n');
    } else {
      var li = 0, pos = 0;
      var cursor = document.createElement('span');
      cursor.className = 'terminal__cursor';
      function typeLine() {
        if (li >= lines.length) { return; }
        var line = lines[li];
        var span = term.querySelector('.t-current');
        if (!span) {
          span = document.createElement('span');
          span.className = 't-current ' + (isCmd(line) ? 't-prompt' : 't-out');
          term.appendChild(span);
          term.appendChild(cursor);
        }
        if (pos <= line.length) {
          span.textContent = line.substring(0, pos);
          pos++;
          setTimeout(typeLine, isCmd(line) ? 55 : 18);
        } else {
          span.classList.remove('t-current');
          term.insertBefore(document.createTextNode('\n'), cursor);
          li++; pos = 0;
          setTimeout(typeLine, 360);
        }
      }
      setTimeout(typeLine, 700);
    }
  }

  // ── Count-up stats ──────────────────────────────────────────
  var counters = document.querySelectorAll('[data-countup]');
  if (counters.length) {
    var cObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.getAttribute('data-target'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce) { el.textContent = target + suffix; cObserver.unobserve(el); return; }
        var start = performance.now(), dur = 1400;
        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cObserver.observe(c); });
  }

  // ── TOC build + scrollspy ───────────────────────────────────
  var tocList = document.querySelector('[data-toc-list]');
  var content = document.querySelector('[data-post-content]');
  if (tocList && content) {
    var headings = content.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      var toc = document.querySelector('[data-toc]');
      if (toc) toc.style.display = 'none';
    } else {
      headings.forEach(function (h) {
        if (!h.id) h.id = h.textContent.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        if (h.tagName === 'H3') a.classList.add('toc--h3');
        tocList.appendChild(a);
      });
      var links = tocList.querySelectorAll('a');
      function updateActiveTOC() {
        var scrollPos = window.scrollY + 120;
        var activeHeading = null;
        for (var i = 0; i < headings.length; i++) {
          var h = headings[i];
          if (h.offsetTop <= scrollPos) {
            activeHeading = h;
          } else {
            break;
          }
        }
        if (!activeHeading && headings.length > 0) {
          activeHeading = headings[0];
        }
        if (activeHeading) {
          links.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + activeHeading.id);
          });
        }
      }
      window.addEventListener('scroll', updateActiveTOC, { passive: true });
      updateActiveTOC();
    }
  }

  // ── Subtle tilt on hero terminal ────────────────────────────
  var tilt = document.querySelector('[data-tilt]');
  if (tilt && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var card = tilt.querySelector('.terminal');
    tilt.addEventListener('mousemove', function (ev) {
      var r = tilt.getBoundingClientRect();
      var rx = ((ev.clientY - r.top) / r.height - 0.5) * -6;
      var ry = ((ev.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    tilt.addEventListener('mouseleave', function () { card.style.transform = ''; });
  }

  // ── Self-drawing SVG diagrams ───────────────────────────────
  var diagrams = document.querySelectorAll('[data-draw]');
  if (diagrams.length) {
    diagrams.forEach(function (svg) {
      var strokes = svg.querySelectorAll('path, line, polyline, circle, rect, ellipse');
      strokes.forEach(function (el) {
        var len;
        try { len = el.getTotalLength ? el.getTotalLength() : 0; } catch (e) { len = 0; }
        if (!len) { len = 400; }
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = reduce ? 0 : len;
        el.dataset.len = len;
      });
      var fills = svg.querySelectorAll('[data-fade]');
      fills.forEach(function (el) { el.style.opacity = reduce ? 1 : 0; });
    });

    if (reduce || !('IntersectionObserver' in window)) {
      diagrams.forEach(playDiagram);
    } else {
      var dObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { playDiagram(e.target); dObs.unobserve(e.target); } });
      }, { threshold: 0.3 });
      diagrams.forEach(function (s) { dObs.observe(s); });
    }
  }
  function playDiagram(svg) {
    var strokes = svg.querySelectorAll('path, line, polyline, circle, rect, ellipse');
    strokes.forEach(function (el, i) {
      el.style.transition = 'stroke-dashoffset 1s var(--ease) ' + (i * 0.12) + 's';
      requestAnimationFrame(function () { el.style.strokeDashoffset = '0'; });
    });
    svg.querySelectorAll('[data-fade]').forEach(function (el, i) {
      el.style.transition = 'opacity .6s var(--ease) ' + (0.3 + i * 0.12) + 's';
      requestAnimationFrame(function () { el.style.opacity = '1'; });
    });
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Home page terminal mouse parallax hover effect ──────────
  var heroSection = document.getElementById('top');
  var terminalCard = document.querySelector('.hero-col-right .terminal-window');
  if (heroSection && terminalCard) {
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate rotation angles
      var tiltX = (y / (rect.height / 2)) * -8; // max 8 deg
      var tiltY = (x / (rect.width / 2)) * 10; // max 10 deg
      
      terminalCard.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateZ(5px)';
      terminalCard.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });
    heroSection.addEventListener('mouseleave', function () {
      terminalCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      terminalCard.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  }
})();
