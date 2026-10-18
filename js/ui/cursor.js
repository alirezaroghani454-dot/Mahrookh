/* ==========================================================================
   ماه‌رخ — js/ui/cursor.js
   درخشش نرمی که به نشانگر موشواره می‌چسبد (فقط دستگاه‌های دارای ماوس).
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('cursor', function () {
    var glow = M.$('#cursorGlow');
    if (!glow || M.isTouch || M.prefersReduced) return;

    var tx = 0, ty = 0, x = 0, y = 0, running = false;

    function frame() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      glow.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) requestAnimationFrame(frame);
      else running = false;
    }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add('is-on');
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });

    document.addEventListener('mouseleave', function () { glow.classList.remove('is-on'); });
  });
})();
