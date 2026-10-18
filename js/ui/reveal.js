/* ==========================================================================
   ماه‌رخ — js/ui/reveal.js
   - شکستن تیتر هیرو به کلمه‌ها برای انیمیشن ورود
   - ظاهرشدن عنصرهای data-reveal هنگام اسکرول
   - شمارندهٔ عددی [data-count-to]
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  function splitTitle() {
    var t = M.$('#heroTitle');
    if (!t) return;
    var text = t.textContent.trim();
    t.setAttribute('aria-label', text);
    t.innerHTML = text.split(/\s+/).map(function (w, i) {
      return '<span class="w" aria-hidden="true" style="--w:' + i + '">' + M.esc(w) + '</span>';
    }).join(' ');
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (M.prefersReduced) { el.textContent = M.fmt(target) + suffix; return; }

    var dur = 1700;
    var t0 = performance.now();
    function frame(now) {
      var k = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 4);
      el.textContent = M.fmt(target * eased) + (k >= 1 ? suffix : '');
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  M.register('reveal', function () {
    splitTitle();

    var revealEls = M.$$('[data-reveal]');
    var counters = M.$$('[data-count-to]');

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
      counters.forEach(countUp);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        co.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  });
})();
