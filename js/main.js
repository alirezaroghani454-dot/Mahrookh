/* ==========================================================================
   ماه‌رخ — js/main.js
   نقطهٔ ورود: نوار برندها را می‌سازد، همهٔ ماژول‌های ثبت‌شده را به ترتیب
   اجرا می‌کند (خطای یک ماژول بقیه را خراب نمی‌کند) و پیش‌بارگذاری را می‌بندد.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  function buildMarquee() {
    var track = M.$('#brandTrack');
    if (!track) return;
    var once = M.data.brands.map(function (b) { return '<span class="marquee__item">' + M.esc(b) + '</span>'; }).join('');
    /* دو نیمهٔ یکسان برای حلقهٔ بی‌وقفه؛ هر نیمه خودش چند بار تکرار شده تا صفحهٔ عریض را پر کند */
    var half = once + once;
    track.innerHTML = half + half;
  }

  function run() {
    M.preloader.start();
    buildMarquee();

    M._mods.forEach(function (m) {
      try { m.fn(); }
      catch (err) { console.error('[ماه‌رخ] خطا در ماژول «' + m.name + '»:', err); }
    });

    M.preloader.finish();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
