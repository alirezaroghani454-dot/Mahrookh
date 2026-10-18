/* ==========================================================================
   ماه‌رخ — js/ui/toast.js
   اعلان‌های کوتاه پایین صفحه: M.toast('پیام', 'ok' | 'err', میلی‌ثانیه)
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.toast = function (msg, type, ms) {
    var host = M.$('#toasts');
    if (!host) return;
    type = type === 'err' ? 'err' : 'ok';

    var el = document.createElement('div');
    el.className = 'toast toast--' + type;
    el.setAttribute('role', type === 'err' ? 'alert' : 'status');
    el.innerHTML = M.icon(type === 'err' ? 'close' : 'check') + '<span>' + M.esc(msg) + '</span>';
    host.appendChild(el);

    /* حداکثر سه اعلان هم‌زمان */
    while (host.children.length > 3) host.removeChild(host.firstChild);

    setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 380);
    }, ms || 2800);
  };
})();
