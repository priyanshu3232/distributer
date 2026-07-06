/* =========================================================================
   Whollar — shared behaviour
   Cohort data · FAQ accordion · transform-only scroll reveal.
   ========================================================================= */

/* Single source of truth — cohort dataset */
window.WHOLLAR_COHORTS = [
  {
    id: 'WHL-ON-001', name: 'Beacon Hill / Cardinal Heights',
    fsas: ['K1J','K1K'], verified: 87, threshold: 150, pct: 58,
    avgBill: 92, status: 'OPEN', bidders: 3,
    deadlineDays: 5,
    providerMix: [{name:'Rogers',pct:61},{name:'Bell',pct:27},{name:'Other',pct:12}],
    contractEnd: 'Q3 2026'
  },
  {
    id: 'WHL-ON-002', name: 'Orléans',
    fsas: ['K1C','K4A'], verified: 112, threshold: 150, pct: 75,
    avgBill: 85, status: 'FORMING',
    providerMix: [{name:'Bell',pct:65},{name:'Rogers',pct:22},{name:'Other',pct:13}],
    contractEnd: 'Q3 2026'
  },
  {
    id: 'WHL-ON-003', name: 'Barrhaven',
    fsas: ['K2J'], verified: 41, threshold: 150, pct: 27,
    avgBill: 98, status: 'FORMING',
    providerMix: [{name:'Rogers',pct:58},{name:'Bell',pct:30},{name:'Other',pct:12}],
    contractEnd: 'Q4 2026'
  }
];

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
