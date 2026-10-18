/* ==========================================================================
   ماه‌رخ — js/features/newsletter.js
   عضویت در خبرنامه با اعتبارسنجی ایمیل.
   ⚠ فعلاً ایمیل فقط در مرورگر ذخیره می‌شود. برای راه‌اندازی واقعی، تابع
   subscribe را به سرویس ایمیل (یا API بک‌اند) وصل کنید.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  function subscribe(email) {
    var list = M.store.get('newsletter', []);
    if (list.indexOf(email) === -1) list.push(email);
    M.store.set('newsletter', list);
  }

  M.register('newsletter', function () {
    var form = M.$('#newsForm');
    var input = M.$('#newsEmail');
    var msg = M.$('#newsMsg');
    if (!form || !input || !msg) return;

    function show(text, ok) {
      msg.textContent = text;
      msg.className = 'news__msg ' + (ok ? 'ok' : 'err');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        show('ایمیل را درست وارد کن؛ مثلاً name@example.com', false);
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      subscribe(email);
      input.value = '';
      show('عضویتت ثبت شد. ممنون که با ماه‌رخ همراهی.', true);
      M.toast('عضویت در خبرنامه انجام شد');
    });

    input.addEventListener('input', function () {
      if (msg.textContent) { msg.textContent = ''; msg.className = 'news__msg'; }
    });
  });
})();
