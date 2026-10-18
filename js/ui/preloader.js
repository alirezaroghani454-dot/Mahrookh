/* ==========================================================================
   ماه‌رخ — js/ui/preloader.js
   صفحهٔ پیش‌بارگذاری با «فازهای ماه». حداقل ~۱٫۳ ثانیه نمایش داده می‌شود و
   منتظر کامل‌شدن فونت‌ها و بارگذاری صفحه می‌ماند (با سقف زمانی).
   بعد از پایان، کلاس is-ready روی body می‌آید و انیمیشن ورود هیرو شروع می‌شود.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var p = 0;
  var timer = null;
  var finished = false;
  var t0 = Date.now();

  function setProgress(v) {
    p = Math.max(p, Math.min(1, v));
    var bar = M.$('#preBar');
    if (bar) bar.style.setProperty('--p', p.toFixed(3));
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function reveal() {
    var pre = M.$('#preloader');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    if (pre) pre.classList.add('is-done');
    M.bus.emit('ready');
  }

  M.preloader = {
    start: function () {
      timer = setInterval(function () { setProgress(p + (0.9 - p) * 0.08); }, 120);
    },

    finish: function () {
      if (finished) return;
      finished = true;

      var minWait = Math.max(0, 1300 - (Date.now() - t0));
      var fonts = (document.fonts && document.fonts.ready)
        ? Promise.race([document.fonts.ready, wait(1800)])
        : Promise.resolve();
      var loaded = document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise(function (resolve) {
            window.addEventListener('load', resolve, { once: true });
            setTimeout(resolve, 3000);
          });

      Promise.all([fonts, loaded, wait(minWait)]).then(function () {
        clearInterval(timer);
        setProgress(1);
        setTimeout(reveal, 260);
      });
    }
  };
})();
