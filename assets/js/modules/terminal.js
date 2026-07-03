// Interactive Mock Terminal logic for Prathamesh Patil portfolio
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var cmdItems = document.querySelectorAll('.terminal-cmd-item');
    var mobileBtns = document.querySelectorAll('.terminal-mobile-btn');
    var titleEl = document.getElementById('terminal-viewer-title');
    
    if (!titleEl) return; // not on homepage

    function runCommand(cmd) {
      // Map command identifier to visual text for viewer title
      var titleText = 'cat about.md';
      if (cmd === 'neofetch') titleText = 'neofetch';
      else if (cmd === 'whoami') titleText = 'whoami';

      titleEl.textContent = titleText;

      // Hide all panels
      var panels = document.querySelectorAll('.terminal-panel');
      panels.forEach(function (panel) {
        panel.style.display = 'none';
      });

      // Show the selected panel
      var targetPanel = document.getElementById('panel-' + cmd);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }

      // Sync active state on desktop command items
      cmdItems.forEach(function (item) {
        var isTarget = item.getAttribute('data-terminal-cmd') === cmd;
        item.classList.toggle('is-active', isTarget);
      });

      // Sync active state on mobile buttons
      mobileBtns.forEach(function (btn) {
        var isTarget = btn.getAttribute('data-mobile-cmd') === cmd;
        btn.classList.toggle('is-active', isTarget);
      });
    }

    // Bind desktop clicks
    cmdItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var cmd = item.getAttribute('data-terminal-cmd');
        runCommand(cmd);
      });
    });

    // Bind mobile clicks
    mobileBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = btn.getAttribute('data-mobile-cmd');
        runCommand(cmd);
      });
    });

    // ── Typewriter for grimoire quote ───────────────────────────
    var twEl = document.querySelector('.typewriter');
    if (twEl) {
      var fullText = twEl.getAttribute('data-text') || '';
      twEl.textContent = '';
      var twStarted = false;

      function startTypewriter() {
        if (twStarted) return;
        twStarted = true;
        var i = 0;
        var speed = 28;
        function type() {
          if (i < fullText.length) {
            twEl.textContent += fullText.charAt(i);
            i++;
            setTimeout(type, speed);
          } else {
            twEl.classList.add('is-done');
          }
        }
        type();
      }

      // Start when in viewport
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              startTypewriter();
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.4 });
        obs.observe(twEl);
      } else {
        startTypewriter();
      }
    }
  });
})();
