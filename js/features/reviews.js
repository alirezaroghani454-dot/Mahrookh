/* ==========================================================================
   ماه‌رخ — js/features/reviews.js
   اسلایدر نظرات مشتریان: دکمه‌ها، نقطه‌ها، کشیدن با انگشت/ماوس و پخش خودکار
   (با توقف هنگام قرارگرفتن ماوس یا فوکوس).
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('reviews', function () {
    var track = M.$('#reviewTrack');
    var dotsEl = M.$('#reviewDots');
    var viewport = M.$('#revViewport');
    var prev = M.$('#reviewPrev');
    var next = M.$('#reviewNext');
    if (!track || !dotsEl || !viewport) return;

    var list = M.data.reviews;
    var n = list.length;
    var idx = 0;
    var timer = null;
    var paused = false;

    track.innerHTML = list.map(function (r, i) {
      return '<article class="review" role="group" aria-roledescription="اسلاید" aria-label="' + M.toFa(i + 1) + ' از ' + M.toFa(n) + '">' +
        M.starsHTML(r.rate) +
        '<blockquote class="review__quote">«' + M.esc(r.text) + '»</blockquote>' +
        '<div class="review__who"><span class="review__avatar" aria-hidden="true">' + M.esc(r.name.charAt(0)) + '</span>' +
        '<div><div class="review__name">' + M.esc(r.name) + '</div>' +
        '<div class="review__meta">' + M.esc(r.city) + '، خریدار ' + M.esc(r.product) + '</div></div></div></article>';
    }).join('');

    dotsEl.innerHTML = list.map(function (_, i) {
      return '<button type="button" data-dot="' + i + '" aria-label="نظر ' + M.toFa(i + 1) + '"></button>';
    }).join('');

    var slides = M.$$('.review', track);
    var dots = M.$$('button', dotsEl);

    function go(i) {
      idx = ((i % n) + n) % n;
      track.style.transform = 'translateX(' + (idx * 100) + '%)';
      dots.forEach(function (d, k) {
        if (k === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k === idx ? 'false' : 'true'); });
    }

    function play() {
      stop();
      if (M.prefersReduced) return;
      timer = setInterval(function () { if (!paused && !document.hidden) go(idx + 1); }, 7000);
    }
    function stop() { clearInterval(timer); }

    if (prev) prev.addEventListener('click', function () { go(idx - 1); play(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); play(); });
    dotsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dot]');
      if (b) { go(parseInt(b.getAttribute('data-dot'), 10)); play(); }
    });

    viewport.addEventListener('mouseenter', function () { paused = true; });
    viewport.addEventListener('mouseleave', function () { paused = false; });
    viewport.addEventListener('focusin', function () { paused = true; });
    viewport.addEventListener('focusout', function () { paused = false; });

    /* کشیدن: در راست‌به‌چپ، کشیدن به راست = نظر بعدی */
    var startX = null;
    viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    window.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) { go(dx > 0 ? idx + 1 : idx - 1); play(); }
    });

    go(0);
    play();
  });
})();
