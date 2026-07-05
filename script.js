/* =========================================================================
   Whollar — shared behaviour
   FAQ accordion + transform-only scroll reveal.
   ========================================================================= */
(function () {
  'use strict';

  /* ---- FAQ accordion (single open) ------------------------------------- */
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

  /* ---- Scroll reveal (transform-only, with a hard failsafe) ----------- */
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
    document.body.classList.add('reveal');
    window.addEventListener('scroll', revealInView, { passive: true });
    window.addEventListener('resize', revealInView, { passive: true });
    requestAnimationFrame(function () { revealInView(); requestAnimationFrame(revealInView); });
    setTimeout(revealAll, 1500);
  }
})();
