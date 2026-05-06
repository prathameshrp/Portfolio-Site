// Generative ambient soundscape — off by default, no audio files.
// A few detuned oscillators through a slowly-drifting low-pass filter.
(function () {
  var btn = document.querySelector('[data-sound-toggle]');
  if (!btn) return;

  var ctx = null, master = null, nodes = [], lfo = null, playing = false, raf = null;

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 6;
    filter.connect(master);

    // chord: A2, E3, A3, C#4 — warm, open
    var freqs = [110, 164.81, 220, 277.18];
    freqs.forEach(function (f, i) {
      var osc = ctx.createOscillator();
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 8;
      var g = ctx.createGain();
      g.gain.value = 0.18 / freqs.length;
      osc.connect(g); g.connect(filter);
      osc.start();
      nodes.push(osc, g);
    });

    // slow filter drift
    lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
    lfo.start();
    nodes.push(lfo, lfoGain);
    return true;
  }

  function start() {
    if (!ctx && !build()) return;
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.4);
    playing = true;
    btn.classList.add('is-playing');
    btn.setAttribute('aria-pressed', 'true');
    animate();
  }
  function stop() {
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    playing = false;
    btn.classList.remove('is-playing');
    btn.setAttribute('aria-pressed', 'false');
    cancelAnimationFrame(raf);
  }

  // tiny equalizer animation on the button bars
  function animate() {
    var bars = btn.querySelectorAll('.sound-bar');
    var t = performance.now() / 240;
    bars.forEach(function (b, i) {
      var h = 30 + Math.abs(Math.sin(t + i * 1.1)) * 70;
      b.style.height = h + '%';
    });
    if (playing) raf = requestAnimationFrame(animate);
  }

  btn.addEventListener('click', function () { playing ? stop() : start(); });
})();
