/* =========================================================================
   Whollar for distributors — behaviour
   Ports the source Design Component's runtime logic to vanilla JS:
   live theme derivation, FAQ accordion, gated form, and a transform-only
   scroll reveal (opacity is never animated, matching the design's fix).
   ========================================================================= */
(function () {
  'use strict';

  /* ---- Colour math (matches the design's shade()/mix()) ---------------- */
  function parseHex(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    if (h.length !== 6) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function toHex(n) { return Math.round(n).toString(16).padStart(2, '0'); }

  function shade(hex, pct) {
    var rgb = parseHex(hex);
    if (!rgb) return hex;
    var f = function (t) {
      return Math.max(0, Math.min(255, Math.round(pct > 0 ? t + (255 - t) * pct : t * (1 + pct))));
    };
    return '#' + toHex(f(rgb[0])) + toHex(f(rgb[1])) + toHex(f(rgb[2]));
  }
  function mix(hex, withHex, amt) {
    var a = parseHex(hex), b = parseHex(withHex);
    if (!a || !b) return hex;
    return '#' + [0, 1, 2].map(function (i) { return toHex(a[i] + (b[i] - a[i]) * amt); }).join('');
  }

  /* ---- Theme ----------------------------------------------------------- */
  var theme = { coral: '#ff6b4a', teal: '#0f5e63', navy: '#1f2d3d' };

  function applyTheme() {
    var root = document.documentElement.style;
    var c = theme.coral, t = theme.teal, nv = theme.navy;
    root.setProperty('--c', c);
    root.setProperty('--ch', shade(c, -0.16));
    root.setProperty('--cs', mix(c, '#ffffff', 0.32));
    root.setProperty('--t', t);
    root.setProperty('--td', shade(t, -0.28));
    root.setProperty('--tb', mix(t, '#ffffff', 0.22));
    root.setProperty('--nv', nv);
    root.setProperty('--nvd', shade(nv, -0.22));
    root.setProperty('--mist', mix(t, '#ffffff', 0.9));
  }
  applyTheme();

  /* ---- Tweak panel ----------------------------------------------------- */
  var toggle = document.querySelector('.theme-toggle');
  var panel = document.getElementById('theme-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!panel.hasAttribute('hidden') &&
          !panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.swatches').forEach(function (group) {
    var key = group.getAttribute('data-swatch-group'); // coral | teal | navy
    group.querySelectorAll('.swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        group.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        theme[key] = sw.getAttribute('data-color');
        applyTheme();
      });
    });
  });

  var headlineEl = document.querySelector('[data-headline]');
  var headlineSelect = document.querySelector('[data-headline-select]');
  if (headlineEl && headlineSelect) {
    headlineSelect.addEventListener('change', function () {
      headlineEl.textContent = headlineSelect.value;
    });
  }

  /* ---- FAQ accordion (single open, like the source) -------------------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var b = other.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- Application form ------------------------------------------------- */
  var form = document.querySelector('.apply-form');
  var formCard = document.querySelector('.form-card');
  var success = formCard ? formCard.querySelector('.form-success') : null;
  var triedSubmit = false;

  var REQUIRED = ['company', 'contact', 'role', 'email', 'regions', 'network', 'subs'];
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    var errors = {};
    REQUIRED.forEach(function (name) {
      var el = form.elements[name];
      var val = el ? String(el.value).trim() : '';
      if (!val) {
        errors[name] = 'Required';
      } else if (name === 'email' && !EMAIL_RE.test(val)) {
        errors[name] = 'Enter a valid email';
      }
    });
    return errors;
  }

  function paintErrors(errors) {
    REQUIRED.forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      var field = el.closest('.field');
      var err = field ? field.querySelector('.field-err') : null;
      if (errors[name]) {
        if (field) field.classList.add('has-error');
        if (err) { err.textContent = errors[name]; err.removeAttribute('hidden'); }
      } else {
        if (field) field.classList.remove('has-error');
        if (err) { err.textContent = ''; err.setAttribute('hidden', ''); }
      }
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = validate();
      if (Object.keys(errors).length) {
        triedSubmit = true;
        paintErrors(errors);
        var firstBad = form.querySelector('.has-error input, .has-error select');
        if (firstBad) firstBad.focus();
        return;
      }
      form.setAttribute('hidden', '');
      if (success) success.removeAttribute('hidden');
    });

    // After a failed attempt, re-validate live as the user fixes things.
    form.addEventListener('input', function () { if (triedSubmit) paintErrors(validate()); });
    form.addEventListener('change', function () { if (triedSubmit) paintErrors(validate()); });
  }

  /* ---- Scroll reveal (transform-only, with a hard failsafe) ------------ */
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-visible');
    });
  }
  function revealAll() {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (!prefersReduced) {
    document.body.classList.add('reveal'); // applies the resting translateY; opacity untouched
    window.addEventListener('scroll', revealInView, { passive: true });
    window.addEventListener('resize', revealInView, { passive: true });
    requestAnimationFrame(function () { revealInView(); requestAnimationFrame(revealInView); });
    setTimeout(revealAll, 1500); // failsafe: content can never stay hidden
  }
})();
