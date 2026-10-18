/* ==========================================================================
   ماه‌رخ — js/features/countdown.js
   شمارندهٔ معکوس حراج تا پایان همین روز (نیمه‌شب به وقت دستگاه کاربر).
   هر عدد هنگام تغییر، با یک چرخش سه‌بعدی نمایش داده می‌شود.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('countdown', function () {
    var hEl = M.$('#cdH'), mEl = M.$('#cdM'), sEl = M.$('#cdS');
    if (!hEl || !mEl || !sEl) return;

    var last = {};

    function pad(n) { return M.toFa(n < 10 ? '0' + n : String(n)); }

    function set(el, key, val) {
      if (last[key] === val) return;
      last[key] = val;
      el.textContent = val;
      if (!M.prefersReduced) {
        el.classList.remove('tick');
        void el.offsetWidth;
        el.classList.add('tick');
      }
    }

    function update() {
      var now = new Date();
      var end = new Date(now);
      end.setHours(24, 0, 0, 0);
      var diff = Math.max(0, Math.floor((end - now) / 1000));
      set(hEl, 'h', pad(Math.floor(diff / 3600)));
      set(mEl, 'm', pad(Math.floor((diff % 3600) / 60)));
      set(sEl, 's', pad(diff % 60));
    }

    update();
    setInterval(update, 1000);
  });
})();
