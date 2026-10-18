/* ==========================================================================
   ماه‌رخ — js/ui/theme.js
   تم روشن و تاریک. انتخاب کاربر در localStorage («mahrokh:theme») ذخیره می‌شود
   و اسکریپت کوچک داخل <head> آن را پیش از رندر اعمال می‌کند تا صفحه چشمک نزند.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('theme', function () {
    var root = document.documentElement;

    function apply(theme, persist) {
      root.setAttribute('data-theme', theme);
      if (persist) {
        try { localStorage.setItem('mahrokh:theme', theme); } catch (e) { /* نادیده */ }
      }
      M.bus.emit('theme', theme);
    }

    function toggle() {
      apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    }

    var btn = M.$('#themeBtn');
    var menuBtn = M.$('#menuTheme');
    if (btn) btn.addEventListener('click', toggle);
    if (menuBtn) menuBtn.addEventListener('click', toggle);
  });
})();
