/* ==========================================================================
   ماه‌رخ — js/ui/header.js
   رفتار هدر و ناوبری: شیشه‌ای‌شدن هنگام اسکرول، پنهان‌شدن با اسکرول به پایین،
   نوار پیشرفت اسکرول، دکمهٔ بازگشت به بالا، لینک فعال منو، نوار اعلان چرخان.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('header', function () {
    var header = M.$('#header');
    var progress = M.$('#scrollProgress');
    var toTop = M.$('#toTop');
    var lastY = window.scrollY || 0;

    /* ---------- اسکرول ---------- */
    var onScroll = M.rafThrottle(function () {
      var y = window.scrollY || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (header) {
        header.classList.toggle('is-stuck', y > 40);
        var down = y > lastY + 4;
        var up = y < lastY - 4;
        if (y > 500 && down && !M.overlay.current()) header.classList.add('is-hidden');
        else if (up || y <= 500) header.classList.remove('is-hidden');
      }
      lastY = y;

      if (progress) progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      if (toTop) toTop.classList.toggle('is-on', y > 700);
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: M.prefersReduced ? 'auto' : 'smooth' });
      });
    }

    /* ---------- لینک فعال بر اساس بخش دیده‌شده ---------- */
    var ids = ['categories', 'flash', 'shop', 'quiz', 'magazine', 'contact'];
    var navLinks = M.$$('.nav__link');
    var bottomBtns = M.$$('.bottom-nav__btn[data-nav]');

    function setActive(id) {
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      var key = id === 'categories' ? 'categories' : (id === 'shop' || id === 'flash') ? 'shop' : id === 'top' ? 'top' : '';
      bottomBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-nav') === key); });
    }
    setActive('top');

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ids.concat(['top']).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }

    /* ---------- نوار اعلان ---------- */
    var bar = M.$('#announce');
    var msg = M.$('#announceMsg');
    var closeBtn = M.$('#announceClose');
    var msgs = M.data.announce || [];
    var idx = 0;

    try {
      if (sessionStorage.getItem('mahrokh:announce') === 'closed' && bar) bar.classList.add('is-closed');
    } catch (e) { /* نادیده */ }

    if (closeBtn && bar) {
      closeBtn.addEventListener('click', function () {
        bar.classList.add('is-closed');
        try { sessionStorage.setItem('mahrokh:announce', 'closed'); } catch (e) { /* نادیده */ }
      });
    }

    if (msg && msgs.length > 1 && !M.prefersReduced) {
      setInterval(function () {
        if (document.hidden) return;
        msg.classList.add('is-out');
        setTimeout(function () {
          idx = (idx + 1) % msgs.length;
          msg.textContent = msgs[idx];
          msg.classList.remove('is-out');
        }, 420);
      }, 5200);
    }
  });
})();
