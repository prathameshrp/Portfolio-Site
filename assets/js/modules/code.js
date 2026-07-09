// Interactive code: copy buttons, filename/lang bar, runnable JS playgrounds
(function () {
  var KEYWORDS = { 'const':1, 'let':1, 'var':1, 'function':1, 'return':1, 'if':1, 'else':1, 'for':1, 'while':1, 'new':1, 'try':1, 'catch':1, 'throw':1, 'import':1, 'export':1, 'class':1, 'extends':1, 'async':1, 'await':1 };
  var BUILTINS = { 'console':1, 'log':1, 'error':1, 'warn':1, 'info':1, 'JSON':1, 'stringify':1, 'Math':1, 'Map':1, 'Set':1, 'Array':1, 'SetCover':1, 'greedySetCover':1 };
  var ICON_COPY = '<span class="icon icon--copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>';
  var ICON_CHECK = '<span class="icon icon--check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';

  // ── Enhance Rouge code blocks ───────────────────────────────
  var blocks = document.querySelectorAll('.prose div.highlighter-rouge, .prose figure.highlight');
  blocks.forEach(function (block) {
    if (block.querySelector('.code-block__bar')) return;

    var match = block.className.match(/language-(\w+)/);
    var lang = match ? match[1] : '';
    var pre = block.querySelector('pre');
    var name = block.getAttribute('data-file') || (pre && pre.getAttribute('data-file')) || '';

    var bar = document.createElement('div');
    bar.className = 'code-block__bar';
    bar.innerHTML =
      '<span class="code-block__dots"><span class="code-block__dot"></span><span class="code-block__dot"></span><span class="code-block__dot"></span></span>' +
      (name ? '<span class="code-block__name">' + escapeHtml(name) + '</span>' : '') +
      (lang ? '<span class="code-block__lang">' + escapeHtml(lang) + '</span>' : '') +
      '<button class="code-copy" type="button" aria-label="Copy code">' +
        ICON_COPY + ICON_CHECK + '<span class="code-copy__label">Copy</span>' +
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
    var highlightEl = pg.querySelector('[data-highlight]');
    var codeEl = highlightEl ? highlightEl.querySelector('code') : null;
    if (!editor || !consoleEl || !runBtn) return;

    editor.value = editor.value.replace(/^\n/, '').replace(/\s+$/, '');

    function highlightJS(code) {
      var parts = [];
      var lastIdx = 0;
      var tokenRegex = /(\/\/.*)|(["'`](?:\\.|[^\\])*?["'`])|(\b\w+\b)/g;
      var match;
      
      while ((match = tokenRegex.exec(code)) !== null) {
        if (match.index > lastIdx) {
          parts.push(escapeHtml(code.slice(lastIdx, match.index)));
        }
        
        var token = match[0];
        if (match[1]) {
          parts.push('<span style="color:var(--text-soft);font-style:italic;">' + escapeHtml(token) + '</span>');
        } else if (match[2]) {
          parts.push('<span style="color:var(--powder);">' + escapeHtml(token) + '</span>');
        } else if (match[3]) {
          var word = match[3];
          if (KEYWORDS[word]) {
            parts.push('<span style="color:var(--jinx);font-weight:bold;">' + word + '</span>');
          } else if (BUILTINS[word]) {
            parts.push('<span style="color:var(--teal);">' + word + '</span>');
          } else if (!isNaN(word)) {
            parts.push('<span style="color:#fb923c;">' + word + '</span>');
          } else {
            parts.push(escapeHtml(word));
          }
        }
        lastIdx = tokenRegex.lastIndex;
      }
      if (lastIdx < code.length) {
        parts.push(escapeHtml(code.slice(lastIdx)));
      }
      return parts.join('');
    }

    function updateHighlight() {
      if (codeEl) codeEl.innerHTML = highlightJS(editor.value) + '\n';
    }

    function syncScroll() {
      if (highlightEl) {
        highlightEl.scrollTop = editor.scrollTop;
        highlightEl.scrollLeft = editor.scrollLeft;
      }
    }

    updateHighlight();
    editor.addEventListener('input', updateHighlight);
    editor.addEventListener('scroll', syncScroll);

    if (window.ResizeObserver) {
      new ResizeObserver(syncScroll).observe(editor);
    }

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
      var fakeConsole = {};
      ['log', 'error', 'warn', 'info'].forEach(function (method) {
        var type = method === 'warn' ? 'muted' : (method === 'error' ? 'error' : 'log');
        fakeConsole[method] = function () {
          logs.push([type, Array.prototype.map.call(arguments, fmt).join(' ')]);
        };
      });

      var result, error;
      try {
        var fn = new Function('console', '"use strict";\n' + editor.value);
        result = fn(fakeConsole);
      } catch (e) { error = e; }

      logs.forEach(function (l) { line(l[1], 'playground__line--' + l[0]); });
      if (error) { line('✗ ' + error, 'playground__line--error'); }
      else if (result !== undefined) { line('⟶ ' + fmt(result), 'playground__line--return'); }
      else if (!logs.length) { line('✓ ran with no output', 'playground__line--muted'); }

      setTimeout(function () {
        consoleEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }

    runBtn.addEventListener('click', run);
    editor.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = editor.selectionStart, en = editor.selectionEnd;
        editor.value = editor.value.slice(0, s) + '  ' + editor.value.slice(en);
        editor.selectionStart = editor.selectionEnd = s + 2;
        updateHighlight();
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
})();
