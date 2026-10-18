/* ==========================================================================
   ماه‌رخ — js/shop/flash.js
   ردیف افقی «حراج ویژه» با اسکرول‌اسنپ و دکمه‌های قبلی/بعدی.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('flash', function () {
    var track = M.$('#flashTrack');
    if (!track) return;

    var list = M.data.products
      .filter(function (p) { return p.flash && p.stock > 0; })
      .sort(function (a, b) { return b.flash - a.flash; });

    track.innerHTML = list.map(function (p) { return M.cardHTML(p, { flash: true }); }).join('');

    function scrollBy(dir) {
      var card = track.firstElementChild;
      var w = card ? card.getBoundingClientRect().width + 18 : 280;
      /* در راست‌به‌چپ، حرکت به «بعدی» یعنی scrollLeft منفی‌تر */
      track.scrollBy({ left: dir * -w * 1.5, behavior: M.prefersReduced ? 'auto' : 'smooth' });
    }

    var prev = M.$('#flashPrev');
    var next = M.$('#flashNext');
    if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
    if (next) next.addEventListener('click', function () { scrollBy(1); });
  });
})();
