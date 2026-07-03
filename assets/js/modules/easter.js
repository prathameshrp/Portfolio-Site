// Easter eggs: a console banner on load + Konami code -> matrix rain.
(function () {
  // ── Console banner ──────────────────────────────────────────
  try {
    var brand = 'DevLog';
    console.log(
      '%c </> %c ' + brand + ' %c\n' +
      '%cYou found the console. Curious people make the best engineers.\n' +
      'Try the Konami code on the page: ↑ ↑ ↓ ↓ ← → ← → B A',
      'background:linear-gradient(120deg,#7c5cff,#22d3ee);color:#fff;font-weight:700;padding:4px 6px;border-radius:6px 0 0 6px;',
      'background:#11111d;color:#22d3ee;font-weight:700;padding:4px 8px;border-radius:0 6px 6px 0;',
      '',
      'color:#7a7d96;font-size:12px;line-height:1.6;'
    );
  } catch (e) {}

  // ── Konami code ─────────────────────────────────────────────
  var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = (k === seq[pos]) ? pos + 1 : (k === seq[0] ? 1 : 0);
    if (pos === seq.length) { pos = 0; matrix(); }
  });

  function matrix() {
    if (document.querySelector('.matrix-rain')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = canvas.width = window.innerWidth;
    var H = canvas.height = window.innerHeight;

    var chars = 'アカサタナﾊﾏﾔﾗ01{}<>=;/$#'.split('');
    var size = 16, cols = Math.floor(W / size);
    var drops = new Array(cols).fill(1);

    var toast = document.createElement('div');
    toast.className = 'matrix-toast';
    toast.textContent = 'wake up… 🟢  (click anywhere to exit)';
    document.body.appendChild(toast);

    var alive = true, start = performance.now();
    function frame(now) {
      if (!alive) return;
      ctx.fillStyle = 'rgba(10,10,18,0.08)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#22d3ee';
      ctx.font = size + 'px JetBrains Mono, monospace';
      for (var i = 0; i < drops.length; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.975 ? '#fff' : (Math.random() > 0.5 ? '#7c5cff' : '#22d3ee');
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      if (now - start > 9000) cleanup();
      else requestAnimationFrame(frame);
    }
    function cleanup() {
      alive = false;
      canvas.classList.add('is-out'); toast.classList.add('is-out');
      setTimeout(function () { canvas.remove(); toast.remove(); }, 600);
      document.removeEventListener('click', cleanup);
    }
    document.addEventListener('click', cleanup);
    window.addEventListener('resize', function () { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });
    requestAnimationFrame(frame);
  }
})();
