// Entry point — wiring that doesn't belong to a single module.
(function () {
  // Contact form (Formspree) — async submit with inline status
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) { status.textContent = 'Sending…'; status.className = 'contact-form__status'; }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          if (status) { status.textContent = 'Thanks! Your message is on its way.'; status.className = 'contact-form__status is-ok'; }
        } else {
          if (status) { status.textContent = 'Something went wrong. Email me directly instead.'; status.className = 'contact-form__status is-error'; }
        }
      }).catch(function () {
        if (status) { status.textContent = 'Network error. Email me directly instead.'; status.className = 'contact-form__status is-error'; }
      });
    });
  }

  // Year stamp (if any [data-year] used)
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
