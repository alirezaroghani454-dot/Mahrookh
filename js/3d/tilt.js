/* ==========================================================================
   ماه‌رخ — js/3d/tilt.js
   افکت سه‌بعدی روی کارت محصول: کج‌شدن به سمت ماوس، حرکت عمقی تصویر و
   درخششِ نور. با delegation کار می‌کند، پس برای کارت‌های بعداً ساخته‌شده هم فعال است.
   فقط ماوس (روی لمسی بی‌اثر است).
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var cur = null;

  function reset(el) {
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
    el.style.setProperty('--glare', '0');
  }

  M.register('tilt', function () {
    if (M.isTouch || M.prefersReduced) return;

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var el = e.target.closest ? e.target.closest('.pcard__media') : null;

      if (cur && cur !== el) { reset(cur); cur = null; }
      if (!el) return;
      cur = el;

      var r = el.getBoundingClientRect();
      var x = M.clamp((e.clientX - r.left) / r.width, 0, 1);
      var y = M.clamp((e.clientY - r.top) / r.height, 0, 1);

      el.classList.add('is-tilting');
      el.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--mx', ((x - 0.5) * 2).toFixed(3));
      el.style.setProperty('--my', ((y - 0.5) * 2).toFixed(3));
      el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      el.style.setProperty('--glare', '1');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      if (cur) { reset(cur); cur = null; }
    });
  });
})();
