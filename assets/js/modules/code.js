// Interactive code: copy buttons, filename/lang bar, runnable JS playgrounds
(function () {
  // ── Enhance Rouge code blocks ───────────────────────────────
  var blocks = document.querySelectorAll('.prose div.highlighter-rouge, .prose figure.highlight');
  blocks.forEach(function (block) {
    if (block.querySelector('.code-block__bar')) return;

    var lang = '';
    (block.className.match(/language-(\w+)/) || []).forEach(function (m, i) { if (i === 1) lang = m; });
    var pre = block.querySelector('pre');
    var name = block.getAttribute('data-file') || (pre && pre.getAttribute('data-file')) || '';

    var bar = document.createElement('div');
    bar.className = 'code-block__bar';
    bar.innerHTML =
      '<span class="code-block__dots"><span class="code-block__dot"></span><span class="code-block__dot"></span><span class="code-block__dot"></span></span>' +
      (name ? '<span class="code-block__name">' + escapeHtml(name) + '</span>' : '') +
      (lang ? '<span class="code-block__lang">' + escapeHtml(lang) + '</span>' : '') +
      '<button class="code-copy" type="button" aria-label="Copy code">' +
        iconCopy() + iconCheck() + '<span class="code-copy__label">Copy</span>' +
      '</button>';
    block.insertBefore(bar, block.firstChild);

    var btn = bar.querySelector('.code-copy');
    var label = bar.querySelector('.code-copy__label');
    btn.addEventListener('click', function () {
      var text = block.querySelector('code') ? block.querySelector('code').innerText : (pre ? pre.innerText : '');
      copy(text).then(function () {
        btn.classList.add('is-copied');
        if (label) label.textContent = 'Copied';
        setTimeout(function () { btn.classList.remove('is-copied'); if (label) label.textContent = 'Copy'; }, 1600);
      });
    });
  });

  // ── Runnable JS playgrounds ─────────────────────────────────
  document.querySelectorAll('[data-playground]').forEach(function (pg) {
    var editor = pg.querySelector('[data-editor]');
    var consoleEl = pg.querySelector('[data-console]');
    var runBtn = pg.querySelector('[data-run]');
    if (!editor || !consoleEl || !runBtn) return;

    // normalize indentation from Liquid capture
    editor.value = editor.value.replace(/^\n/, '').replace(/\s+$/, '');

    function line(text, cls) {
      var div = document.createElement('div');
      div.className = 'playground__line ' + (cls || 'playground__line--log');
      div.textContent = text;
      consoleEl.appendChild(div);
    }
    function fmt(v) {
      if (typeof v === 'string') return v;
      try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }
    }

    function run() {
      consoleEl.innerHTML = '';
      var logs = [];
      var fakeConsole = {
        log: function () { logs.push(['log', Array.prototype.map.call(arguments, fmt).join(' ')]); },
        error: function () { logs.push(['error', Array.prototype.map.call(arguments, fmt).join(' ')]); },
        warn: function () { logs.push(['muted', Array.prototype.map.call(arguments, fmt).join(' ')]); },
        info: function () { logs.push(['log', Array.prototype.map.call(arguments, fmt).join(' ')]); }
      };
      var result, error;
      try {
        var fn = new Function('console', '"use strict";\n' + editor.value);
        result = fn(fakeConsole);
      } catch (e) { error = e; }

      logs.forEach(function (l) { line(l[1], 'playground__line--' + l[0]); });
      if (error) { line('✗ ' + error, 'playground__line--error'); }
      else if (result !== undefined) { line('⟶ ' + fmt(result), 'playground__line--return'); }
      else if (!logs.length) { line('✓ ran with no output', 'playground__line--muted'); }
    }

    runBtn.addEventListener('click', run);
    editor.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = editor.selectionStart, en = editor.selectionEnd;
        editor.value = editor.value.slice(0, s) + '  ' + editor.value.slice(en);
        editor.selectionStart = editor.selectionEnd = s + 2;
      }
    });
  });

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res) {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); res();
    });
  }
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function iconCopy() { return '<span class="icon icon--copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>'; }
  function iconCheck() { return '<span class="icon icon--check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'; }
})();
